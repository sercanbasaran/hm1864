import React, { useState, useEffect, useRef, useContext, createContext, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import templates from './templates.json';
import routes from './routes.json';
import { validate, resolve, choice, cardPrice, money, match, slug, imageUrl, menuCategories, menuSubcategories, storeOnly } from './model.js';
import { validateRegions, validateRegionalCatalog, normalizePreferences, regionalCatalog, countryDefaults } from './market.js';
import { validateContent, translate, templateText, formatText } from './i18n.js';
import commonUI from '../public/assets/data/ui/common.json';
import languageSettings from '../public/assets/data/settings/languages.json';
import { localizedEditorial } from './data-loader.js';
const initialContent = { schemaVersion: 1, languages: languageSettings.languages, texts: commonUI.texts };
import './style.css';
const Context = createContext(); const useApp = () => useContext(Context); const useText = () => { const { content, preferences, regions } = useApp(); return (key, values) => formatText(content, preferences?.language || regions.defaultLanguage, key, values) };
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } }
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch { } }
const usePrice = () => { const { preferences, regions } = useApp(), t = useText(); const currency = preferences?.currency || regions.defaultCurrency, language = preferences?.language || regions.defaultLanguage; return { currency, language, missing: t('ui.priceUnavailableCurrency', { currency }) } };
const local = s => !s || /^(?:[a-z]+:|#|\/)/i.test(s) ? s : '/' + s;
function Media({ src, alt = '', className = '' }) { const t = useText(); const [failed, setFailed] = useState(false); useEffect(() => setFailed(false), [src]); return <span className={'media ' + className + ((src && !failed) ? ' asset-loaded' : '')}><img src={src && !failed ? src : '/assets/images/medya/gorsel-bekleniyor.svg'} alt={alt} loading="lazy" onError={() => setFailed(true)} />{(!src || failed) && <span className="asset-caption">{alt}<small>{t('template.0067')}</small></span>}</span> }
function Icon({ name }) { const paths = { menu: 'M3 6h18M3 12h18M3 18h18', close: 'm5 5 14 14M19 5 5 19', bag: 'M5 7h14l1 15H4L5 7Z M8 8V5a4 4 0 0 1 8 0v3', search: 'M16 16l5 5', user: 'M4 22v-3a8 8 0 0 1 16 0v3', chevron: 'm7 10 5 5 5-5' }; return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name === 'search' && <circle cx="10.5" cy="10.5" r="6.5" />}{name === 'user' && <circle cx="12" cy="7" r="4" />}<path d={paths[name] || paths.chevron} /></svg> }
function Header() { const { data, modal, setModal, preferences, regions, content } = useApp(); const t = useText(); const language = preferences?.language || regions.defaultLanguage; const country = regions.countries.find(c => c.code === preferences?.country) || regions.countries.find(c => c.code === regions.defaultCountry); const group = regions.groups.find(g => g.id === country.group); const countryLabel = preferences?.countryName || translate(content, language, 'region.country.' + country.code); const [menu, setMenu] = useState(null); const [tab, setTab] = useState('online'); const timer = useRef(); const nav = menuCategories(data).filter(c => c.highlightOnHeader); useEffect(() => { if (modal) setMenu(null); return () => clearTimeout(timer.current) }, [modal]); useEffect(() => { const close = e => { if (e.key === 'Escape') setMenu(null) }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, []); const open = id => { setMenu(null); setModal(id) }; const cats = menu === 'all' ? menuCategories(data, tab) : menuCategories(data, tab).filter(c => c.name === menu); return <><a className="skip-link" href="#main">{t('ui.copy.001')}</a><header className="site-header header-gold"><div className="header-service"><div className="header-safe"><button onClick={() => open('region')}><span className="region-summary"><span className="region-intro">{translate(content, language, 'ui.regionLabel')} </span>{translate(content, language, 'region.group.' + group.id)} / {countryLabel} / {regions.languages.find(l => l.code === language)?.name} / {preferences?.currency || countryDefaults(regions, country.code).currency}</span><Icon name="chevron" /></button><div className="service-links"><a href="/magazalar/index.html">{translate(content, language, 'ui.stores')}</a><a className="service-contact" href="/iletisim/index.html">{translate(content, language, 'ui.contact')}</a></div></div></div><div className="header-brandbar"><div className="header-safe"><div className="header-left"><button className="mobile-toggle icon-button" aria-label={t('template.0002')} onClick={() => open('mobile')}><Icon name="menu" /></button><button className="icon-button" aria-label={t('template.0003')} onClick={() => open('search')}><Icon name="search" /></button></div><a className="header-logo" href="/index.html"><img src="/assets/images/medya/header-logo.png" alt={t('template.0005')} /></a><div className="header-right"><button className="icon-button" aria-label={t('page.0056')} onClick={() => open('profile')}><Icon name="user" /></button><button className="icon-button" aria-label={t('page.0052')} onClick={() => open('cart')}><Icon name="bag" /></button></div></div></div><div className="header-categories"><nav className="header-safe" aria-label={t('template.0009')}>{[null, ...nav].map(category => <button className={'nav-button ' + (category === null ? 'all-menu' : '')} key={category?.url || 'all'} aria-expanded={menu === (category?.name || 'all')} aria-controls="mega-menu" onClick={() => setMenu(menu === (category?.name || 'all') ? null : (category?.name || 'all'))} onPointerEnter={e => { if (e.pointerType === 'mouse') timer.current = setTimeout(() => setMenu(category?.name || 'all'), 180) }} onPointerLeave={() => clearTimeout(timer.current)} onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setMenu(category?.name || 'all') } }}>{category?.name || translate(content, language, 'ui.allMenu')}<Icon name="chevron" /></button>)}</nav></div><div className="header-collection"><div className="header-safe"><a href="/koleksiyonlar/hm-1864-serisi/index.html">{t('template.0015')}</a></div></div>{menu && <section id="mega-menu" className="mega-menu" aria-label={t('template.0016')}><div className="mega-head"><div className="mega-tabs">{['online', 'store'].map(t => <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}>{translate(content, language, t === 'online' ? 'ui.onlineMenu' : 'ui.storeMenu')}</button>)}</div><button className="icon-button" onClick={() => setMenu(null)} aria-label={t('ui.copy.028')}>×</button></div><div className="mega-columns">{cats.map(c => <div key={c.name}><h3><a href={tab === 'online' ? local(c.url) : '/magaza-menu/' + slug(c.name) + '/index.html'}>{c.name}</a></h3>{menuSubcategories(data, c.name, tab).map(s => <a key={s.url} href={tab === 'online' ? local(s.url) : '/magaza-menu/' + slug(c.name) + '/' + slug(s.name) + '/index.html'}>{s.name}</a>)}</div>)}</div></section>}</header>{menu && <div className="menu-scrim" onClick={() => setMenu(null)} />}</> }
function Card({ product: p }) { const t = useText(), { currency, language, missing } = usePrice(); return <article className="product-card"><a className="product-picture" href={local(p.url)}><Media src={imageUrl(p.images[0])} alt={p.name} /></a><div className="product-card-body"><h3><a href={local(p.url)}>{p.name}</a></h3><p className="muted">{t('ui.productCode')} {p.code}</p><div className="card-meta"><span>{cardPrice(p, missing, t('ui.from'), currency, language)}</span></div><a className="button" href={local(p.url)}>{t('template.0127')}</a></div></article> }
function Template({ node, skipHero = false }) {
  const { data, preferences, regions, content, setModal, year, setYear } = useApp(); const t = useText(); const language = preferences?.language || regions.defaultLanguage; if (typeof node === 'string') return templateText(content, language, node); if (!node) return null; const a = node.attrs || {}, children = node.children || []; if ('data-hero-slider' in a && !skipHero) return <Hero node={node} />; if (node.tag === 'article' && a['data-product']) { const p = data.products.find(p => p.key === a['data-product']); return p ? <Card product={p} /> : null } if ('data-region-label' in a) return <span>{translate(content, language, 'region.group.' + (preferences?.group || countryDefaults(regions, regions.defaultCountry).group))} / {preferences?.countryName || translate(content, language, 'region.country.' + (preferences?.country || regions.defaultCountry))} / {regions.languages.find(l => l.code === preferences?.language)?.name || regions.languages.find(l => l.code === regions.defaultLanguage)?.name} / {preferences?.currency || regions.defaultCurrency}</span>; if ((a.class || '').split(' ').includes('media')) { const img = children.find(c => c?.tag === 'img'); return <Media src={a['data-asset'] ? local(a['data-asset']) : null} alt={templateText(content, language, img?.attrs.alt)} className={a.class.replace(/\bmedia\b/g, '')} /> }
  const props = {}; const map = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', autocomplete: 'autoComplete', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', viewbox: 'viewBox', maxlength: 'maxLength', minlength: 'minLength', readonly: 'readOnly' }; for (const [k, v] of Object.entries(a)) { if (k === 'style' || k.startsWith('on')) continue; let key = map[k] || k; if (['hidden', 'open', 'disabled', 'required', 'checked', 'inert'].includes(k)) props[key] = true; else if (k === 'href' || k === 'src') props[key] = local(v); else props[key] = templateText(content, language, v ?? ''); } if (a['data-open']) props.onClick = () => setModal(a['data-open'].replace('-dialog', '')); if (a['data-scroll']) props.onClick = e => e.currentTarget.closest('.product-section')?.querySelector('.carousel')?.scrollBy({ left: Number(a['data-scroll']) * 400, behavior: 'smooth' });
  if (a['data-year']) { props['aria-selected'] = year === a['data-year']; props.tabIndex = year === a['data-year'] ? 0 : -1; props.onClick = () => setYear(a['data-year']); props.onKeyDown = e => { const years = ['1864', '1888', '1923', '1925', '1926']; if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const i = years.indexOf(year), next = e.key === 'Home' ? 0 : e.key === 'End' ? 4 : (i + (e.key === 'ArrowRight' ? 1 : -1) + 5) % 5; setYear(years[next]); document.getElementById('year-' + years[next])?.focus(); } }; } if (a.id === 'heritage-content' && year !== '1864') return <div id="heritage-content" role="tabpanel" aria-labelledby={'year-' + year}><h3>{year}</h3><p>{t('ui.copy.002')}</p><a href="/asirlik-miras/donum-noktalari/index.html">{t('page.0032')}</a></div>; if (node.tag === 'main') return <>{children.map((c, i) => <Template key={i} node={c} />)}</>; if (node.tag === 'details') return <Disclosure attrs={props} nodes={children} />; if (['img', 'input', 'br', 'hr'].includes(node.tag)) return React.createElement(node.tag, props); return React.createElement(node.tag, props, ...children.map((c, i) => <Template key={i} node={c} />));
}
function Disclosure({ attrs, nodes }) { const [open, setOpen] = useState(() => !!attrs.open && !matchMedia('(max-width:640px)').matches); return <details {...attrs} open={open} onToggle={e => setOpen(e.currentTarget.open)}>{nodes.map((n, i) => <Template key={i} node={n} />)}</details> }
function descendants(n, test, out = []) { if (n && typeof n !== 'string') { if (test(n)) out.push(n); for (const c of n.children || []) descendants(c, test, out) } return out }
function Hero({ node }) { const t = useText(); const slides = descendants(node, n => (n.attrs.class || '').split(' ').includes('hero-slide')); const [current, setCurrent] = useState(0), [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches), [hover, setHover] = useState(false), [hidden, setHidden] = useState(document.hidden); const touch = useRef(null); useEffect(() => { const handler = () => setHidden(document.hidden); document.addEventListener('visibilitychange', handler); return () => document.removeEventListener('visibilitychange', handler) }, []); useEffect(() => { if (paused || hover || hidden) return; const timer = setInterval(() => setCurrent(i => (i + 1) % slides.length), 5000); return () => clearInterval(timer) }, [paused, hover, hidden, slides.length]); const step = d => setCurrent(i => (i + d + slides.length) % slides.length); return <section className="hero-slider" aria-label={t('ui.copy.038')} onPointerEnter={e => e.pointerType === 'mouse' && setHover(true)} onPointerLeave={() => setHover(false)} onFocusCapture={() => setPaused(true)} onTouchStart={e => touch.current = e.touches[0].clientX} onTouchEnd={e => { const delta = e.changedTouches[0].clientX - touch.current; if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1) }}><div className="hero-viewport"><div className="hero-track" style={{ transform: `translate3d(-${current * 100}%,0,0)` }}>{slides.map((slide, i) => <div className="react-slide" key={i} inert={i !== current} aria-hidden={i !== current}><Template node={slide} /></div>)}</div></div><div className="hero-controls"><button aria-label={t('template.0104')} onClick={() => step(-1)}>←</button><span>{current + 1} / {slides.length}</span>{slides.map((_, i) => <button key={i} aria-label={t('ui.slideNumber', { count: i + 1 })} aria-current={i === current ? 'true' : undefined} onClick={() => setCurrent(i)}>●</button>)}<button aria-label={t('template.0111')} onClick={() => step(1)}>→</button><button onClick={() => setPaused(p => !p)}>{paused ? t('ui.resume') : t('ui.pause')}</button></div></section> }
function Breadcrumb({ title }) { const t = useText(); return <nav className="breadcrumb" aria-label={t('template.0164')}><a href="/index.html">{t('template.0165')}</a><span>/</span><a href="/urunler/index.html">{t('page.0013')}</a><span>/</span><span aria-current="page">{title}</span></nav> }
function Overview() { const { data } = useApp(); const t = useText(); return <><Breadcrumb title={t('page.0013')} /><section className="catalog-hero"><p className="eyebrow">{t('template.0137')}</p><h1>{t('page.0013')}</h1><p>{t('ui.countCategoriesProducts', { categories: data.categories.length, products: data.products.length })}</p></section><section className="catalog-category-grid">{data.categories.map(c => <a className="catalog-category" href={local(c.url)} key={c.url}><h2>{c.name}</h2><p>{t('ui.countProducts', { count: data.products.filter(p => p.category === c.name).length })}</p></a>)}</section></> }
function Category({ category: c }) { const { data } = useApp(); const t = useText(); const [query, setQuery] = useState(''), [sort, setSort] = useState('default'), [columns, setColumns] = useState(3); const parent = c.category || c.name; const products = data.products.filter(p => p.category === parent && (!c.category || p.subcategory === c.name)).filter(p => match(p, query)); if (sort !== 'default') products.sort((a, b) => a.name.localeCompare(b.name, 'tr') * (sort === 'name-desc' ? -1 : 1)); return <><Breadcrumb title={c.name} /><section className="catalog-hero"><h1>{c.name}</h1><p>{t('ui.countProducts', { count: products.length })}</p></section><nav className="catalog-tabs">{[...data.categories.filter(c => c.name === parent), ...data.subcategories.filter(s => s.category === parent)].map(s => <a href={local(s.url)} key={s.url} aria-current={s.url === c.url ? 'page' : undefined}>{s.name}</a>)}</nav><section className="catalog"><div className="catalog-tools"><span role="status">{t('ui.countProducts', { count: products.length })}</span><div><input aria-label={t('ui.copy.034')} type="search" placeholder={t('ui.copy.037')} value={query} onChange={e => setQuery(e.target.value)} /><select aria-label={t('ui.copy.033')} value={sort} onChange={e => setSort(e.target.value)}><option value="default">{t('ui.copy.027')}</option><option value="name">{t('ui.copy.025')}</option><option value="name-desc">{t('ui.copy.026')}</option></select>{[3, 4].map(n => <button key={n} aria-pressed={columns === n} onClick={() => setColumns(n)}>{t('ui.columns', { count: n })}</button>)}</div></div><div className={'product-grid ' + (columns === 4 ? 'four-columns' : '')}>{products.map(p => <Card product={p} key={p.key} />)}</div>{!products.length && <p>{t('ui.copy.024')}</p>}</section></> }
function Text({ value }) { const t = useText(); return <p className="product-text">{value || t('ui.copy.039')}</p> }
function OrderAvailability() { const { data } = useApp(), t = useText(); return <section className="order-availability" aria-label={t('ui.storeOnlyTitle')}><h3>{t('ui.storeOnlyTitle')}</h3><p>{t('ui.storeOnlyNote')}</p><div className="order-platforms">{(data.orderPlatforms || []).map(platform => { const logo = <><img src={platform.logo} alt={platform.name} /><span>{platform.name}</span></>; return platform.url ? <a key={platform.id} href={platform.url} target="_blank" rel="noopener noreferrer">{logo}</a> : <div key={platform.id}>{logo}</div> })}</div></section> }
function EditorialSections({ product }) { const { preferences, regions } = useApp(), t = useText(); const language = preferences?.language || regions.defaultLanguage; return <div className="product-editorial">{localizedEditorial(product.editorial, language).filter(section => section.enabled !== false).map((section, i) => { const title = section.title || t(section.type === 'story' ? 'ui.productStory' : 'ui.boxReuse'); const paragraphs = (section.paragraphs || []).filter(p => typeof p === 'string' && p.trim()); return <section key={section.type} className={'editorial-section ' + (i % 2 ? 'editorial-reverse' : '')} aria-labelledby={'editorial-' + section.type}><div className="editorial-image"><Media src={section.image ? local(section.image) : null} alt={section.imageAlt || title} /></div><div className="editorial-copy"><h2 id={'editorial-' + section.type}>{title}</h2>{paragraphs.length ? paragraphs.map((paragraph, j) => <p key={j}>{paragraph}</p>) : <p className="muted">{t('ui.editorialPending')}</p>}</div></section> })}</div> }

