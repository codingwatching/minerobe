import { COLOR_TYPE, MODEL_TYPE, OUTFIT_TYPE } from "$src/data/consts";
import { RenderTextureInTemporyNode } from "$src/data/render";
import { FileData, OutfitLayer, OutfitPackage } from "$src/model/package";
import { get } from "svelte/store";
import {
  FindClosestColor,
  GetDominantColorFromImage,
} from "../image/colorHelper";
import { MergePackageLayers } from "../image/imageDataHelpers";
import { currentUser } from "$src/data/cache";

export const AddLayerSnapshot = async function (oldLayer: OutfitLayer) {
  const layer = Object.assign({}, oldLayer);
  const steve = layer.steve;
  const steveSnap = await RenderTextureInTemporyNode(
    steve.content,
    MODEL_TYPE.STEVE,
    layer.outfitType
  );
  const alex = layer.alex;
  const alexSnap = await RenderTextureInTemporyNode(
    alex.content,
    MODEL_TYPE.ALEX,
    layer.outfitType
  );
  const snapLayer = Object.assign({}, layer);
  snapLayer.steve.contentSnapshot = steveSnap;
  snapLayer.alex.contentSnapshot = alexSnap;
  return snapLayer;
};
export const GetMergedLayer = async function (pack: OutfitPackage) {
  const steve = await MergePackageLayers(pack.layers, MODEL_TYPE.STEVE);
  const color = await GetDominantColorFromImage(steve);
  const colorClossest = await FindClosestColor(color, COLOR_TYPE.STRING_COLOR);
  const steveFileData = new FileData(pack.name, steve);
  const alex = await MergePackageLayers(pack.layers, MODEL_TYPE.ALEX);
  const alexFileData = new FileData(pack.name, alex);
  const glob = new OutfitLayer(pack.name, steveFileData, alexFileData);
  glob.colorName = colorClossest.name;
  glob.outfitType = OUTFIT_TYPE.OUTFIT_SET;
  glob.sourcePackageId = pack.id;
  return glob;
};
export const CreateNewOutfitPackage = async function (
  name: string,
  type: string
) {
  const pack = new OutfitPackage(name, MODEL_TYPE.STEVE, [], type);
  pack.description = "";
  pack.publisherId = get(currentUser)?.id;
  return pack;
};
