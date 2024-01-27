import { ChangeSkin } from "$lib/server/minecraftServices";

export const GET = async (event) => {
  const request = event.request;
  try {
    const result = await ChangeSkin(
      event.params.id,
      event.params.model,
      event.params.userId,
      request.headers.get("authorization")
    );
    if (!result) return new Response("Error", { status: 500 });
    return new Response("OK");
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify(e), { status: 500 });
  }
};
