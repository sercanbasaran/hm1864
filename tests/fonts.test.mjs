import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const css = await fs.readFile("src/style.css", "utf8");
test("Lato is loaded through Google Fonts for normal and italic styles", async () => {
  const faces = await fs.readFile("src/fonts.css", "utf8");
  assert.ok(css.includes("--font: 'Lato', sans-serif"));
  assert.ok(!faces.includes("font-family: 'Avenir'"));
  const html = await fs.readFile("dist/index.html", "utf8");
  assert.ok(html.includes('https://fonts.googleapis.com/css2?family=Lato:ital,wght@'));
  assert.ok(html.includes('display=swap'));
  assert.ok(html.includes('href="https://fonts.gstatic.com" crossorigin'));
  assert.ok(!html.includes('/assets/fonts/avenir/'));
  for (const weight of [100,300,400,700,900]) {
    assert.ok(html.includes('0,'+weight)); assert.ok(html.includes('1,'+weight));
  }
  for (const declaration of css.matchAll(/font-family\s*:\s*([^;}\n]+)/g)) {
    if (!declaration[1].includes('LHF Elixir Regular')) assert.ok(['var(--font)','inherit'].includes(declaration[1].trim()),declaration[0]);
  }
});
test("LHF display font remains embedded and preloaded", async () => {
  const faces = await fs.readFile("src/fonts.css", "utf8");
  assert.ok(faces.includes("font-family: 'LHF Elixir Regular'"));
  assert.ok(faces.includes('font-display: block'));
  assert.ok(!faces.includes('local('));
  const font = await fs.readFile("public/assets/fonts/lhf/LHF-Elixir-Regular.woff2");
  assert.equal(font.subarray(0,4).toString(),"wOF2");
  assert.deepEqual(await fs.readFile("dist/assets/fonts/lhf/LHF-Elixir-Regular.woff2"),font);
  const html=await fs.readFile("dist/index.html","utf8");
  assert.match(html,/rel="preload"[^>]+href="\/assets\/fonts\/lhf\/LHF-Elixir-Regular.woff2"[^>]+crossorigin/);
  const display = [...css.matchAll(/font-family\s*:\s*([^;}\n]+)/g)].filter(match=>match[1].includes('LHF Elixir Regular')).map(match=>match[1].trim());
  assert.deepEqual(display,["'LHF Elixir Regular', 'Arial Narrow', Impact, serif","'LHF Elixir Regular', 'Arial Narrow', Impact, serif","'LHF Elixir Regular', Georgia, serif","'LHF Elixir Regular', 'Arial Narrow', Impact, serif"]);
});
