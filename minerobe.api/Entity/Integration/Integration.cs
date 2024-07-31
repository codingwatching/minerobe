﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using minerobe.api.Extensions;

namespace minerobe.api.Entity.Integration
{
    public class IntegrationItem
    {
        public Guid Id { get; set; }
        public string Type { get; set; }
        public Guid OwnerId { get; set; }
        public dynamic Data { get; set; }
    }
    public class IntegrationConfig : IEntityTypeConfiguration<IntegrationItem>
    {
        public void Configure(EntityTypeBuilder<IntegrationItem> builder)
        {
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.OwnerId).IsRequired();
            builder.Property(x => x.Data).StoreAsJSON();
            builder.ToTable("Integration");
        }
    }
}
