import { GetRequest, PostRequest } from "$src/data/api";
import type { OutfitPackage } from "$data/models/package";
import type {
  CurrentTextureConfig,
  MinerobeUserSettings,
  MinerobeUserSettingsSimple,
} from "$data/models/user";

export const FetchSettings = async function ():Promise<MinerobeUserSettingsSimple> {
  const res = await GetRequest("/api/UserSettings/Simple");
  return res;
};
export const UpdateBaseTexture = async function (baseTexture: OutfitPackage) {
  const res = await PostRequest("/api/UserSettings/BaseTexture", baseTexture);
  return res;
};
export const SetCurrentTexture = async function (
  packageId: string,
  config: CurrentTextureConfig
) {
  const res = await PostRequest(
    "/api/UserSettings/CurrentTexture/" + packageId,
    config
  );
  return res as MinerobeUserSettingsSimple;
};
