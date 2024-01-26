import { OutfitPackageQueryData, type OutfitPackage } from "$src/data/common";
import { PACKAGE_TYPE } from "$src/data/consts";
import {
  DeleteDocument,
  SetDocument,
  UpdateDocument,
  UpdateRawDocument,
} from "$src/data/firebase";
import { FindColorTitle } from "$src/helpers/colorHelper";

const QUERY_PATH = "query";
export let CreateQueryDataFromPackage = async (pack: OutfitPackage) => {
  if (pack.type == PACKAGE_TYPE.OUTFIT_SET) {
    const qd = new OutfitPackageQueryData();
    qd.id = pack.id;
    qd.name = pack.name;
    qd.description = pack.description;
    qd.type = pack.type;
    qd.likes = pack.social.likes;
    qd.isFeatured = pack.social.isFeatured;
    qd.downloads = pack.social.downloads || 0;
    qd.outfitType = pack.outfitType;
    qd.isShared = pack.isShared;
    qd.variantId = "none";
    qd.model = pack.model;
    qd.publisherId = pack.publisher.id;
    qd.createdAt = pack.createdAt;
    qd.modifiedAt = pack.modifiedAt;
    return [qd];
  }
  if (pack.type == PACKAGE_TYPE.OUTFIT) {
    const qds = [];
    const qd = new OutfitPackageQueryData();
    qd.id = pack.id;
    qd.name = pack.name;
    qd.description = pack.description;
    qd.type = pack.type;
    qd.likes = pack.social.likes;
    qd.isFeatured = pack.social.isFeatured;
    qd.downloads = pack.social.downloads || 0;
    qd.outfitType = pack.outfitType;
    qd.variantCount = pack.layers.length;
    qd.isShared = pack.isShared;
    qd.model = pack.model;
    qd.variantId = "none";
    qd.publisherId = pack.publisher.id;
    qd.createdAt = pack.createdAt;
    qd.modifiedAt = pack.modifiedAt;
    qds.push(qd);
    for (const l of pack.layers) {
      const qdl = new OutfitPackageQueryData();
      qdl.name = pack.name;
      qdl.id = pack.id;
      qdl.description = pack.description;
      qdl.color = l.steve.color;
      qdl.type = pack.type;
      qdl.likes = pack.social.likes;
      qdl.isFeatured = pack.social.isFeatured;
      qdl.downloads = pack.social.downloads || 0;
      qdl.outfitType = pack.outfitType;
      qdl.normalizedColor = FindColorTitle(l.steve.color);
      qdl.variantId = l.variantId;
      qdl.isShared = pack.isShared;
      qdl.model = pack.model;
      qdl.publisherId = pack.publisher.id;
      qdl.createdAt = pack.createdAt;
      qdl.modifiedAt = pack.modifiedAt;
      qds.push(qdl);
    }
    return qds;
  }
};
export const UploadQueryData = async (pack: OutfitPackage) => {
  const qds = await CreateQueryDataFromPackage(pack);
  const prefix = (pack.type == PACKAGE_TYPE.OUTFIT_SET ? "1" : "0") + "-";
  for (const qd of qds) {
    await SetDocument(
      QUERY_PATH,
      prefix + pack.id + (qd.variantId!="none" ? "-" + qd.variantId : ""),
      qd
    );
  }
};
export const UploadPartialQueryData = async function (
  id: string,
  type: string,
  data: any
) {
  const prefix = (type == PACKAGE_TYPE.OUTFIT_SET ? "1" : "0") + "-";
  const res = await UpdateDocument(QUERY_PATH, prefix + id, data);
};
export const DeleteQueryData = async (pack: OutfitPackage) => {
  const qds = await CreateQueryDataFromPackage(pack);
  const prefix = (pack.type == PACKAGE_TYPE.OUTFIT_SET ? "1" : "0") + "-";
  for (const qd of qds) {
    await DeleteDocument(
      QUERY_PATH,
      prefix + pack.id + (qd.variantId!="none" ? "-" + qd.variantId : "")
    );
  }
}
export const UploadPartialQueryDataRaw = async function (
  id: string,
  type: string,
  data: any
) {
  const prefix = (type == PACKAGE_TYPE.OUTFIT_SET ? "1" : "0") + "-";
  const res = await UpdateRawDocument(QUERY_PATH, prefix + id, data);
};
