import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { Window } from 'happy-dom';
import { loadAuthoringData } from '../src/data-loader.js';
import { choice } from '../src/model.js';
import { formatText } from '../src/i18n.js';
import { satietyRows } from '../src/utils/product-satiety.js';

const authored = await loadAuthoringData(async file => JSON.parse(await fs.readFile('public/assets/data/' + file, 'utf8')));
const bundle = (await fs.readdir('dist/assets')).find(file => file.endsWith('.js'));
const script = await fs.readFile('dist/assets/' + bundle, 'utf8');
const ready = async predicate => {
  for (let i = 0; i < 100; i++) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw Error('Product intensity state did not render');
};

test('missing, invalid and explicitly empty variant intensity stays hidden; missing variant field uses the product value', () => {
  const data = [{ ingredientId: 'walnut', level: 4 }];
  const p = { code: 'test', images: [], satiety: data, variants: [
    { code: 'empty', satiety: [] }, { code: 'inherited' },
  ] };
  assert.deepEqual(choice(p, 'empty').satiety, []);
  assert.deepEqual(choice(p, 'inherited').satiety, data);
  for (const value of [undefined, null, '', [], [{ ingredientId: 'unknown', level: 3 }],
    [{ ingredientId: 'walnut', level: 0 }], [{ ingredientId: 'walnut', level: 6 }],
    [{ ingredientId: 'walnut', level: '4' }], [{ ingredientId: 'constructor', level: 3 }], [null]]) assert.deepEqual(satietyRows(value), []);
  assert.deepEqual(satietyRows([{ ingredientId: '59cb0273-2e66-4a0c-845d-dff8b3983a58', level: 2 },
    { ingredientId: 'eb8b1811-7758-4212-90a3-0957fb6c5f6e', level: 3 }]), [
    { ingredient: 'chocolate', level: 2 }, { ingredient: 'strawberry', level: 3 },
  ]);
});

test('exported intensity entries are supported and every new label is translated in all 14 languages', () => {
  const products = authored.catalog.products;
  assert.equal(products.filter(p => p.satiety?.length).length, 48);
  const variants = products.flatMap(p => p.variants);
  assert.equal(variants.filter(v => v.satiety?.length).length, 193);
  for (const item of [...products, ...variants]) {
    assert.equal(satietyRows(item.satiety).length, (item.satiety || []).length, item.code);
  }
  const keys = Object.keys(authored.content.texts).filter(key => key.startsWith('ui.satiety.'));
  assert.equal(keys.length, 13);
  for (const { code } of authored.content.languages) {
    for (const key of keys) assert.ok(authored.content.texts[key][code]?.trim(), key + '/' + code);
  }
});

for (const { code: language } of authored.content.languages) {
  test(`product intensity appears immediately after size selection, updates and disappears in ${language}`, async () => {
    const fixture = structuredClone(authored);
    const p = fixture.catalog.products.find(p => p.code === '1011112');
    const mixed = fixture.catalog.products.flatMap(p => p.variants).find(v => v.satiety?.length === 2).satiety;
    p.variants[1].satiety = mixed;
    p.variants[2].satiety = [];
    const w = new Window({ url: 'http://localhost/' + p.url, settings: { enableJavaScriptEvaluation: true } });
    const t = key => formatText(fixture.content, language, key);
    w.localStorage.setItem('hm1864.react.preferences', JSON.stringify({ country: 'TR', language, currency: 'TRY' }));
    w.fetch = async () => ({ ok: true, json: async () => fixture });
    w.scrollTo = () => {};
    w.document.body.innerHTML = '<div id="root"></div>';
    try {
      w.eval(script);
      await ready(() => w.document.querySelector('.product-satiety'));
      const section = () => w.document.querySelector('.product-satiety');
      assert.equal(w.document.querySelector('.product-variants').nextElementSibling, section());
      assert.equal(section().querySelector('h2').textContent, t('ui.satiety.title'));
      assert.equal(section().querySelector('dt').textContent, t('ui.satiety.ingredient.walnut'));
      assert.equal(section().querySelector('bdi').textContent, '4/5');
      assert.equal(section().querySelector('bdi').dir, 'ltr');
      assert.equal(section().querySelectorAll('.is-filled').length, 4);
      w.document.querySelectorAll('.variant-choice input')[1].click();
      await ready(() => section()?.querySelectorAll('dt').length === 2);
      assert.deepEqual([...section().querySelectorAll('bdi')].map(n => n.textContent), mixed.map(v => v.level + '/5'));
      w.document.querySelectorAll('.variant-choice input')[2].click();
      await ready(() => !section());
      assert.ok(w.document.querySelector('.product-variants'));
      assert.equal(w.document.documentElement.dir, ['ar', 'ur', 'fa'].includes(language) ? 'rtl' : 'ltr');
    } finally { await w.happyDOM.abort(); }
  });
}
