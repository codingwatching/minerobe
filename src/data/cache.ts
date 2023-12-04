import {
  readable,
  writable,
  type Writable,
  type Readable,
  get,
  derived,
} from "svelte/store";
import { APP_STATE, PACKAGE_TYPE } from "$data/consts";
import { AppState, MinerobeUser } from "./common";
import alexModelData from "$src/model/alex.gltf?raw";
import steveModelData from "$src/model/steve.gltf?raw";
import planksTextureRaw from "$src/texture/default_planks.png?url";
import { WardrobePackage } from "./common";
import { OutfitPackage } from "./common";
import { GetWardrobe, SetWardrobe } from "$src/api/wardrobe";
import { SaveOutfitSet } from "$src/api/sets";
import { propertyStore } from "svelte-writable-derived";
import { SaveOutfit } from "$src/api/outfits";

export let alexModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(alexModelData)
);
export let steveModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(steveModelData)
);

export let planksTexture: Readable<string> = readable(planksTextureRaw);

export const appState: Writable<string> = writable(APP_STATE.LOADING);
export const currentUser: Writable<MinerobeUser> = writable(null);
export const wardrobe: Writable<WardrobePackage> = writable({
  id: "default_wardrobe",
  outfits: [],
  sets: [],
  studio: {
    id: "default",
    model: "alex",
    type: PACKAGE_TYPE.OUTFIT,
    isShared: false,
    name: "alex",
    layers: [],
    publisher: {
      id: "",
      name: "",
      avatar: "",
    },
  },
});
export const baseTexture: Readable<string> = readable(get(planksTexture));

export const itemPackage: Writable<OutfitPackage> = propertyStore(
  wardrobe,
  "studio"
);
export const setup = function () {
  wardrobe.set(
    new WardrobePackage(
      "default_wardrobe",
      [],
      [],
      new OutfitPackage(
        "default",
        "alex",
        [],
        PACKAGE_TYPE.OUTFIT,
        new MinerobeUser("", "", "")
      )
    )
  );
  currentUser.subscribe(async (user) => {
    if (user) {
      //settings up account
      if (get(appState) == APP_STATE.LOADING)
        appState.set(APP_STATE.USER_READY);
      itemPackage.set(
        new OutfitPackage(
          "default",
          "alex",
          [],
          PACKAGE_TYPE.OUTFIT,
          new MinerobeUser(user.id, user.name, user.avatar)
        )
      );
      let w = await GetWardrobe();
      if (w == null) {
        w = new WardrobePackage("default_wardrobe", [], [], null);
      }
      wardrobe.set(w);
      console.log("setting wardrobe");
      if (w.studio != null) itemPackage.set(w.studio);
      appState.set(APP_STATE.READY);
      setupSubscriptions();
    } else {
      appState.set(APP_STATE.LOADING);
    }
  });
};
const setupSubscriptions = function () {
  itemPackage.subscribe(async (data: OutfitPackage) => {
    if (data != null && data.isShared) {
      if (data.type == PACKAGE_TYPE.OUTFIT_SET) {
        await SaveOutfitSet(data);
      } else await SaveOutfit(data);
    }
  });
  wardrobe.subscribe(async (data) => {
    await SetWardrobe(data);
  });
};
