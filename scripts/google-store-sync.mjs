import fs from "node:fs/promises";
import { businessToken, googleJSON } from "../server/google-business.js";
const path = "public/assets/data/stores.json",
  source = JSON.parse(await fs.readFile(path, "utf8"));
const token = await businessToken();
const accounts = [];
let pageToken = "";
do {
  const url = new URL(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
  );
  if (pageToken) url.searchParams.set("pageToken", pageToken);
  const data = await googleJSON(url, token);
  accounts.push(...(data.accounts || []));
  pageToken = data.nextPageToken || "";
} while (pageToken);
const normalize = (s) =>
  (s || "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]/g, "");
const phone = (s) => (s || "").replace(/\D/g, "");
const languages = Object.keys(source.texts.title),
  report = { matched: [], added: [], ambiguous: [], skipped: [] };
const visited = new Set();
for (const account of accounts) {
  pageToken = "";
  do {
    const url = new URL(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
    );
    url.searchParams.set("pageSize", "100");
    url.searchParams.set(
      "readMask",
      "name,title,storefrontAddress,phoneNumbers,regularHours,metadata,openInfo",
    );
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const result = await googleJSON(url, token);
    for (const location of result.locations || []) {
      if (visited.has(location.name)) continue;
      visited.add(location.name);
      if (
        !normalize(location.title).includes("hafizmustafa") ||
        location.openInfo?.status === "CLOSED_PERMANENTLY"
      ) {
        report.skipped.push({ name: location.name, title: location.title });
        continue;
      }
      const resource = account.name + "/" + location.name,
        placeId = location.metadata?.placeId || "",
        number = location.phoneNumbers?.primaryPhone || "";
      const candidates = source.stores.filter(
        (s) =>
          s.google?.businessProfileLocation === resource ||
          (placeId && s.google?.placeId === placeId) ||
          (number && phone(s.phone) === phone(number)) ||
          normalize(s.translations.tr.name) === normalize(location.title),
      );
      if (candidates.length > 1) {
        report.ambiguous.push({
          resource,
          title: location.title,
          candidates: candidates.map((s) => s.id),
        });
        continue;
      }
      const address = location.storefrontAddress;
      if (!address?.addressLines?.length || !address.regionCode) {
        report.skipped.push({
          name: location.name,
          title: location.title,
          reason: "missing_public_address",
        });
        continue;
      }
      let store = candidates[0];
      if (!store) {
        const draft = (source.pendingStores || []).find((s) =>
          normalize(location.title).includes(
            normalize(s.name.replace("Hafız Mustafa 1864 ", "")),
          ),
        );
        const id = draft?.id || "google-" + location.name.split("/")[1];
        const formatted = [
          ...address.addressLines,
          address.sublocality,
          address.locality,
          address.administrativeArea,
          address.postalCode,
          address.regionCode,
        ]
          .filter(Boolean)
          .join(", ");
        const hours = (lang) =>
          (location.regularHours?.periods || [])
            .map((p) => {
              const days = [
                "SUNDAY",
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
              ];
              const weekday = new Intl.DateTimeFormat(lang, {
                weekday: "long",
                timeZone: "UTC",
              }).format(
                new Date(Date.UTC(2026, 0, 4 + days.indexOf(p.openDay))),
              );
              const time = (t) =>
                `${String(t?.hours || 0).padStart(2, "0")}:${String(t?.minutes || 0).padStart(2, "0")}`;
              if (!p.closeDay && !p.closeTime)
                return `${weekday}: ${source.texts.alwaysOpen[lang]}`;
              const closingDay =
                p.closeDay && p.closeDay !== p.openDay
                  ? new Intl.DateTimeFormat(lang, {
                      weekday: "long",
                      timeZone: "UTC",
                    }).format(
                      new Date(Date.UTC(2026, 0, 4 + days.indexOf(p.closeDay))),
                    ) + " "
                  : "";
              return `${weekday}: ${time(p.openTime)} – ${closingDay}${time(p.closeTime)}`;
            })
            .join(" · ");
        store = {
          id,
          url: `magazalar/${id}/index.html`,
          country: address.regionCode,
          city: address.locality || address.administrativeArea || "",
          phone: number,
          online: true,
          image: "",
          gallery: [],
          mapQuery: location.title + " " + formatted,
          googleMapsUrl: location.metadata?.mapsUri || "",
          sourceUrl: location.metadata?.mapsUri || "",
          products: [],
          features: [],
          deliveryPlatforms: [],
          translations: Object.fromEntries(
            languages.map((lang) => [
              lang,
              { name: location.title, address: formatted, hours: hours(lang) },
            ]),
          ),
        };
        source.stores.push(store);
        source.texts["country" + store.country] ??= Object.fromEntries(
          languages.map((lang) => [
            lang,
            new Intl.DisplayNames([lang], { type: "region" }).of(store.country),
          ]),
        );
        source.pendingStores = (source.pendingStores || []).filter(
          (s) => s.id !== id,
        );
        report.added.push({ id, resource, title: location.title });
      } else report.matched.push({ id: store.id, resource });
      store.google = {
        ...store.google,
        placeId,
        businessProfileLocation: resource,
        reviewsEnabled: true,
        verifiedAt: new Date().toISOString(),
      };
      if (!store.googleMapsUrl && location.metadata?.mapsUri)
        store.googleMapsUrl = location.metadata.mapsUri;
    }
    pageToken = result.nextPageToken || "";
  } while (pageToken);
}
await fs.mkdir("tmp", { recursive: true });
await fs.writeFile(
  "tmp/google-store-sync-report.json",
  JSON.stringify(report, null, 2) + "\n",
);
if (process.argv.includes("--apply")) {
  await fs.writeFile(path, JSON.stringify(source, null, 2) + "\n");
  console.log("Verified store mappings and additions saved to stores.json.");
} else {
  await fs.writeFile(
    "tmp/stores.google-preview.json",
    JSON.stringify(source, null, 2) + "\n",
  );
  console.log("Preview saved; use --apply after reviewing the report.");
}
console.log(
  JSON.stringify({
    matched: report.matched.length,
    added: report.added.length,
    ambiguous: report.ambiguous.length,
    skipped: report.skipped.length,
  }),
);
