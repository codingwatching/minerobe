import {
  DeleteOutfit,
  FetchOutfitByFilter,
  FetchRawOutfit,
  UploadOutfit,
} from "$src/api/outfits";
import { DeleteOutfitSet, UploadOutfitSet } from "$src/api/sets";
import { AddLike, RemoveLike } from "$src/api/social";
import { wardrobe } from "$src/data/cache";
import { OutfitPackage } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import { QueryWhere } from "$src/data/firebase";
import { get } from "svelte/store";

//sharing
export const ShareItem = async function (item) {
  item.isShared = true;
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    await UploadOutfitSet(item);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    await UploadOutfit(item);
  }
};
export const UnshareItem = async function (item) {
  item.isShared = false;
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    await UploadOutfitSet(item);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    await UploadOutfit(item);
  }
};

//helpers
export const RemoveItem = function (item: OutfitPackage) {
  if (get(wardrobe).studio.id == item.id) {
    wardrobe.update((wardrobe) => {
      wardrobe.studio = null;
      return wardrobe;
    });
  }
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) DeleteOutfitSet(item);
  if (item.type == PACKAGE_TYPE.OUTFIT) DeleteOutfit(item);
  if (IsItemInWardrobe(item, get(wardrobe)))
    RemoveItemFromWardrobe(item.id, item.type);
};

//wardrobe
export const UpdateItemInWardrobe = function (item: OutfitPackage) {
  let wardrobeObj = get(wardrobe);
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    wardrobeObj.sets = wardrobeObj.sets.map((set) =>
      set.id == item.id ? item : set
    );
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    wardrobeObj.outfits = wardrobeObj.outfits.map((outfit) =>
      outfit.id == item.id ? item : outfit
    );
  }
  wardrobe.set(wardrobeObj);
};
export const FetchFullWardrobe = async function () {
  let wardrobeObj = get(wardrobe);
  for (let i = 0; i < wardrobeObj.outfits.length; i++) {
    let outfit = await FetchRawOutfit(wardrobeObj.outfits[i].id);
    wardrobeObj.outfits[i] = outfit;
  }
  return wardrobeObj;
};
export const AddItemToWardrobe = function (item: OutfitPackage) {
  let wardrobeObj = get(wardrobe);
  if (!IsItemInWardrobe(item, wardrobeObj)) {
    AddLike(item.id, item.type);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    wardrobeObj.sets.push(item);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    wardrobeObj.outfits.push(item);
  }
  wardrobe.set(wardrobeObj);
  return true;
};
export const RemoveItemFromWardrobe = function (id, type) {
  let wardrobeObj = get(wardrobe);
  if (type == PACKAGE_TYPE.OUTFIT_SET) {
    wardrobeObj.sets = wardrobeObj.sets.filter((set) => set?.id != id);
  }
  if (type == PACKAGE_TYPE.OUTFIT) {
    wardrobeObj.outfits = wardrobeObj.outfits.filter(
      (outfit) => outfit?.id != id
    );
    return false;
  }
  RemoveLike(id, type);
  wardrobe.update((wardrobe) => {
    wardrobe.sets = wardrobeObj.sets;
    wardrobe.outfits = wardrobeObj.outfits;
    return wardrobe;
  });
};
export const IsItemInWardrobe = function (item, wardrobe) {
  if (item.type == PACKAGE_TYPE.OUTFIT_SET) {
    return wardrobe.sets.some((set) => set.id == item.id);
  }
  if (item.type == PACKAGE_TYPE.OUTFIT) {
    return wardrobe.outfits.some((outfit) => outfit.id == item.id);
  }
  return false;
};
export const FetchWardrobeOutfitsByCategory = async function (category) {
  let outfitsIds = get(wardrobe).outfits.map((outfit) => outfit.id);
  let clauses =
    category == "ALL"
      ? []
      : [new QueryWhere("outfitType", "==", category.toLowerCase())];
  let outfits = await FetchOutfitByFilter(outfitsIds, clauses);
  return outfits;
};
export const SplitOutfitPackage = function (pack: OutfitPackage) {
  let splited = [];
  pack.layers.forEach((layer) => {
    let outfit = Object.assign({}, pack);
    outfit.layers = [layer];
    splited.push(outfit);
  });
  return splited;
};
export const SplitOutfitPackages = function (packs: OutfitPackage[]) {
  let splited = [];
  packs.forEach((pack) => {
    splited = splited.concat(SplitOutfitPackage(pack));
  });
  return splited;
};
