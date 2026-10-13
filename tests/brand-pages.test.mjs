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
  assert.equal(data.brandPages.length, 29);
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
    assert.equal(page.sourceUrls, undefined);
    assert.ok(page.sections.length);
    for (const section of page.sections)
      for (const item of section.items || [])
        if (item.href) {
          assert.ok(!/^(?:[a-z]+:|\/\/)/i.test(item.href));
          assert.notEqual(resolve("/" + item.href, data, routes).kind, "404");
        }
  }
});

test("support and policy pages cover sitemap routes without placeholders or fabricated services", async () => {
  const pages=data.brandPages.filter(p=>["destek","sozlesmeler"].includes(p.groupId));
  assert.equal(pages.length,15);
  for(const page of pages){
    assert.equal(resolve('/'+page.url,data,routes).kind,'brand');
    assert.equal(page.hero.image,undefined);
    for(const lang of ['tr','en','ar'])assert.ok(page.hero.intro[lang]);
    assert.ok((await fs.stat('dist/'+page.url)).size>0);
  }
  const faq=pages.find(p=>p.id==='support-faq').sections[0];
  assert.equal(faq.searchable,true);assert.equal(faq.items.length,6);
  const contacts=pages.find(p=>p.id==='support-customer').sections.find(s=>s.type==='contacts');
  assert.equal(contacts.items[0].email,'online@hafizmustafa.com');
  assert.equal(contacts.items[1].email,'care@hm1864.ae');
  const cookie=pages.find(p=>p.id==='policy-cookies');
  assert.ok(cookie.sections[0].paragraphs[0].tr.includes('hm1864.react.preferences'));
  const css=await fs.readFile('src/style.css','utf8');
  const palette=css.slice(css.indexOf('/* Corporate and heritage editorial experience:'));
  assert.ok(!/#(?:cba052|d8bc80|253a37|1c302e|9e7c3e)/i.test(palette));
});

test("brand details and document readers use authored content and local documents", async () => {
  let documents = 0, details = 0;
  for (const page of data.brandPages) for (const section of page.sections) for (const item of section.items || []) {
    if (item.detail) {
      details++;
      for (const p of item.detail.paragraphs) for (const lang of ["tr", "en", "ar"]) assert.ok(p[lang]);
    }
    if (item.document) {
      documents++;
      const pdf = await fs.readFile("public" + item.document.src);
      assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
      assert.ok((await fs.stat("public" + item.document.preview)).size > 10000);
    }
  }
  assert.equal(documents, 3);
  assert.ok(details >= 10);
  const files = await Promise.all(["pages/kurumsal.json", "pages/asirlik-miras.json"].map(read));
  files[0].pages[0].sections[0].items[0].href = "https://example.com/content";
  assert.throws(() => validateBrandFiles(files), /uygulama içinde/);
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
