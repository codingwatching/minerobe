﻿using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Settings.Entity;
using minerobe.api.Modules.Core.Settings.Interface;

namespace minerobe.api.Modules.Core.Settings.Service
{
    public class UserSettingsService : IUserSettingsService
    {
        private readonly BaseDbContext _context;
        private readonly IPackageService _packageService;
        public UserSettingsService(BaseDbContext context, IPackageService packageService)
        {
            _context = context;
            _packageService = packageService;
        }
        public async Task<UserSettings> GetSettings(Guid userId)
        {
            var settings = await _context.UserSettings.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
            var defaultPackage = new OutfitPackage()
            {
                Model = ModelType.Steve,
                PublisherId = userId,
                Id = Guid.NewGuid(),
                Type = PackageType.Outfit,
                OutfitType = OutfitType.Default,
                Layers = new List<OutfitLayer>()
            };

            if (settings == null)
            {
                settings = new UserSettings
                {
                    OwnerId = userId,
                    Theme = "default",
                    BaseTexture = defaultPackage,
                    CurrentTexturePackageId = Guid.Empty
                };
                _context.UserSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            if (settings.BaseTexture == null)
            {
                settings.BaseTexture = defaultPackage;
                _context.UserSettings.Update(settings);
                await _context.SaveChangesAsync();
            }
            return settings;
        }
        public async Task<UserSettings> UpdateTheme(Guid userId, string theme)
        {
            var settings = await _context.UserSettings.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
            if (settings == null)
                return null;

            settings.Theme = theme;
            settings.ModifiedAt = DateTime.Now;

            _context.UserSettings.Update(settings);
            await _context.SaveChangesAsync();
            return await GetSettings(userId);
        }
        public async Task<UserSettings> UpdateBaseTexture(Guid userId, OutfitPackage basetexture)
        {
            var settings = await _context.UserSettings.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
            if (settings == null)
                return null;

            settings.BaseTexture = basetexture;
            settings.ModifiedAt = DateTime.Now;

            _context.UserSettings.Update(settings);
            await _context.SaveChangesAsync();
            return await GetSettings(userId);
        }
        public async Task<UserSettings> UpdateCurrentTexture(Guid userId, Guid packageId, TextureRenderConfig textureConfig)
        {
            var settings = await _context.UserSettings.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
            if (settings == null)
                return null;
            var package = await _packageService.GetById(packageId);
            if (package == null)
                return null;

            settings.CurrentTexture = textureConfig;

            settings.CurrentTexturePackageId = packageId;
            settings.ModifiedAt = DateTime.Now;
            _context.UserSettings.Update(settings);
            await _context.SaveChangesAsync();
            return await GetSettings(userId);
        }

        public async Task<UserSettings> AddIntegration(Guid userId, IntegrationMatching integration)
        {
            var settings = await _context.UserSettings.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
            if (settings == null)
                return null;

            if (settings.Integrations == null)
                settings.Integrations = new List<IntegrationMatching>();
            settings.Integrations.Add(integration);
            settings.ModifiedAt = DateTime.Now;

            _context.UserSettings.Update(settings);
            await _context.SaveChangesAsync();
            return await GetSettings(userId);
        }
        public async Task<UserSettings> RemoveIntegration(Guid userId, string integrationId)
        {
            var settings = await _context.UserSettings.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
            if (settings == null)
                return null;
            if (settings.Integrations != null)
            {
                var integration = settings.Integrations.FirstOrDefault(x => x.Type.ToLower() == integrationId.ToLower());
                if (integration != null)
                    settings.Integrations.Remove(integration);
            }
            settings.ModifiedAt = DateTime.Now;

            _context.UserSettings.Update(settings);
            await _context.SaveChangesAsync();
            return await GetSettings(userId);
        }
    }
}
