﻿using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using minerobe.api.Configuration;
using minerobe.api.Entity.User;
using minerobe.api.Services.Interface;
using minerobe.api.Entity.Integration;
using minerobe.api.Database;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;
using System.Text;
using minerobe.api.Entity.Package;
using Newtonsoft.Json;
using minerobe.api.Helpers;
using minerobe.api.Entity.Settings;
namespace minerobe.api.Services.Integration
{
    public class JavaXboxAuthService : IJavaXboxAuthService
    {
        private readonly MicrosoftAuthConfig _config;
        private readonly IUserSettingsService _userSettingsService;
        private readonly BaseDbContext _ctx;
        public JavaXboxAuthService(IOptions<MicrosoftAuthConfig> options, BaseDbContext ctx, IUserSettingsService userSettingsService)
        {
            _config = options.Value;
            _ctx = ctx;
            _userSettingsService = userSettingsService;
        }
        public async Task<JavaXboxProfile> LinkAccount(MinerobeUser user)
        {
            await UnLinkAccount(user);
            var auth = await Authenticate();

            if (auth != null)
            {
                var profile = new JavaXboxProfile();
                profile.Id = Guid.NewGuid();
                profile.AccountId = auth.AccountId;
                profile.Profile = await GetProfileData(auth.Token);
                

                var integration = new IntegrationItem()
                {
                    Id = Guid.NewGuid(),
                    OwnerId = user.Id,
                    Type = "minecraft",
                    Data = profile
                };
                _ctx.Set<IntegrationItem>().Add(integration);

                await _ctx.SaveChangesAsync();
                await _userSettingsService.AddIntegration(user.Id, new IntegrationMatching()
                {
                    Id = integration.Id,
                    Type = "minecraft"
                });

                return profile;
            }

            return null;
        }
        public async Task<bool> UnLinkAccount(MinerobeUser user)
        {
            var profile = await _ctx.Set<IntegrationItem>().Where(x => x.OwnerId == user.Id && x.Type == "minecraft").FirstOrDefaultAsync();
            if (profile == null)
                return false;

            var profileData = ((object)profile.Data).ToClass<JavaXboxProfile>();

            var pca = await GetPca();
            var selectedAccount =await pca.GetAccountAsync(profileData.AccountId);
            if (selectedAccount == null)
                return false;

            await pca.RemoveAsync(selectedAccount);

            if (profile != null)
                _ctx.Set<IntegrationItem>().Remove(profile);

            await _ctx.SaveChangesAsync();
            await _userSettingsService.RemoveIntegration(user.Id, "minecraft");
            return true;
        }
        public async Task<string> RefreshAllTokens()
        {
            var pca = await GetPca();
            var accountsEnum = await pca.GetAccountsAsync();
            var accounts = accountsEnum.ToList();
            var result = "";
            for(int i = 0; i < accounts.Count; i++)
            {
                var account = accounts.ElementAt(i);
               result+= await Refresh(account.HomeAccountId.Identifier)+", ";
            }
            return $"Refreshed: ({accounts.Count}) - {result}";
        }

