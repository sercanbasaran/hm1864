import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { storeText } from "../../stores.js";
export default function StoreReviews({ store, language }) {
  const { data } = useApp(),
    [result, setResult] = useState(null);
  const location = store.google?.businessProfileLocation;
  useEffect(() => {
    setResult(null);
    if (!location || store.google?.reviewsEnabled === false) return;
    const controller = new AbortController();
    fetch(
      "/.netlify/functions/store-reviews?store=" + encodeURIComponent(store.id),
      { signal: controller.signal, cache: "no-store" },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((value) => {
        if (!controller.signal.aborted) setResult(value);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [store.id, location, store.google?.reviewsEnabled]);
  if (result?.status !== "ready" || !result.reviews?.length) return null;
  const text = (key) => storeText(data, language, key);
  return (
    <section className="store-reviews" aria-labelledby="store-reviews-title">
      <div className="store-reviews-heading">
        <h2 id="store-reviews-title">{text("reviewTitle")}</h2>
        <span className="google-maps-attribution" translate="no">
          Google Maps
        </span>
      </div>
      <p className="store-review-notice">{text("reviewFilter")}</p>
      <div className="store-review-grid">
        {result.reviews.map((review) => (
          <article className="store-review" key={review.id}>
            <div className="store-review-author">
              {review.author.photo && (
                <img
                  src={review.author.photo}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              )}
              <strong>{review.author.name}</strong>
            </div>
            <p className="review-stars" aria-label="5 / 5">
              ★★★★★
            </p>
            <p className="store-review-text" dir="auto">
              {review.text}
            </p>
            {review.publishTime &&
              Number.isFinite(Date.parse(review.publishTime)) && (
                <time dateTime={review.publishTime}>
                  {new Intl.DateTimeFormat(language, {
                    dateStyle: "medium",
                  }).format(new Date(review.publishTime))}
                </time>
              )}
          </article>
        ))}
      </div>
      <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer">
        {text("allGoogleReviews")}
      </a>
    </section>
  );
}
