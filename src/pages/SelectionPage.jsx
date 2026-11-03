import React from 'react';
import { useText } from '../hooks/useText.js';
export default function SelectionPage({route}) {
 const t = useText();
 if (route.selection !== 'pierre-loti') return <section className="selection-page"><p className="eyebrow">{t("selection.pierreLoti.text00")}</p><h1>{route.title}</h1><p>{t("selection.pierreLoti.text01")}</p><a className="button" href="/koleksiyonlar/pierre-loti-seckisi/index.html">{t("selection.pierreLoti.text02")}</a></section>;
 return <div className="selection-page">
  <section className="selection-hero"><div><p className="eyebrow">{t("selection.pierreLoti.text03")}</p><h1>Pierre Loti<br/>{t("selection.pierreLoti.text04")}</h1><p>{t("selection.pierreLoti.text05")}</p><a className="button" href="#kutunun-hikayesi">{t("selection.pierreLoti.text06")}</a></div><img src="/assets/images/seckiler/pierre-loti-kutu.jpg" alt={t("selection.pierreLoti.text07")}/></section>
  <section className="selection-story"><img src="/assets/images/seckiler/pierre-loti-halic.jpg" alt={t("selection.pierreLoti.text08")} loading="lazy"/><p className="eyebrow">{t("selection.pierreLoti.text09")}</p><h2>{t("selection.pierreLoti.text10")}</h2><p>{t("selection.pierreLoti.text11")}</p></section>
  <section id="kutunun-hikayesi"><p className="eyebrow">{t("selection.pierreLoti.text12")}</p><h2>{t("selection.pierreLoti.text13")}</h2><div className="selection-features">{[
   [t("selection.pierreLoti.text14"),t("selection.pierreLoti.text15")],
   [t("selection.pierreLoti.text16"),t("selection.pierreLoti.text17")],
   [t("selection.pierreLoti.text18"),t("selection.pierreLoti.text19")],
   [t("selection.pierreLoti.text20"),t("selection.pierreLoti.text21")]
  ].map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
  <section className="selection-story"><h2>{t("selection.pierreLoti.text22")}</h2><p>Sınırlı üretim ve tekil numaralandırma yaklaşımıyla tasarlanan Pierre Loti {t("selection.pierreLoti.text04")}, İstanbul anlatısını koleksiyon fikriyle buluşturuyor. Kutusu, lezzetler paylaşıldıktan sonra da bu deneyimin hatırasını taşıyor.</p><p className="eyebrow">{t("selection.pierreLoti.text24")}</p></section>
 </div>;
}
