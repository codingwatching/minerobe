import { currentUser } from "$src/data/cache";
import { PackageSocialData, type OutfitPackage } from "$src/data/common";
import {
  BuildQuery,
  DeleteCollection,
  FetchDocsFromQuery,
  GetDocument,
  UpdateDocument,
} from "$src/data/firebase";
import { AddItemToWardrobe } from "$src/helpers/apiHelper";
import type { DocumentData, Query } from "firebase/firestore";
import { get } from "svelte/store";
import { FetchSocial } from "./social";
import { DeleteQueryData, UploadQueryData } from "./query";

const DATA_PATH = "itemdata";
const SNAPSHOT_PATH = "snapshot";
export const _FetchPackage = async function (path: string, onlyData = false) {
  let pack = (await GetDocument(path, DATA_PATH)) as OutfitPackage;
  if (
    pack == null ||
    (pack?.publisher?.id != get(currentUser)?.id && pack.isShared == false)
  )
    return null;

  if (onlyData) return pack;
  pack.social = await FetchSocial(path);
  return pack;
};

export const UploadPackage = async function (
  path: string,
  pack: OutfitPackage,
  isNew = false,
  parser = (x, y) => x,
  snapshotParser = (x) => x
) {
  if (pack.publisher.id != get(currentUser)?.id || pack.id == null) return;

  let parsed = await parser(pack, isNew);
  delete parsed.social;
  await UpdateDocument(path, DATA_PATH, parsed);
  await UploadPackageSnapshot(path, Object.assign({}, pack), snapshotParser);
  await UploadQueryData(pack);
};
export const FetchPackage = async function (path: string, parser = (x) => x) {
  let pack = await _FetchPackage(path);
  if (pack == null) return null;
  return await parser(pack);
};
export const CreatePackage = async function (
  data: OutfitPackage,
  path: string,
  parser = (x) => x,
  snapshotParser = (x) => x,
  addToWardrobe = true
) {
  await UploadPackage(path, data, true, parser, snapshotParser);
  if (addToWardrobe) {
    await AddItemToWardrobe(data);
  }
  return data;
};
export const DeletePackage = async function (
  pack: OutfitPackage,
  path: string
) {
  if (pack.publisher.id != get(currentUser)?.id) return;
  await DeleteCollection(path);
  await DeleteQueryData(pack);
};
export const FetchPackageSnapshot = async function (
  path: string,
  parser = (x) => x
) {
  let pack = await GetDocument(path, SNAPSHOT_PATH);
  if (pack == null) pack = await GetDocument(path, DATA_PATH);
  if (
    pack == null ||
    (pack?.publisher?.id != get(currentUser)?.id && pack.isShared == false)
  )
    return null;
  return await parser(pack);
};
export const UploadPackageSnapshot = async function (
  path: string,
  pack: OutfitPackage,
  parser = (x) => x
) {
  if (pack.publisher.id != get(currentUser)?.id || pack.id == null) return;
  let parsed = await parser(pack);
  await UpdateDocument(path, SNAPSHOT_PATH, parsed);
};
export const FetchRawPackage = async function (
  path: string,
  parser = (x) => x
) {
  let pack = await _FetchPackage(path, true);
  if (pack == null) return null;
  return await parser(pack);
};
export const FetchPackageFromQuery = async function (
  query: Query<DocumentData, DocumentData>[],
  parser = (x) => x
) {
  const docs = (await FetchDocsFromQuery(query)) as any[];
  let parsedDocs = [];
  for (let i = 0; i < docs.length; i++) {
    const docsArr = docs[i];
    for (let j = 0; j < docsArr.length; j++) {
      const doc = docsArr[j];
      if (doc != null) parsedDocs.push(await parser(doc));
    }
  }
  return parsedDocs;
};
export const FetchPackagesByFilter = async function (
  packsIds,
  path,
  localPath,
  filter,
  parser = (x) => x
) {
  let query = await BuildQuery(path,localPath, DATA_PATH, packsIds, filter);
  return await FetchPackageFromQuery(query,parser);
};
