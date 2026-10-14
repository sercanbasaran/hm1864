import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLhfCharacters,lhfDisplayText,isLhfHeading} from '../src/utils/lhf-text.js';

test('LHF replaces exactly the six unsupported letters before lowercase display',()=>{
 assert.equal(normalizeLhfCharacters('İıŞşĞğ'), 'iiSsGg');
 assert.equal(normalizeLhfCharacters('ÇçÖöÜü ABC'), 'ÇçÖöÜü ABC');
 assert.equal(lhfDisplayText('İSTANBUL IŞIĞI'), 'istanbul isigi');
 assert.equal(lhfDisplayText('Şeker, Çikolata ve Fıstık'), 'seker, çikolata ve fistik');
 assert.ok(!/[İıŞşĞğ]/.test(lhfDisplayText('İ I ı Ş ş Ğ ğ')));
});
test('LHF scope follows existing heading selectors and leaves other text outside the scope',()=>{
 assert.equal(isLhfHeading('h1',['hero','hero-copy']),true);
 assert.equal(isLhfHeading('h2',['hero-slide','hero-copy']),true);
 assert.equal(isLhfHeading('h1',['category-banner']),true);
 assert.equal(isLhfHeading('p',['hero','hero-copy']),false);
 assert.equal(isLhfHeading('h1',['brand-hero']),false);
 assert.equal(isLhfHeading('h1',['catalog-hero']),false);
});
