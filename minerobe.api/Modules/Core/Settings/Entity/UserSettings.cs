﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using minerobe.api.Extensions;
using minerobe.api.Modules.Core.Package.Entity;

namespace minerobe.api.Modules.Core.Settings.Entity
{
    public class UserSettings
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public string Theme { get; set; }
        public Guid? CurrentTexturePackageId { get; set; }
        public TextureRenderConfig CurrentTexture { get; set; }
        public OutfitPackage BaseTexture { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public List<IntegrationMatching> Integrations { get; set; }
    }
    public class TextureRenderConfig
    {
        public byte[] Texture { get; set; }
        public ModelType Model { get; set; }
        public bool IsFlat { get; set; }
        public Guid? CapeId { get; set; }
    }
    public class IntegrationMatching
    {
        public Guid Id { get; set; }
        public string Type { get; set; }
    }
    public class UserSettingsConfig : IEntityTypeConfiguration<UserSettings>
    {
        public void Configure(EntityTypeBuilder<UserSettings> builder)
        {
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.BaseTexture).StoreAsJSON();
            builder.Property(x => x.OwnerId).IsRequired();
            builder.Property(x => x.CreatedAt).HasDefaultValueSql("getdate()");
            builder.Property(x => x.CurrentTexture).StoreAsJSON();
            builder.Property(x => x.Integrations).StoreAsJSON();
        }
    }
    public static class UserSettingsExtension
    {
        public static bool ContainsIntegration(this UserSettings settings, string type)
        {
            return settings.Integrations.Any(x => x.Type.ToLower() == type.ToLower());
        }
    }
}
