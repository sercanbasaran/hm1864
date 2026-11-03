import React from 'react';
export default function SelectionPage({route}) {
 if (route.selection !== 'pierre-loti') return <section className="selection-page"><p className="eyebrow">HAFIZ MUSTAFA 1864 · İSTANBUL MİRASI</p><h1>{route.title}</h1><p>Bu seçkinin hikâyesi ve detayları yakında burada.</p><a className="button" href="/koleksiyonlar/pierre-loti-seckisi/index.html">Pierre Loti Seçkisi’ni keşfedin</a></section>;
 return <div className="selection-page">
  <section className="selection-hero"><div><p className="eyebrow">İSTANBUL MİRASI — VOL I</p><h1>Pierre Loti<br/>Seçkisi</h1><p>İstanbul’a duyulan bir sevginin, şehrin lezzetleriyle buluşan hikâyesi. Haliç’in manzarasından çay ve kahve ritüellerine uzanan bu seçki, İstanbul’u keşfetmeye ve hatırlamaya davet ediyor.</p><a className="button" href="#kutunun-hikayesi">Kutunun hikâyesini keşfedin</a></div><img src="/assets/images/seckiler/pierre-loti-kutu.jpg" alt="Pierre Loti portresi ve altın detaylarla tasarlanan yeşil seçki kutusu"/></section>
  <section className="selection-story"><img src="/assets/images/seckiler/pierre-loti-halic.jpg" alt="Pierre Loti Seçkisi için Haliç manzarasından ilham alan İstanbul anlatımı" loading="lazy"/><p className="eyebrow">BİR ŞEHRİN İZİNDE</p><h2>İstanbul’u oku. İzini sür. Tadını hatırla.</h2><p>İstanbul’un gündelik hayatını, insanlarını ve atmosferini eserlerine taşıyan Pierre Loti, bu seçkinin ilham kaynağı. Eyüp’ten Haliç’e açılan manzara, şehrin hikâyeleri ve lezzetleri aynı deneyimde buluşuyor.</p></section>
  <section id="kutunun-hikayesi"><p className="eyebrow">KUTUNUN İÇİNDEKİ DENEYİM</p><h2>Her parça, hikâyeyi şehre taşır.</h2><div className="selection-features">{[
   ['01 · Mini kitapçık','Pierre Loti’nin İstanbul’a ilgisini, kentteki yaşamını, Aziyadé’yi ve Pierre Loti Tepesi’ni anlatan bir okuma yolculuğu.'],
   ['02 · Keşif rehberi','Eyüp ve Pierre Loti bölgesini keşfetmek için tasarlanan taşınabilir kroki ve ulaşım rehberi.'],
   ['03 · Lezzet ritüeli','Baklava ve siyah çay ya da lokum ve Türk kahvesi: İstanbul hikâyesine eşlik eden lezzet eşleşmeleri.'],
   ['04 · Dijital kimlik','Her kutuya özel numara ile içerik ve kutunun yolculuğunu bir araya getirmeyi amaçlayan dijital kimlik yaklaşımı.']
  ].map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  <section className="selection-story"><h2>Lezzetten sonra da kalan bir hatıra.</h2><p>Sınırlı üretim ve tekil numaralandırma yaklaşımıyla tasarlanan Pierre Loti Seçkisi, İstanbul anlatısını koleksiyon fikriyle buluşturuyor. Kutusu, lezzetler paylaşıldıktan sonra da bu deneyimin hatırasını taşıyor.</p><p className="eyebrow">OKU. İZİNİ SÜR. TAT. YAŞA. HATIRLA.</p></section>
 </div>;
}
