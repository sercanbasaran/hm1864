import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const css = await fs.readFile("src/style.css", "utf8");
test("uploaded Avenir family ships as local normal and italic web fonts", async () => {
  const faces = await fs.readFile("src/fonts.css", "utf8");
  const files = [...faces.matchAll(/url\('([^']+)'\)/g)].map(match => match[1]).filter(url => url.includes('/avenir/'));
  assert.equal(files.length, 12);
  assert.equal(new Set(files).size, 12);
  assert.equal((faces.match(/font-display: swap/g) || []).length, 12);
  for (const url of files) {
    const source = await fs.readFile("public" + url);
    assert.equal(source.subarray(0, 4).toString(), "wOF2");
    assert.deepEqual(await fs.readFile("dist" + url), source);
  }
  for (const weight of [300,350,400,500,700,900]) {
    assert.ok(faces.includes("font-weight: " + weight));
  }
  assert.ok(css.includes('@import "./fonts.css"'));
  assert.ok(css.includes("--font: 'Avenir', Arial, sans-serif"));
  const html = await fs.readFile("dist/index.html", "utf8");
  assert.ok(html.includes('/assets/fonts/avenir/Avenir-Roman.woff2'));
});
test("LHF display font is embedded and preloaded without depending on installed fonts", async () => {
  const faces = await fs.readFile("src/fonts.css", "utf8");
  const face = faces.split("@font-face").find(rule => rule.includes("font-family: 'LHF Elixir Regular'"));
  assert.ok(face);
  assert.ok(face.includes("/assets/fonts/lhf/LHF-Elixir-Regular.woff2"));
  assert.ok(face.includes("font-display: block"));
  assert.ok(!face.includes("local("));
  const font = await fs.readFile("public/assets/fonts/lhf/LHF-Elixir-Regular.woff2");
  assert.equal(font.subarray(0,4).toString(),"wOF2");
  assert.deepEqual(await fs.readFile("dist/assets/fonts/lhf/LHF-Elixir-Regular.woff2"),font);
  const html=await fs.readFile("dist/index.html","utf8");
  assert.match(html, /rel="preload"[^>]+href="\/assets\/fonts\/lhf\/LHF-Elixir-Regular.woff2"[^>]+crossorigin/);
});
test("protected display and serif font declarations remain unchanged", () => {
  const protectedNames = ["LHF Elixir Regular", "Arial Narrow", "Impact", "serif"];
  const declarations = [...css.matchAll(/font-family\s*:\s*([^;}\n]+)/g)];
  const kept = declarations.filter(match => match[1].split(',').some(value => protectedNames.includes(value.trim().replace(/^['"]|['"]$/g, "")))).map(match => match[0]);
  assert.deepEqual(kept, ["font-family: Georgia, serif", "font-family: 'LHF Elixir Regular', 'Arial Narrow', Impact, serif", "font-family: Georgia, serif", "font-family: 'Arial Narrow', Impact, sans-serif", "font-family: Georgia, serif", "font-family: 'LHF Elixir Regular', Georgia, serif", "font-family: 'LHF Elixir Regular', 'Arial Narrow', Impact, serif", "font-family:Georgia,'Times New Roman',serif", "font-family:Georgia,'Times New Roman',serif", "font-family:Georgia,'Times New Roman',serif", "font-family:Georgia,'Times New Roman',serif", "font-family:Georgia,'Times New Roman',serif"]);
  assert.ok(!css.includes("font-family: 'Manrope'"));
});
