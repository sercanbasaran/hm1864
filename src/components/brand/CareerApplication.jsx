import React, { useState } from 'react';
import { useText } from '../../hooks/useText.js';

export default function CareerApplication() {
  const t = useText();
  const [done, setDone] = useState(false);
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
    <p>{label('intro')}</p>
    <p className="career-demo-notice">{label('demo')}</p>
    <a href="https://www.hafizmustafa.com/i%CC%87%C5%9F-ba%C5%9Fvurusu" target="_blank" rel="noopener noreferrer">{label('official')} ↗</a>
    <form className="career-form" onSubmit={submit}>
      <label className="career-wide">{label('position')} *<input name="position" required maxLength="120" /></label>
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
  </section>;
}
