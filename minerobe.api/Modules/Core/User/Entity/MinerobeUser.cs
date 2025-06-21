﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace minerobe.api.Modules.Core.User.Entity
{
    public class MinerobeUser
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Avatar { get; set; }
        public Guid WardrobeId { get; set; }
        public bool IsAdmin { get; set; } = false;
    }
    public class MinerobeUserEntityConfig : IEntityTypeConfiguration<MinerobeUser>
    {
        public void Configure(EntityTypeBuilder<MinerobeUser> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedOnAdd().HasDefaultValueSql("newsequentialid()");
            builder.Property(x => x.Name).IsRequired();
            builder.Property(x => x.Avatar).IsRequired();
            builder.ToTable("Users");
        }
    }
}
