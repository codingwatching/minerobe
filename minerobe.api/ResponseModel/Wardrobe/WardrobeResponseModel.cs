﻿using minerobe.api.Entity.Package;
using minerobe.api.Entity.Wardrobe;
using minerobe.api.ResponseModel.Collection;
using minerobe.api.ResponseModel.Package;

namespace minerobe.api.ResponseModel.Wardrobe
{
    public class WardrobeResponseModel
    {
        public Guid Id { get; set; }
        public List<OutfitPackageListItemResponseModel> Outfits { get; set; }
        public List<OutfitPackageCollectionResponseModel> Collections { get; set; }
    }
    public static class WardrobeResponseModelExtensions
    {
        public static WardrobeResponseModel ToResponseModel(this Entity.Wardrobe.Wardrobe entity)
        {
            var outfits = entity.Outfits?.Select(x => x?.ToListItemResponseModel(2, true)).ToList();
            var collections = entity.Collections?.Select(x => x.ToResponseModel()).ToList();

            return new WardrobeResponseModel
            {
                Id = entity.Id,
                Outfits = outfits,
                Collections = collections
            };
        }
    }
}
