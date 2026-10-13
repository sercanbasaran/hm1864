import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getStoreReviews } from "../../server/google-business.js";
const sourcePath = resolve(process.cwd(), "public/assets/data/stores.json");
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
export async function handleReviews(
  request,
  {
    readSource = async () => JSON.parse(await readFile(sourcePath, "utf8")),
    env = process.env,
    fetcher = fetch,
  } = {},
) {
  if (request.method !== "GET")
    return json({ status: "method_not_allowed" }, 405);
  const id = new URL(request.url).searchParams.get("store");
  if (!/^[a-z0-9-]{1,100}$/.test(id || ""))
    return json({ status: "invalid_store" }, 400);
  const source = await readSource(),
    store = source.stores.find((s) => s.id === id && s.online);
  if (!store) return json({ status: "not_found" }, 404);
  if (store.google?.reviewsEnabled === false)
    return json({ status: "disabled", reviews: [] });
  try {
    return json(
      await getStoreReviews(store, {
        env,
        fetcher,
        limit: Math.min(12, Math.max(1, source.reviews?.maxReviews || 6)),
      }),
    );
  } catch (error) {
    return json(
      {
        status:
          error.message === "NOT_CONFIGURED" ? "unconfigured" : "unavailable",
        reviews: [],
      },
      error.message === "NOT_CONFIGURED" ? 200 : 502,
    );
  }
}
export default (request) => handleReviews(request);