function Product({ product: p }) {
  const { data, setModal, setLightbox } = useApp();
  const t = useText();
  const { currency, language, missing } = usePrice();

  const [variant, setVariant] = useState(p.variants[0]?.code || '');
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const v = choice(p, variant, currency);
  const src = imageUrl(selectedImage || v.image);

  const others = data.products
    .filter((x) => x.key !== p.key && x.category === p.category)
    .sort(
      (a, b) =>
        Number(b.subcategory === p.subcategory) -
        Number(a.subcategory === p.subcategory)
    )
    .slice(0, 3);

  const clamp = (n) => Math.max(1, Math.min(99, Math.trunc(Number(n)) || 1));

  return (
    <>
      <Breadcrumb title={p.name} />

      <section className="product-detail catalog-detail">
        <div>
          <button
            className="product-main-image"
            onClick={() => {
              setLightbox({ src, alt: p.name });
              setModal('lightbox');
            }}
            aria-label={t('ui.copy.029')}
          >
            <Media src={src} alt={p.name} />
          </button>

          <div className="product-gallery">
            {p.images.length > 1 &&
              p.images.map((file, i) => (
                <button
                  className="gallery-thumb"
                  key={file}
                  onClick={() => setSelectedImage(file)}
                  aria-label={t('ui.imageNumber', { count: i + 1 })}
                >
                  <Media src={imageUrl(file)} alt="" />
                </button>
              ))}
          </div>
        </div>

        <div className="product-info">
          <small>
            {t('ui.productCode')} {p.code}
            {v.sku !== p.code ? t('ui.sku') + v.sku : ''}
          </small>

          <h1>{p.name}</h1>

          <Text value={v.description} />

          <div className="detail-price">
            {money(v.price, currency, missing, language)}
          </div>

          <fieldset className="product-variants">
            <legend>{t('ui.copy.004')}</legend>
            <div className="variant-options">
              {p.variants.map((v) => (
                <label key={v.code} className="variant-choice">
                  <input
                    type="radio"
                    name="variant"
                    value={v.code}
                    checked={variant === v.code}
                    onChange={() => {
                      setVariant(v.code);
                      setSelectedImage(null);
                    }}
                  />
                  <span>{v.label || v.code}</span>
                </label>
              ))}
            </div>

            <p className="muted" aria-live="polite">
              {v.portion && <>{v.portion} · </>}
              {v.weight || t('ui.copy.040')} ·{' '}
              {v.stock == null
                ? t('ui.copy.041')
                : v.stock === 0
                ? t('ui.copy.042')
                : t('ui.stockCount', { count: v.stock })}
            </p>
          </fieldset>

          {storeOnly(p, variant) ? (
            <OrderAvailability />
          ) : (
            <>
              {/* Purchase integration is not connected yet. */}
              <div className="purchase-row">
                <div className="quantity">
                  <button
                    onClick={() => setQty(clamp(qty - 1))}
                    aria-label={t('ui.copy.030')}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    aria-label={t('ui.copy.032')}
                    value={qty}
                    onChange={(e) => setQty(clamp(e.target.value))}
                  />
                  <button
                    onClick={() => setQty(clamp(qty + 1))}
                    aria-label={t('ui.copy.031')}
                  >
                    +
                  </button>
                </div>
                <button className="button button-grey" disabled>
                  {t('ui.copy.005')}
                </button>
              </div>
              <p className="muted">{t('ui.copy.006')}</p>
            </>
          )}

          <div className="accordions">
            <details>
              <summary>{t('ui.copy.007')}</summary>
              <div>
                <Text value={v.ingredients} />
                <Text
                  value={
                    v.allergenInfo ||
                    (p.allergens == null
                      ? t('ui.copy.043')
                      : p.allergens.length
                      ? t('ui.allergens', { items: p.allergens.join(', ') })
                      : t('ui.copy.044'))
                  }
                />
              </div>
            </details>

            <details>
              <summary>{t('ui.copy.008')}</summary>
              <div>
                {p.nutrition?.values.length ? (
                  <>
                    <Text value={p.nutrition.basis} />
                    <table className="nutrition-table">
                      <tbody>
                        {p.nutrition.values.map((n, i) => (
                          <tr key={i}>
                            <th scope="row">{n.name}</th>
                            <td>
                              {n.value ?? t('ui.infoPending')} {n.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <Text />
                )}
              </div>
            </details>

            {[
              [t('ui.copy.045'), v.servingSuggestion],
              [t('ui.copy.046'), v.storage],
              [t('ui.copy.047'), v.longTermStorage],
              [t('ui.copy.048'), v.delivery],
              [t('ui.copy.049'), v.packaging],
            ].map(([title, text]) => (
              <details key={title}>
                <summary>{title}</summary>
                <div>
                  <Text value={text} />
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <EditorialSections product={p} />

      <section className="product-section">
        <h2>{t('ui.copy.003')}</h2>
        <div className="product-grid">
          {others.map((p) => (
            <Card key={p.key} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}

function Stores() { const t = useText(); const [query, setQuery] = useState(''), [country, setCountry] = useState('TR'); const cards = descendants(templates.stores, n => (n.attrs.class || '').split(' ').includes('store-card')).filter(n => n.attrs['data-country'] === country && match({ name: n.attrs['data-store-name'] }, query)); return <><Breadcrumb title={t('ui.stores')} /><section className="store-locator"><div className="map-panel"><div className="map-placeholder"><h2>{t('template.0167')}</h2><p>{t('template.0168')}</p></div></div><div className="store-list"><h1>{t('template.0170')}</h1><label>{t('ui.copy.009')}<select value={country} onChange={e => setCountry(e.target.value)}><option value="TR">{t('region.country.TR')}</option><option value="AE">{t('region.country.AE')}</option><option value="GB">{t('region.country.GB')}</option></select></label><label>{t('ui.copy.010')}<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label><p role="status">{t('ui.countStores', { count: cards.length })}</p><div className="store-results">{cards.map((c, i) => <Template node={c} key={i} />)}</div></div></section></> }
function RegionForm({ regions, content, preferences, onSave }) {
  const initialCountry = preferences?.country || regions.defaultCountry;
  const [group, setGroup] = useState(preferences?.group || countryDefaults(regions, initialCountry).group);
  const [country, setCountry] = useState(initialCountry);
  const [countryName, setCountryName] = useState(preferences?.countryName || '');
  const [language, setLanguage] = useState(preferences?.language || countryDefaults(regions, initialCountry).language);
  const [currency, setCurrency] = useState(preferences?.currency || countryDefaults(regions, initialCountry).currency);
  const market = regions.groups.find(g => g.id === group);
  const selectCountry = code => { const defaults = countryDefaults(regions, code); setCountry(code); setLanguage(defaults.language); setCurrency(defaults.currency); setCountryName('') };
  const languageOption = code => <option value={code} key={code}>{regions.languages.find(l => l.code === code)?.name || code}</option>;
  return <form onSubmit={e => { e.preventDefault(); onSave({ group, country, language, currency, ...(country === 'OTHER' ? { countryName: countryName.trim() } : {}) }) }}>
    <label>{translate(content, language, 'ui.marketGroup')}<select name="group" value={group} onChange={e => { const next = regions.groups.find(g => g.id === e.target.value); setGroup(next.id); selectCountry(next.countries[0]) }}>{regions.groups.map(g => <option value={g.id} key={g.id}>{translate(content, language, 'region.group.' + g.id)}</option>)}</select></label>
    <label>{translate(content, language, 'ui.country')}<select name="country" value={country} onChange={e => selectCountry(e.target.value)}>{market.countries.map(code => <option value={code} key={code}>{translate(content, language, 'region.country.' + code)}</option>)}</select></label>
    {country === 'OTHER' && <label>{translate(content, language, 'ui.otherCountryName')}<input name="countryName" value={countryName} onChange={e => setCountryName(e.target.value)} maxLength="100" required /></label>}
    <label>{translate(content, language, 'ui.language')}<select name="language" value={language} onChange={e => setLanguage(e.target.value)}><optgroup label={translate(content, language, 'region.group.' + group)}>{market.supportedLanguages.map(languageOption)}</optgroup><optgroup label={translate(content, language, 'ui.allLanguages')}>{regions.languages.filter(l => !market.supportedLanguages.includes(l.code)).map(l => languageOption(l.code))}</optgroup></select></label>
    <label>{translate(content, language, 'ui.currency')}<select name="currency" value={currency} onChange={e => setCurrency(e.target.value)}><optgroup label={translate(content, language, 'region.group.' + group)}>{market.currencies.map(code => <option value={code} key={code}>{code}</option>)}</optgroup><optgroup label={translate(content, language, 'ui.allCurrencies')}>{regions.currencies.filter(code => !market.currencies.includes(code)).map(code => <option value={code} key={code}>{code}</option>)}</optgroup></select></label>
    <p className="form-note">{formatText(content, language, 'ui.marketRecommendations', { languages: market.supportedLanguages.map(code => regions.languages.find(l => l.code === code)?.name).join(' / '), currencies: market.currencies.join(' / ') })}</p>
    <p className="form-note">{translate(content, language, 'ui.translationNote')}</p><p className="form-note">{translate(content, language, 'ui.currencyNote')}</p>
    <button className="button" type="submit">{translate(content, language, 'ui.save')}</button>
  </form>
}
function Dialogs() { const { modal, setModal, data, preferences, setPreferences, lightbox, regions, content, requiredSelection } = useApp(); const t = useText(), { currency, language, missing } = usePrice(); const ref = useRef(); const [query, setQuery] = useState(''), [showPassword, setShowPassword] = useState(false), [loginStatus, setLoginStatus] = useState(''); useEffect(() => { if (!modal) return; const dialog = ref.current, opener = document.activeElement; dialog.showModal(); document.body.classList.add('overlay-open'); return () => { if (dialog.open) dialog.close(); document.body.classList.remove('overlay-open'); opener?.focus?.() } }, [modal]); if (!modal) return null; const title = { search: t('ui.copy.036'), region: translate(content, preferences?.language || regions.defaultLanguage, 'ui.regionTitle'), profile: t('ui.copy.057'), mobile: t('ui.copy.058'), cart: t('ui.cart'), lightbox: t('ui.copy.059') }[modal]; const matches = data.products.filter(p => match(p, query)); return <dialog ref={ref} className={modal === 'search' ? 'search-dialog' : modal === 'region' ? 'region-dialog' : modal === 'lightbox' ? 'lightbox-dialog' : 'side-dialog'} aria-labelledby="dialog-title" onCancel={e => { e.preventDefault(); if (!requiredSelection) ref.current.close() }} onClose={() => setModal(null)} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (!requiredSelection && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) ref.current.close() } }}>{!requiredSelection && <button className="dialog-close icon-button" aria-label={t('ui.copy.035')} onClick={() => ref.current.close()}><Icon name="close" /></button>}<h2 id="dialog-title">{title}</h2>{modal === 'search' && <><input autoFocus type="search" aria-label={t('ui.copy.036')} placeholder={t('ui.copy.037')} value={query} onChange={e => setQuery(e.target.value)} /><p role="status">{t('ui.countFound', { count: matches.length })}</p><div>{matches.map(p => <article className="search-result" key={p.key}><a href={local(p.url)}><Media src={imageUrl(p.images[0])} alt={p.name} /></a><a href={local(p.url)}><h4>{p.name}</h4><small>{cardPrice(p, missing, t('ui.from'), currency, language)}</small></a><a href={local(p.url)}>{t('ui.copy.011')}</a></article>)}</div></>}{modal === 'region' && <RegionForm regions={regions} content={content} preferences={preferences} onSave={prefs => { save('hm1864.react.preferences', prefs); setPreferences(prefs); ref.current.close() }} />}{modal === 'profile' && <form onSubmit={e => { e.preventDefault(); setLoginStatus(t('ui.copy.050')) }}><p>{t('ui.copy.012')}</p><label>{t('ui.copy.013')}<input type="email" required autoComplete="email" /></label><label>{t('ui.copy.014')}<input type={showPassword ? 'text' : 'password'} minLength={6} required autoComplete="current-password" /></label><button type="button" onClick={() => setShowPassword(p => !p)}>{showPassword ? t('ui.hide') : t('ui.show')}</button><button className="button">{t('ui.copy.015')}</button><p role="status">{loginStatus}</p><a href="/hesabim/sifremi-unuttum.html">{t('ui.copy.017')}</a><hr /><a className="button" href="/hesabim/kayit.html">{t('ui.copy.016')}</a></form>}{modal === 'mobile' && <nav className="mobile-menu-content">{menuCategories(data).map(c => <details key={c.url}><summary>{c.name}</summary><a href={local(c.url)}>{t('ui.allCategory', { name: c.name })}</a>{menuSubcategories(data, c.name).map(s => <a key={s.url} href={local(s.url)}>{s.name}</a>)}</details>)}<a href="/magazalar/index.html">{t('ui.stores')}</a><a href="/iletisim/index.html">{t('ui.contact')}</a></nav>}{modal === 'cart' && <div className="empty-cart"><h3>{t('ui.copy.018')}</h3><p>{t('ui.copy.019')}</p><a className="button" href="/urunler/index.html">{t('ui.copy.020')}</a></div>}{modal === 'lightbox' && <Media src={lightbox?.src} alt={lightbox?.alt} />}</dialog> }
function Placeholder({ route }) { const t = useText(); return <><Breadcrumb title={route.title || t('ui.copy.051')} /><section className="placeholder-content"><p className="eyebrow">{t('template.0137')}</p><h1>{route.title || t('ui.copy.051')}</h1><p>{route.kind === '404' ? t('ui.copy.052') : route.kind === 'unavailable' ? t('ui.copy.053') : t('ui.copy.054')}</p><a className="button" href={route.target ? local(route.target) : '/index.html'}>{route.target ? t('ui.copy.055') : t('ui.copy.056')}</a></section></> }
function Page({ route }) { const { data, content, preferences, regions } = useApp(); const t = useText(); const language = preferences?.language || regions.defaultLanguage; if (route.kind === 'home') return <Template node={templates.home} />; if (route.kind === 'product') return <Product product={route.product} />; if (route.kind === 'category') return <Category category={route.category} />; if (route.kind === 'overview') return <Overview />; if (route.kind === 'stores') return <Stores />; if (route.kind === 'sitemap') return <section className="sitemap"><h1>{t('page.0142')}</h1><ul>{Object.entries(routes).map(([url, r]) => <li key={url}><a href={local(url)}>{r.titleKey ? t(r.titleKey) : r.product ? data.products.find(p => p.key === r.product)?.name || r.product : r.kind === 'catalog' ? data.categories.concat(data.subcategories).find(c => c.url === url)?.name || t('ui.copy.053') : r.title || t('ui.copy.051')}</a></li>)}</ul></section>; return <Placeholder route={route} /> }
function App() { const [rawData, setRawData] = useState(null), [regions, setRegions] = useState(null), [content, setContent] = useState(initialContent), [error, setError] = useState(''), [loading, setLoading] = useState(true), [path, setPath] = useState(location.pathname), [modal, setModal] = useState(() => read('hm1864.react.preferences', null) ? null : 'region'), [lightbox, setLightbox] = useState(null), [year, setYear] = useState('1864'), [savedPreferences, setPreferences] = useState(() => read('hm1864.react.preferences', null)); const preferences = useMemo(() => normalizePreferences(savedPreferences, regions, content), [savedPreferences, regions, content]); const data = useMemo(() => rawData && regions ? regionalCatalog(rawData, preferences, regions) : null, [rawData, preferences, regions]); const t = key => translate(content, preferences?.language || regions?.defaultLanguage || 'tr', key); useEffect(() => { const controller = new AbortController(); fetch('/assets/data/runtime.json', { cache: 'no-store', signal: controller.signal }).then(r => { if (!r.ok) throw Error(t('ui.copy.060')); return r.json() }).then(({ catalog, regions: config, content: texts }) => { const validContent = validateContent(texts), validRegions = validateRegions(config, validContent.languages); setRawData(validateRegionalCatalog(validate(catalog), validRegions)); setRegions(validRegions); setContent(validContent) }).catch(e => { if (e.name !== 'AbortError') setError(e.message) }).finally(() => setLoading(false)); return () => controller.abort() }, []); useEffect(() => { if (data && !preferences && modal !== 'region') setModal('region') }, [data, preferences, modal]); useEffect(() => { document.documentElement.lang = preferences?.language || 'tr'; document.documentElement.dir = ['ar', 'ur', 'fa'].includes(preferences?.language) ? 'rtl' : 'ltr' }, [preferences]); useEffect(() => { const pop = () => { setPath(location.pathname); setModal(null); window.scrollTo(0, 0) }; window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop) }, []); const navigate = (e) => { const a = e.target.closest('a'); if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return; const url = new URL(a.getAttribute('href'), location.href); if (url.origin !== location.origin || url.hash) return; if (!/\.html$|\/$/.test(url.pathname)) return; e.preventDefault(); document.querySelector('dialog[open]')?.close(); history.pushState(null, '', url.pathname + url.search); setPath(url.pathname); setModal(null); window.scrollTo(0, 0) }; const route = useMemo(() => { if (!data) return null; const found = resolve(path, data, routes), language = preferences?.language || regions.defaultLanguage; const item = found.product ? rawData?.products.find(p => p.key === found.product) : found.kind === 'catalog' ? rawData?.categories.concat(rawData.subcategories).find(c => c.url === path.replace(/^\//, '')) : null; const title = item ? (item.translations?.[language]?.name || item.name) : found.titleKey ? translate(content, language, found.titleKey) : found.title; return ['catalog-product', 'catalog'].includes(found.kind) ? { kind: 'unavailable', title } : ({ ...found, title }) }, [data, path, rawData, content, preferences, regions]); useEffect(() => { document.title = (route?.product?.name || route?.category?.name || route?.title || t('ui.homeTitle')) + t('ui.brandSuffix') }, [route]); if (loading) return <div className="app-status" role="status">{t('ui.copy.023')}</div>; if (error || !data) return <div className="app-status" role="alert"><h1>{t('ui.copy.021')}</h1><p>{error}</p><button className="button" onClick={() => location.reload()}>{t('ui.copy.022')}</button></div>; return <Context.Provider value={{ data, regions, content, modal, setModal, preferences, setPreferences, requiredSelection: !preferences, lightbox, setLightbox, year, setYear }}><div onClick={navigate}><Header /><main id="main" key={path}><Page route={route} /></main><Template node={templates.footer} /><Dialogs /></div></Context.Provider> }
createRoot(document.getElementById('root')).render(<App />);
