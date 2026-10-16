import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { validateHomeSlider, localizedSlide } from '../src/utils/home-slider.js';

const config = JSON.parse(await fs.readFile('public/assets/data/home/slider.json', 'utf8'));

test('slider authoring uses complete copy, independent slides, and valid settings', () => {
  assert.equal(validateHomeSlider(config), config);
  assert.ok(config.slides.length > 0);
  for (const mutate of [c => c.intervalMs = 0, c => c.slides[1].id = c.slides[0].id, c => c.slides[0].backgroundColor = 'broken', c => c.slides[0].content.tr.title = '']) {
    const invalid = structuredClone(config);
    mutate(invalid);
    assert.throws(() => validateHomeSlider(invalid));
  }
});

test('partial translations fall back field by field without replacing translated copy', () => {
  const slide = structuredClone(config.slides[0]);
  slide.content.en = { title: 'Istanbul in every box', description: ' ' };
  const en = localizedSlide(slide, 'en');
  assert.equal(en.title, 'Istanbul in every box');
  assert.equal(en.description, slide.content.tr.description);
  assert.equal(en.buttonLabel, slide.content.tr.buttonLabel);
  assert.deepEqual(localizedSlide(slide, 'ar'), localizedSlide(slide, 'tr'));
});

test('gridScheme accepts both positions and defaults when omitted, rejecting invalid settings', () => {
  for (const value of [undefined, 0, 1]) {
    const changed = structuredClone(config);
    if (value === undefined) delete changed.slides[0].gridScheme;
    else changed.slides[0].gridScheme = value;
    assert.equal(validateHomeSlider(changed), changed);
  }
  for (const value of [-1, 2, '1', false, null]) {
    const invalid = structuredClone(config);
    invalid.slides[0].gridScheme = value;
    assert.throws(() => validateHomeSlider(invalid), /gridScheme/);
  }
});
