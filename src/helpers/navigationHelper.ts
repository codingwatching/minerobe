import { OutfitPackageLink, type OutfitPackage } from "$src/data/common";
import { goto } from "$app/navigation";
import { wardrobe } from "$src/data/cache";
import { OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/consts";

export const navigateToDesign = function (packag: OutfitPackage) {
  wardrobe.update((wardrobe) => {
    wardrobe.studio = new OutfitPackageLink(
      packag.id,
      packag.model,
      packag.type == PACKAGE_TYPE.OUTFIT_SET
        ? PACKAGE_TYPE.OUTFIT_SET_LINK
        : PACKAGE_TYPE.OUTFIT_LINK
    );
    return wardrobe;
  });
  goto(`/design`);
};
export const navigateToWardrobe = function () {
  goto(`/wardrobe`);
};
export const navigateToOutfitPackage = function (packag: OutfitPackage,variantId?:string) {
  goto(`/design/${packag.type==OUTFIT_TYPE.OUTFIT_SET? PACKAGE_TYPE.OUTFIT_SET:PACKAGE_TYPE.OUTFIT}/${packag.id}/${variantId?variantId:packag.layers[0].variantId}`);
}
export const navigate = function (path: string) {
  goto(path);
};
