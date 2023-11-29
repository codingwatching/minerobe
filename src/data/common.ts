import { get } from "svelte/store";
import { LAYER_TYPE, OUTFIT_TYPE, PACKAGE_TYPE } from "./consts";
import { GenerateIdForCollection } from "./firebase";
import { currentUser } from "./cache";

export class FileData {
  fileName: string;
  content: string;
  type: string;
  constructor(
    fileName: string,
    content: string,
    type: string = OUTFIT_TYPE.DEFAULT
  ) {
    this.fileName = fileName;
    this.content = content;
    this.type = type;
  }
}
export class OutfitLayer {
  name: string;
  steve: FileData;
  alex: FileData;
  id: string;
  variantId: string;
  type: string;
  constructor(
    name: string,
    steve: FileData,
    alex: FileData,
    id: string = GenerateIdForCollection("dummy"),
    type: string = LAYER_TYPE.LOCAL,
    variantId: string = ""
  ) {
    this.name = name;
    this.variantId = variantId;
    this.id = id;
    this.type = type;
    if (!steve && alex) {
      this.steve = alex;
      this.alex = alex;
    } else if (!alex && steve) {
      this.steve = steve;
      this.alex = steve;
    } else {
      this.steve = steve;
      this.alex = alex;
    }
  }
}
export class OutfitLayerLink {
  id: string;
  variantId: string;
  constructor(id: string, variantId: string) {
    this.id = id;
    this.variantId = variantId;
  }
}
export class OutfitPackageLink {
  id: string;
  model: string;
  type: string;
  constructor(linkId: string, model: string) {
    this.id = linkId;
    this.model = model;
    this.type = PACKAGE_TYPE.OUTFIT_SET_LINK;
  }
}
export class OutfitPackage {
  name: string;
  model: string;
  type: string;
  layers: OutfitLayer[];
  publisher:MinerobeUser;
  id: string;
  isShared: boolean;
  constructor(
    name: string,
    model: string,
    layers: OutfitLayer[],
    type: string = PACKAGE_TYPE.OUTFIT,
    publisher: MinerobeUser = get(currentUser),
    id: string = GenerateIdForCollection("dummy"),
    isShared: boolean = false
  ) {
    this.name = name;
    this.model = model;
    this.layers = layers;
    this.type = type;
    this.publisher = publisher;
    this.id = id;
    this.isShared = isShared;
  }
}
export class OutfitLayerMetadata {}
export class OutfitPublisher {
  name: string;
  id: string;
  avatar: string;
  constructor(id: string, name: string, avatar: string) {
    this.name = name;
    this.id = id;
    this.avatar = avatar;
  }
}
export class WardrobePackage {
  id: string;
  outfits: OutfitPackage[];
  sets: OutfitPackage[];
  studio: OutfitPackage;
  constructor(
    id: string,
    outfits: OutfitPackage[],
    sets: OutfitPackage[] = [],
    studio: OutfitPackage = null
  ) {
    this.id = id;
    this.outfits = outfits;
    this.studio = studio;
    this.sets = sets;
  }
}
export class MinerobeUser {
  id: string;
  name: string;
  avatar: string;
  constructor(id: string, name: string, avatar: string) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
  }
}
export class MinerobeUserLink {
  id: string;
  userId: string;
  constructor(id: string, userId: string) {
    this.id = id;
    this.userId = userId;
  }
}
