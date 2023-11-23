import {
  readable,
  writable,
  type Writable,
  type Readable,
  get,
} from "svelte/store";
import { MODEL_TYPE, PACKAGE_TYPE} from "$data/consts";
import { OutfitPackage } from "./common";
import alexModelData from "$src/model/alex.gltf?raw";
import steveModelData from "$src/model/steve.gltf?raw";
import planksTextureRaw from "$src/texture/default_planks.png?url";
import { WardrobePackage } from "./common";
import { GetWardrobe, SetWardrobe } from "$src/api/wardrobe";

let defaultOutfitPackage = new OutfitPackage(
  "New skin",
  MODEL_TYPE.ALEX,
  [],
  "",
  undefined,
  PACKAGE_TYPE.OUTFIT_SET
);
export let itemPackage: Writable<OutfitPackage> =
  writable(defaultOutfitPackage);
export let alexModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(alexModelData)
);
export let steveModel: Readable<string> = readable(
  "data:model/gltf+json;base64," + btoa(steveModelData)
);

export let planksTexture: Readable<string> = readable(planksTextureRaw);

export const currentUser: Writable<any> = writable(null);
export const wardrobe: Writable<WardrobePackage> = writable(null);

itemPackage.subscribe((data) => {
  if (get(wardrobe) != null && data != null)
    wardrobe.update((w) => {
      w.studio = data;
      if (data.metadata.wardrobeItemId != null) {
        if (data.type == PACKAGE_TYPE.OUTFIT_SET) {
          const index = w.sets.findIndex(
            (x) => x.metadata.wardrobeItemId == data.metadata.wardrobeItemId
          );
          if (index != -1) w.sets[index] = data;
        } else {
          const index = w.outfits.findIndex(
            (x) => x.metadata.wardrobeItemId == data.metadata.wardrobeItemId
          );
          if (index != -1) w.outfits[index] = data;
        }
      }
      return w;
    });
});

currentUser.subscribe(async (user) => {
  if (user) {
    //settings up account
    let w = await GetWardrobe();
    if (w == null) {
      w = new WardrobePackage("default_wardrobe", [], [], null);
      await SetWardrobe(w);
    }
    wardrobe.set(w);
    if (w.studio != null) itemPackage.set(w.studio);
  }
});
wardrobe.subscribe(async (data) => {
  await SetWardrobe(data);
});
