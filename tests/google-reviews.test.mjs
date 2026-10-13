import test from "node:test";
import assert from "node:assert/strict";
import { fiveStarReviews, getStoreReviews } from "../server/google-business.js";
import { handleReviews } from "../netlify/functions/store-reviews.mjs";
const review = (id, starRating = "FIVE", comment = "Great service") => ({
  reviewId: id,
  starRating,
  comment,
  updateTime: "2026-10-13T10:00:00Z",
  reviewer: {
    displayName: "Guest",
    profilePhotoUrl: "https://example.com/avatar.jpg",
  },
});
const store = {
  id: "test",
  online: true,
  mapQuery: "Official store address",
  google: {
    businessProfileLocation: "accounts/123/locations/456",
    reviewsEnabled: true,
  },
};
const response = (data) => ({ ok: true, json: async () => data });
test("reviews select only written five-star comments, deduplicate and preserve author data", () => {
  const result = fiveStarReviews([
    review("a"),
    review("b", "FOUR"),
    review("c", "FIVE", ""),
    review("a"),
    { ...review("d"), updateTime: "2026-10-14T10:00:00Z" },
  ]);
  assert.deepEqual(
    result.map((r) => r.id),
    ["d", "a"],
  );
  assert.equal(result[0].rating, 5);
  assert.equal(result[0].author.name, "Guest");
  assert.equal(
    fiveStarReviews([
      { ...review("e"), reviewer: { profilePhotoUrl: "javascript:alert(1)" } },
    ])[0].author.photo,
    "",
  );
});
test("unconfigured store makes no Google requests and never invents review content", async () => {
  assert.deepEqual(
    await getStoreReviews(
      { ...store, google: { businessProfileLocation: "" } },
      {
        fetcher: () => {
          throw Error("must not call");
        },
      },
    ),
    { status: "unconfigured", reviews: [] },
  );
  const r = await handleReviews(
    new Request(
      "https://example.com/.netlify/functions/store-reviews?store=test",
    ),
    { readSource: async () => ({ stores: [store] }), env: {} },
  );
  assert.deepEqual(await r.json(), { status: "unconfigured", reviews: [] });
  assert.equal(r.headers.get("Cache-Control"), "no-store");
});
test("live GBP request reads pinned location, refreshes token and pages through recent reviews", async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("oauth2"))
      return response({
        access_token: "private-access-token",
        expires_in: 3600,
      });
    return response(
      calls.length === 2
        ? { reviews: [review("bad", "ONE")], nextPageToken: "next" }
        : { reviews: [review("good")] },
    );
  };
  const r = await getStoreReviews(store, {
    env: {
      GOOGLE_BUSINESS_CLIENT_ID: "test-client",
      GOOGLE_BUSINESS_CLIENT_SECRET: "private-secret",
      GOOGLE_BUSINESS_REFRESH_TOKEN: "private-refresh",
    },
    fetcher,
    limit: 1,
  });
  assert.equal(r.status, "ready");
  assert.equal(r.reviews[0].id, "good");
  assert.equal(calls.length, 3);
  assert.ok(calls[2].url.includes("pageToken=next"));
  assert.ok(calls[1].url.includes("/accounts/123/locations/456/reviews"));
  assert.ok(calls[1].url.includes("orderBy=updateTime+desc"));
  assert.ok(!JSON.stringify(r).includes("private-"));
  assert.equal(r.reviews[0].text, "Great service");
});
test("public endpoint rejects foreign store IDs, non-GET and disabled records", async () => {
  const deps = {
    readSource: async () => ({
      stores: [{ ...store, google: { reviewsEnabled: false } }],
    }),
  };
  assert.equal(
    (
      await handleReviews(
        new Request("https://example.com/?store=unknown"),
        deps,
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await handleReviews(
        new Request("https://example.com/?store=test", { method: "POST" }),
        deps,
      )
    ).status,
    405,
  );
  assert.equal(
    (
      await handleReviews(
        new Request("https://example.com/?store=../secret"),
        deps,
      )
    ).status,
    400,
  );
  assert.deepEqual(
    await (
      await handleReviews(new Request("https://example.com/?store=test"), deps)
    ).json(),
    { status: "disabled", reviews: [] },
  );
});
