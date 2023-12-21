import { currentUser } from "$src/data/cache";
import {
  OutfitPackage,
  OutfitLayer,
  OutfitPackageLink,
  MinerobeUser,
  OutfitLayerLink,
  PackageSocialData,
  FileData,
} from "$src/data/common";
import { LAYER_TYPE, MODEL_TYPE, PACKAGE_TYPE } from "$src/data/consts";
import { GenerateIdForCollection } from "$src/data/firebase";
import { GetMinerobeUser } from "./auth";
import { FetchOutfitLayerFromLink } from "./outfits";
import { get } from "svelte/store";
import {
  CreatePackage,
  DeletePackage,
  FetchPackage,
  FetchPackageSnapshot,
  UploadPackage,
  UploadPackageSnapshot,
  _FetchPackage,
} from "./pack";
import { mergeImages } from "$src/helpers/imageMerger";

const SETS_PATH = "sets";
const SETS_LOCAL_PATH = "data";

export const GenerateIdForOutfitSet = () => GenerateIdForCollection(SETS_PATH);

export const ParseOutfitSetToLocal = async function (data: OutfitPackage) {
  data.layers = await Promise.all(
    data.layers.map(async (item) =>
      item.type == LAYER_TYPE.REMOTE
        ? await FetchOutfitLayerFromLink(item)
        : item
    )
  );
  data.layers = data.layers.filter((item) => item != null);
  data.publisher = await GetMinerobeUser(data.publisher.id);
  return data;
};
export const ParseOutfitSetToDatabase = function (
  pack: OutfitPackage,
  isNew: boolean = false
) {
  let data = Object.assign({}, pack) as OutfitPackage;
  if (!isNew) delete data.social;
  data.layers = data.layers.map((item) =>
    item.type == LAYER_TYPE.REMOTE
      ? (new OutfitLayerLink(item.id, item.variantId) as OutfitLayer)
      : item
  );
  data.publisher = new MinerobeUser(data.publisher.id, null, null);
  return data;
};
export const ParseOutfitSetSnapshotToDatabase = async function (
  pack: OutfitPackage
) {
  let item = Object.assign({}, pack) as OutfitPackage;
  let firstLayer = item.layers[0];
  if (firstLayer == null) return item;
  let mergedLayersALEX = await mergeImages(
    item.layers.map((x) => x[MODEL_TYPE.ALEX].content).reverse(),
    undefined,
    item.model
  );
  let mergedLayersSTEVE = await mergeImages(
    item.layers.map((x) => x[MODEL_TYPE.STEVE].content).reverse(),
    undefined,
    item.model
  );
  item.layers = [
    new OutfitLayer(
      firstLayer.name,
      new FileData(
        firstLayer.steve.fileName,
        mergedLayersSTEVE,
        firstLayer.steve.type
      ),
      new FileData(
        firstLayer.alex.fileName,
        mergedLayersALEX,
        firstLayer.alex.type
      ),
      firstLayer.variantId
    ),
  ];
  delete item.social;
  item.publisher = new MinerobeUser(item.publisher.id, null, null);
  return item;
};
export const UploadOutfitSet = async function (
  data: OutfitPackage,
  isNew = false
) {
  return await UploadPackage(
    SETS_PATH + "/" + data.id + "/" + SETS_LOCAL_PATH,
    data,
    isNew,
    ParseOutfitSetToDatabase,
    ParseOutfitSetSnapshotToDatabase
  );
};
export const FetchOutfitSet = async (id: string) =>
  await FetchPackage(
    SETS_PATH + "/" + id + "/" + SETS_LOCAL_PATH,
    ParseOutfitSetToLocal
  );
export const FetchOutfitSetFromLink = async function (link: OutfitPackageLink) {
  let data = await FetchOutfitSet(link.id);
  data.model = link.model;
  return data;
};
export const CreateOutfitSet = async function (
  addToWardrobe: boolean = false,
  isShared: boolean = false
) {
  let data = new OutfitPackage(
    "New Outfit set",
    MODEL_TYPE.ALEX,
    [],
    PACKAGE_TYPE.OUTFIT_SET,
    get(currentUser),
    GenerateIdForOutfitSet(),
    isShared,
    new PackageSocialData()
  );
  await CreatePackage(
    data,
    SETS_PATH + "/" + data.id + "/" + SETS_LOCAL_PATH,
    ParseOutfitSetToDatabase,
    ParseOutfitSetToDatabase,
    addToWardrobe
  );
  return data;
};
export const DeleteOutfitSet = async function (outfit: OutfitPackage) {
  await DeletePackage(
    outfit,
    SETS_PATH + "/" + outfit.id + "/" + SETS_LOCAL_PATH
  );
};
export const FetchOutfitSetSnapshot = async function (id: string) {
  return await FetchPackageSnapshot(
    SETS_PATH + "/" + id + "/" + SETS_LOCAL_PATH,
    ParseOutfitSetToLocal
  );
};
export const FetchOutfitSetSnapshotFromLink = async function (
  link: OutfitPackageLink
) {
  let data = await FetchOutfitSetSnapshot(link.id);
  data.model = link.model;
  return data;
};

export const UploadOutfitSetSnapshot = async function (pack) {
  return await UploadPackageSnapshot(
    SETS_PATH + "/" + pack.id + "/" + SETS_LOCAL_PATH,
    pack,
    ParseOutfitSetToDatabase
  );
};
