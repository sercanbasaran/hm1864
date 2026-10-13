import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { loadAuthoringData } from "../src/data-loader.js";
import {
  validateStores,
  localizeStore,
  storeMaps,
  storeText,
} from "../src/stores.js";
import { resolve } from "../src/model.js";
import { buildBreadcrumbs } from "../src/routing/breadcrumbs.js";
const read = async (path) =>
  JSON.parse(await fs.readFile("public/assets/data/" + path, "utf8"));
const source = await read("stores.json"),
  { catalog: data, content } = await loadAuthoringData(read);
const routes = JSON.parse(await fs.readFile("src/routes.json", "utf8"));
test("official stores retain countries, contact data, exceptions and translated facilities", () => {
  assert.equal(data.stores.length, 20);
  assert.deepEqual(
    ["TR", "AE", "GB"].map(
      (c) => data.stores.filter((s) => s.country === c).length,
    ),
    [16, 3, 1],
  );
  assert.equal(
    data.stores.find((s) => s.id === "nisantasi").phone,
    "+90 212 291 17 36",
  );
  assert.equal(
    data.stores.find((s) => s.id === "dubai-mall-of-the-emirates").phone,
    "",
  );
  assert.match(
    localizeStore(
      data.stores.find((s) => s.id === "nuruosmaniye"),
      "en",
    ).hours,
    /Closed on Sundays/,
  );
  assert.match(
    localizeStore(
      data.stores.find((s) => s.id === "bodrum-mandarin-oriental"),
      "de",
    ).hours,
    /Sommersaison/,
  );
  for (const store of data.stores)
    for (const lang of content.languages) {
      const localized = localizeStore(store, lang.code);
      assert.ok(localized.name && localized.address && localized.hours);
      for (const key of [...store.products, ...store.features])
        assert.notEqual(storeText(data, lang.code, key), key);
      const maps = storeMaps(store, lang.code);
      assert.equal(new URL(maps.embed).searchParams.get("q"), store.mapQuery);
      assert.equal(
        new URL(maps.directions).searchParams.get("destination"),
        store.mapQuery,
      );
    }
  const invalid = structuredClone(source);
  invalid.stores.push(invalid.stores[0]);
  assert.throws(() => validateStores(invalid, content.languages), /geçersiz/);
  const untranslated = structuredClone(source);
  delete untranslated.stores[0].translations.ar;
  assert.throws(
    () => validateStores(untranslated, content.languages),
    /çevirisi eksik/,
  );
});
test("store routes and breadcrumbs work for direct entry and future JSON additions", () => {
  for (const s of data.stores) {
    for (const url of ["/" + s.url, "/" + s.url.replace("index.html", "")])
      assert.equal(resolve(url, data, routes).store.id, s.id);
    const crumbs = buildBreadcrumbs({
      path: "/" + s.url,
      route: resolve("/" + s.url, data, routes),
      data,
      routes,
      language: "en",
      t: () => "Home",
    });
    assert.deepEqual(
      crumbs.map((c) => c.label),
      ["Home", "Our stores", s.translations.en.name],
    );
    assert.equal(crumbs[1].url, "magazalar/index.html");
    assert.equal(crumbs[2].current, true);
  }
  const added = {
    ...data.stores[0],
    id: "future-store",
    url: "magazalar/future-store/index.html",
  };
  assert.equal(
    resolve(
      "/" + added.url,
      { ...data, stores: [...data.stores, added] },
      routes,
    ).store.id,
    "future-store",
  );
});