        //requests
        private async Task<ProfileData> GetProfileData(string token)
        {
            var profile = new ProfileData();

            var url = "https://api.minecraftservices.com/minecraft/profile";
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await client.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(content);

            profile.UUID = json["id"].ToString();
            profile.Username = json["name"].ToString();
            profile.Skins = new List<JavaXboxSkin>();
            profile.Capes = new List<JavaXboxCape>();

            var dataClient = new HttpClient();
            if (json["skins"] != null)
            {
                foreach (var skin in json["skins"])
                {
                    var skinData = new JavaXboxSkin();
                    //get texture from url
                    var textureUrl = skin["url"].ToString();
                    var textureResponse = await dataClient.GetAsync(textureUrl);
                    var textureContent = await textureResponse.Content.ReadAsByteArrayAsync();
                    skinData.Texture = "data:image/png;base64," + Convert.ToBase64String(textureContent);
                    skinData.Id = Guid.Parse(skin["id"].ToString());
                    profile.Skins.Add(skinData);
                    if (skin["state"].ToString().ToUpper() == "ACTIVE")
                    {
                        profile.CurrentSkinId = skinData.Id;
                    }
                }
            }
            if (json["capes"] != null)
            {
                foreach (var cape in json["capes"])
                {
                    var capeData = new JavaXboxCape();
                    //get texture from url
                    var textureUrl = cape["url"].ToString();
                    var textureResponse = await client.GetAsync(textureUrl);
                    var textureContent = await textureResponse.Content.ReadAsByteArrayAsync();
                    capeData.Texture = "data:image/png;base64," + Convert.ToBase64String(textureContent);
                    capeData.Id = Guid.Parse(cape["id"].ToString());
                    capeData.Name = cape["alias"].ToString();
                    profile.Capes.Add(capeData);
                    if (cape["state"].ToString().ToUpper() == "ACTIVE")
                    {
                        profile.CurrentCapeId = capeData.Id;
                    }
                }
            }
            return profile;
        }
        public async Task<JavaXboxProfile> GetProfile(MinerobeUser user)
        {
            var integrationprofile = await _ctx.Set<IntegrationItem>().Where(x => x.OwnerId == user.Id && x.Type == "minecraft").FirstOrDefaultAsync();
            if (integrationprofile == null)
                return null;

            var data = ((object)integrationprofile.Data).ToClass<JavaXboxProfile>();
            var token = await GetTokenFromCache(data.AccountId);
            var profile = await GetProfileData(token);
            
            data.Profile = profile;
            integrationprofile.Data = data;

            _ctx.Set<IntegrationItem>().Update(integrationprofile);
            await _ctx.SaveChangesAsync();
            return data;
        }

        public async Task<string> GetUserCurrentSkin(Guid userId)
        {
            var settings = await _ctx.UserSettings.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
            if (settings == null)
                return null;
            var texture = settings.CurrentTexture.Texture;
            return Encoding.UTF8.GetString(texture);
        }
        public async Task<bool> SetUserSkin(Guid userId, ModelType model)
        {
            var token = await GetTokenFromCacheByUserId(userId);
            var url = "https://api.minecraftservices.com/minecraft/profile/skins";
            var body = new
            {
                variant = model == ModelType.Steve ? "classic" : "slim",
                url = _config.OriginUri + "/JavaXboxAuth/SkinTexture/" + userId
            };
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await client.PostAsJsonAsync(url, body);
            return response.IsSuccessStatusCode;
        }
        public async Task<bool> SetUserCape(Guid userId, Guid capeId)
        {
            var token = await GetTokenFromCacheByUserId(userId);
            var url = "https://api.minecraftservices.com/minecraft/profile/capes/active";
            var body = new
            {
                capeId = capeId
            };
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await client.PutAsJsonAsync(url, body);
            return response.IsSuccessStatusCode;
        }
        public async Task<bool> HideUserCape(Guid userId)
        {
            var token = await GetTokenFromCacheByUserId(userId);
            var url = "https://api.minecraftservices.com/minecraft/profile/capes/active";
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await client.DeleteAsync(url);
            return response.IsSuccessStatusCode;
        }

        //helpers class
        public class FlowAuthentication
        {
            public string Token { get; set; }
            public string MsalToken { get; set; }
            public string AccountId { get; set; }
            public DateTime RetrievedAt { get; set; }
        }

