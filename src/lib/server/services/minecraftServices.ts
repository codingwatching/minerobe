import { MODEL_TYPE } from "$data/consts";
import { serverConfig } from "$src/data/config";
import { authenticateWithPrismarine } from "./prismarineAuth";
export const ChangeSkin = async function (
  id: string,
  model: string,
  userId: string,
  userToken: string
) {
  try {
    const token = await authenticate(userId, userToken);
    if (token == null) throw new Error("Invalid token");
    let normalizedModel = model == MODEL_TYPE.ALEX ? "slim" : "classic";
    const url =
      serverConfig.minecraftServices.photoBaseUrl + userId + "/" + model;
    const request = {
      variant: normalizedModel,
      url: url,
    };
    const result = await fetch(
      "https://api.minecraftservices.com/minecraft/profile/skins",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(request),
      }
    );
    console.log(
      "Change skin result ",
      userId,
      result.status != 200 ? await result.json() : "result: ok",
      JSON.stringify(request)
    );
    return result.status == 200;
  } catch (e) {
    return false;
  }
};
const authenticate = async function (user, token: string) {
  const data = await authenticateWithPrismarine(user, token);
  return data?.token;
};
