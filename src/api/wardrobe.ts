import { currentUser, wardrobe } from "$src/data/cache";
import {
  OutfitPackageLink,
  type OutfitPackage,
  WardrobePackage,
} from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import { GetDocument, SetDocument } from "$src/data/firebase";
import { get } from "svelte/store";
import { FetchOutfitSetFromLink, ParseOutfitSetToLocal } from "./sets";
import { FetchOutfitFromLink, ParseOutfitToLocal } from "./outfits";

const WARDROBE_PATH = "wardrobes";

export const ParseWardrobeToDatabase = function (pack: WardrobePackage) {
  let data = Object.assign({}, pack);
  data.sets = data.sets.map(
    (item) => new OutfitPackageLink(item.id, item.model) as OutfitPackage
  );
  data.outfits = data.outfits.map(
    (item) => new OutfitPackageLink(item.id, item.model) as OutfitPackage
  );
  if (data.studio?.id) {
    data.studio = new OutfitPackageLink(
      data.studio.id,
      data.studio.model,
      data.studio.type == PACKAGE_TYPE.OUTFIT_SET
        ? PACKAGE_TYPE.OUTFIT_SET_LINK
        : PACKAGE_TYPE.OUTFIT_LINK
    ) as OutfitPackage;
  }
  return data;
};
export const ParseWardrobeToLocal = async function (data: WardrobePackage) {
  const parsedSets = Promise.all(
    data.sets.map(
      async (item: OutfitPackageLink) => await FetchOutfitSetFromLink(item)
    )
  );
  const parsedOutfits = Promise.all(
    data.outfits.map(
      async (item: OutfitPackageLink) => await FetchOutfitFromLink(item)
    )
  );

  data.sets = await parsedSets;
  data.outfits = await parsedOutfits;

  if (data.studio?.id) {
    if (data.studio.type == PACKAGE_TYPE.OUTFIT_SET_LINK)
      data.studio = await FetchOutfitSetFromLink(data.studio);
    else data.studio = await FetchOutfitFromLink(data.studio);
  }
  return data;
};
export const FetchWardrobe = async function () {
  let dt = await GetDocument(WARDROBE_PATH, get(currentUser).id);
  if (dt == null) return new WardrobePackage("default_wardrobe", [], []);
  return ParseWardrobeToLocal(dt);
};
export const UploadWardrobe = async function (data: WardrobePackage) {
  await SetDocument(
    WARDROBE_PATH,
    get(currentUser).id,
    await ParseWardrobeToDatabase(data)
  );
};