        //authorize flow
        public async Task<FlowAuthentication> Authenticate()
        {
            IPublicClientApplication pca = await GetPca();

            var msalTokenRequest = await pca.AcquireTokenWithDeviceCode(new string[] { "XboxLive.SignIn", "XboxLive.offline_access" }, fallback =>
            {
                Console.WriteLine(fallback.UserCode);
                Console.WriteLine(fallback.VerificationUrl);
                return Task.FromResult(0);
            }).ExecuteAsync();

            var accountId = msalTokenRequest.Account.HomeAccountId.Identifier;
            var accounts = await pca.GetAccountsAsync();

            var msalToken = msalTokenRequest.AccessToken;
            var msalTokenExpireOn = msalTokenRequest.ExpiresOn;

            var xstsToken = await AuthorizeToXbox(msalToken);
            var token = xstsToken.token.ToString();
            var uhs = xstsToken.uhs.ToString();
            var accessToken = await AuthorizeToMinecraftServices(token, uhs);

            return new FlowAuthentication() { Token = accessToken, MsalToken = msalToken, RetrievedAt = DateTime.Now,AccountId=accountId };
        }
        private async Task<dynamic> AuthorizeToXbox(string token)
        {

            var xstsUrl = "https://user.auth.xboxlive.com/user/authenticate";
            var xtstBody = new
            {
                RelyingParty = "http://auth.xboxlive.com",
                TokenType = "JWT",
                Properties = new
                {
                    AuthMethod = "RPS",
                    SiteName = "user.auth.xboxlive.com",
                    RpsTicket = "d=" + token
                }
            };
            var xstsClient = new HttpClient();
            var xstsResponse = await xstsClient.PostAsync(xstsUrl, new StringContent(JsonConvert.SerializeObject(xtstBody), Encoding.UTF8, "application/json"));
            var xstsContent = await xstsResponse.Content.ReadAsStringAsync();
            var xstsJson = JObject.Parse(xstsContent);
            var xstsToken = xstsJson["Token"].ToString();

            //aquire xsts token
            var xstsAuthorizeUrl = "https://xsts.auth.xboxlive.com/xsts/authorize";
            var xstsAuthorizeBody = new
            {
                RelyingParty = "rp://api.minecraftservices.com/",
                TokenType = "JWT",
                Properties = new
                {
                    SandboxId = "RETAIL",
                    UserTokens = new string[] { xstsToken }
                }
            };
            var xstsTokenClient = new HttpClient();
            var xstsTokenResponse = await xstsTokenClient.PostAsync(xstsAuthorizeUrl, new StringContent(JsonConvert.SerializeObject(xstsAuthorizeBody), Encoding.UTF8, "application/json"));
            var xstsTokenContent = await xstsTokenResponse.Content.ReadAsStringAsync();
            var xstsTokenJson = JObject.Parse(xstsTokenContent);
            var xstsAuthorizeToken = xstsTokenJson["Token"];
            var uhs = xstsTokenJson["DisplayClaims"]["xui"][0]["uhs"].ToString();

            return new { token = xstsAuthorizeToken, uhs = uhs };
        }
        private async Task<string> AuthorizeToMinecraftServices(string token, string uhs)
        {
            var url = "https://api.minecraftservices.com/authentication/login_with_xbox";
            var body = new
            {
                identityToken = "XBL3.0 x=" + uhs + ";" + token
            };
            var client = new HttpClient();
            var response = await client.PostAsync(url, new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json"));
            var content = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(content);
            var accessToken = json["access_token"].ToString();
            return accessToken;
        }

        //refresh flow
        public async Task<string> Refresh(string accountId)
        {
            var pca = await GetPca();
            var account = await pca.GetAccountAsync(accountId);
            if (account == null)
                return null;
            var token = await pca.AcquireTokenSilent(new string[] { "XboxLive.SignIn", "XboxLive.offline_access" }, account).ExecuteAsync();
            return token.ExpiresOn.ToString();
        }
       
        //token cache
        public async Task<string> GetTokenFromCache(string accountId)
        {
            var pca = await GetPca();
            var account = await pca.GetAccountAsync(accountId);
            if (account == null)
                return null;
            var token = await pca.AcquireTokenSilent(new string[] { "XboxLive.SignIn", "XboxLive.offline_access" }, account).ExecuteAsync();

            var msalToken = token.AccessToken;
            var msalTokenExpireOn = token.ExpiresOn;

            var xstsToken = await AuthorizeToXbox(msalToken);
            var xsts = xstsToken.token.ToString();
            var uhs = xstsToken.uhs.ToString();
            var accessToken = await AuthorizeToMinecraftServices(xsts, uhs);
            return accessToken;
        }
        public async Task<string> GetTokenFromCacheByUserId(Guid userId)
            {
            var profile = await _ctx.Set<IntegrationItem>().Where(x => x.OwnerId == userId && x.Type == "minecraft").FirstOrDefaultAsync();
            if (profile == null)
                return null;
            var profileData = ((object)profile.Data).ToClass<JavaXboxProfile>();
            return await GetTokenFromCache(profileData.AccountId);
        }
    
        //pca helper
        public async Task<IPublicClientApplication> GetPca()
        {
            return PublicClientApplicationBuilder.Create(_config.ClientId).WithAuthority("https://login.microsoftonline.com/consumers").WithDefaultRedirectUri().WithCacheOptions(CacheOptions.EnableSharedCacheOptions).Build();
        }
    }
}
