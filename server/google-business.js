// Credentials remain server-side. Only the OAuth access token is cached.
let tokenCache;
export const secureUrl = (value) =>
  typeof value === "string" && /^https:\/\//.test(value) ? value : "";
export async function businessToken(env = process.env, fetcher = fetch) {
  if (
    !env.GOOGLE_BUSINESS_CLIENT_ID ||
    !env.GOOGLE_BUSINESS_CLIENT_SECRET ||
    !env.GOOGLE_BUSINESS_REFRESH_TOKEN
  )
    throw Error("NOT_CONFIGURED");
  const identity =
    env.GOOGLE_BUSINESS_CLIENT_ID + env.GOOGLE_BUSINESS_REFRESH_TOKEN;
  if (tokenCache?.identity === identity && tokenCache.expires > Date.now())
    return tokenCache.token;
  const response = await fetcher("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_BUSINESS_CLIENT_ID,
      client_secret: env.GOOGLE_BUSINESS_CLIENT_SECRET,
      refresh_token: env.GOOGLE_BUSINESS_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(8000),
  });
  const result = await response.json();
  if (!response.ok || !result.access_token) throw Error("GOOGLE_AUTH_FAILED");
  tokenCache = {
    identity,
    token: result.access_token,
    expires: Date.now() + Math.max(0, (result.expires_in || 300) - 60) * 1000,
  };
  return result.access_token;
}
export async function googleJSON(url, token, fetcher = fetch) {
  const response = await fetcher(url, {
    headers: { Authorization: "Bearer " + token },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw Error("GOOGLE_REQUEST_FAILED");
  return response.json();
}
export function fiveStarReviews(reviews, limit = 6) {
  const seen = new Set();
  return reviews
    .filter(
      (r) =>
        r.starRating === "FIVE" &&
        r.comment?.trim() &&
        !seen.has(r.reviewId) &&
        seen.add(r.reviewId),
    )
    .sort(
      (a, b) =>
        Date.parse(b.updateTime || b.createTime) -
        Date.parse(a.updateTime || a.createTime),
    )
    .slice(0, limit)
    .map((r) => ({
      id: r.reviewId,
      rating: 5,
      text: r.comment,
      publishTime: r.updateTime || r.createTime,
      author: {
        name: r.reviewer?.displayName || "",
        photo: secureUrl(r.reviewer?.profilePhotoUrl),
      },
      sourceUrl: "",
    }));
}
export async function getStoreReviews(
  store,
  { env = process.env, fetcher = fetch, limit = 6 } = {},
) {
  const location = store.google?.businessProfileLocation;
  if (!/^accounts\/\d+\/locations\/\d+$/.test(location || ""))
    return { status: "unconfigured", reviews: [] };
  const token = await businessToken(env, fetcher),
    all = [];
  let pageToken = "";
  // Bound API requests; never persist review content or manufacture a fallback.
  for (let page = 0; page < 5; page++) {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/${location}/reviews`,
    );
    url.searchParams.set("pageSize", "50");
    url.searchParams.set("orderBy", "updateTime desc");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const result = await googleJSON(url, token, fetcher);
    all.push(...(result.reviews || []));
    pageToken = result.nextPageToken || "";
    if (fiveStarReviews(all, limit).length >= limit || !pageToken) break;
  }
  return {
    status: "ready",
    provider: "business-profile",
    reviews: fiveStarReviews(all, limit),
    fetchedAt: new Date().toISOString(),
    sourceUrl:
      secureUrl(store.googleMapsUrl) ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapQuery)}${store.google?.placeId ? "&query_place_id=" + encodeURIComponent(store.google.placeId) : ""}`,
  };
}
