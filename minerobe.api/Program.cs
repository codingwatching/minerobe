using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using minerobe.api.Database;
using minerobe.api.Services;
using minerobe.api.Services.Integration;
using minerobe.api.Services.Interface;
using minerobe.api.Services.View;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
//integrations
builder.Services.AddTransient<IJavaXboxAuthService, JavaXboxAuthService>();

builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<ISocialService, SocialService>();
builder.Services.AddTransient<IPackageService, PackageService>();
builder.Services.AddTransient<ICollectionService, CollectionService>();
builder.Services.AddTransient<IWardrobeService, WardrobeService>();
builder.Services.AddTransient<IUserSettingsService, UserSettingsService>();
builder.Services.AddTransient<ILandingViewService, LandingViewService>();


builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.Authority = builder.Configuration["Jwt:Authority"];
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateAudience = true,
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Authority"],
        ValidateLifetime = true,
        ValidAudience = builder.Configuration["Jwt:Audience"]
    };
});

builder.Services.AddControllers();
builder.Services.AddDbContext<BaseDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("BaseConnection")));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme()
    { 
        Name="Authorization",
        Type=Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme="Bearer",
        BearerFormat="JWT",
        In=Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description="JWT Authorization header using the Bearer scheme"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement()
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
