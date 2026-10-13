import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { loadAuthoringData } from "../src/data-loader.js";
import { brandText, validateBrandFiles } from "../src/brand-content.js";
import { resolve } from "../src/model.js";
import { buildBreadcrumbs } from "../src/routing/breadcrumbs.js";
const read = async (p) =>
  JSON.parse(await fs.readFile("public/assets/data/" + p, "utf8"));
const { catalog: data } = await loadAuthoringData(read),
  routes = JSON.parse(await fs.readFile("src/routes.json", "utf8"));
test("all corporate and heritage pages resolve, localize and follow the sitemap", () => {
  assert.equal(data.brandPages.length, 14);
  for (const page of data.brandPages) {
    for (const lang of ["tr", "en", "ar"])
      assert.ok(brandText(page.title, lang));
    assert.equal(resolve("/" + page.url, data, routes).page.id, page.id);
    assert.equal(
      resolve("/" + page.url.replace("index.html", ""), data, routes).page.id,
      page.id,
    );
    const crumbs = buildBreadcrumbs({
      path: "/" + page.url,
      route: resolve("/" + page.url, data, routes),
      data,
      routes,
      t: () => "Home",
      language: "en",
    });
    assert.equal(
      crumbs.length,
      page.url === page.groupId + "/index.html" ? 2 : 3,
    );
    assert.equal(crumbs.at(-1).label, page.title.en);
    assert.ok(page.sourceUrls.length);
    assert.ok(page.sections.length);
    for (const section of page.sections)
      for (const item of section.items || [])
        if (item.href && !item.href.startsWith("http"))
          assert.notEqual(resolve("/" + item.href, data, routes).kind, "404");
  }
});
test("generated assets exist and real archive/portrait imagery stays separate", async () => {
  for (const name of ["ustalik.webp", "mimari.webp"])
    assert.ok(
      (await fs.stat("public/assets/images/medya/marka/" + name)).size > 10000,
    );
  const president = data.brandPages.find((p) => p.id === "president");
  assert.equal(president.sections[0].image.generated, false);
  assert.ok(
    president.sections[0].image.src.startsWith("https://static.wixstatic.com/"),
  );
  const medals = data.brandPages.find((p) => p.id === "medals");
  for (const i of medals.sections[1].items)
    assert.equal(i.image.generated, false);
  const invalid = await Promise.all(
    ["pages/kurumsal.json", "pages/asirlik-miras.json"].map(read),
  );
  invalid[0].pages[0].url = "../unsafe.html";
  assert.throws(() => validateBrandFiles(invalid), /geçersiz/);
});
