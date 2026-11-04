import React, { useEffect, useRef, useState } from 'react';
import { useText } from '../../hooks/useText.js';

export default function CareerApplication() {
  const t = useText();
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState(null);
  const formHeading = useRef(null);
  useEffect(() => { if (selected) formHeading.current?.focus(); }, [selected]);
  const [fileError, setFileError] = useState(false);
  const label = name => t('careers.application.' + name);
  function submit(event) {
    event.preventDefault();
    const file = event.currentTarget.elements.cv.files[0];
    if (!file || !/\.(pdf|docx)$/i.test(file.name)) { setFileError(true); return; }
    setFileError(false);
    setDone(true);
    event.currentTarget.reset();
  }
  return <section className="brand-section career-application" id="acik-pozisyonlar" aria-labelledby="career-application-title">
    <div className="brand-section-heading"><h2 id="career-application-title">{label('title')}</h2></div>
    <p className="career-demo-notice">{label('sampleNotice')}</p>
    <div className="career-position-grid" aria-label={label('sampleTitle')}>
      {['service', 'sales', 'cashier', 'barista', 'kitchen', 'production', 'warehouse', 'general'].map(position => <article className="career-position" key={position}>
        <h3>{label(position)}</h3>
        <p>{label('sampleDescription')}</p>
        <button className="button" type="button" onClick={() => { setSelected(position); setDone(false); setFileError(false); }}>{label('apply')}</button>
      </article>)}
    </div>
    {selected && <div className="career-application-panel">
    <h3 ref={formHeading} tabIndex={-1}>{label('selected')}: {label(selected)}</h3>
    <p className="career-demo-notice">{label('demo')}</p>
    <form key={selected} className="career-form" onSubmit={submit}>
      <label className="career-wide">{label('position')}<input name="position" value={label(selected)} readOnly /></label>
      <label>{label('first')} *<input name="first" autoComplete="given-name" required /></label>
      <label>{label('last')} *<input name="last" autoComplete="family-name" required /></label>
      <label>{label('birth')}<input name="birth" type="date" /></label>
      <label>{label('phone')} *<input name="phone" type="tel" autoComplete="tel" required /></label>
      <label>{label('email')} *<input name="email" type="email" autoComplete="email" required /></label>
      <label>{label('address')} *<input name="address" autoComplete="street-address" required /></label>
      <label className="career-wide">{label('education')} *<input name="education" required /></label>
      <label className="career-wide">{label('experience')}<input name="experience" /></label>
      <label className="career-wide">{label('latest')}<textarea name="latest" rows="2" /></label>
      <label className="career-wide">{label('previous')}<textarea name="previous" rows="2" /></label>
      <label className="career-wide">{label('cover')}<textarea name="cover" rows="4" /></label>
      <label className="career-wide">{label('cv')} *<input name="cv" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required onChange={() => setFileError(false)} aria-invalid={fileError} /></label>
      {fileError && <p className="career-wide" role="alert">{label('cv')}</p>}
      <div className="career-wide"><button className="button" type="submit">{label('submit')}</button></div>
    </form>
    {done && <p className="career-demo-notice" role="status">{label('success')}</p>}
    </div>}
  </section>;
}
