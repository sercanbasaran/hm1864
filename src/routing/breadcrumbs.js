import { resolve } from "../model.js";

// Product hierarchy comes from taxonomy IDs; other pages use sitemap ancestors.
export function buildBreadcrumbs({
  path,
  route,
  data,
  rawData = data,
  routes,
  t,
  language = "tr",
}) {
  if (!route || route.kind === "home") return [];
  const home = { label: t("template.0165"), url: "index.html" };
  const label = (item) => item.translations?.[language]?.name || item.name;
  const source =
    route.kind === "unavailable" ? resolve(path, rawData, routes) : route;
  const catalog = route.kind === "unavailable" ? rawData : data;
  const crumbs = [home];
  const add = (item) => {
    if (item && !crumbs.some((c) => c.url === item.url))
      crumbs.push({ label: label(item), url: item.url });
  };
  if (
    typeof source.product === "object" ||
    typeof source.category === "object"
  ) {
    const product = source.product;
    const category = product
      ? catalog.categories.find(
          (c) => c.id === product.categoryId || c.name === product.category,
        )
      : source.category.category
        ? catalog.categories.find(
            (c) =>
              c.id === source.category.categoryId ||
              c.name === source.category.category,
          )
        : source.category;
    const subcategory = product
      ? catalog.subcategories.find(
          (s) =>
            s.id === product.subcategoryId ||
            (s.category === product.category && s.name === product.subcategory),
        )
      : source.category.category
        ? source.category
        : null;
    add(category);
    add(subcategory);
    add(product);
  } else {
    const input = decodeURI(path).replace(/^\//, "") || "index.html";
    const candidates = input.endsWith("/")
      ? [input + "index.html", input.slice(0, -1) + ".html"]
      : /\.html$/.test(input)
        ? [input]
        : [input + ".html", input + "/index.html"];
    let url = candidates.find((candidate) => routes[candidate]) || input;
    if (routes[url]?.kind === "alias" && routes[url].target)
      url = routes[url].target;
    const parts = url.split("/");
    for (let i = 1; i < parts.length; i++) {
      const parentUrl = parts.slice(0, i).join("/") + "/index.html";
      const parent = routes[parentUrl];
      if (parent && parentUrl !== url && parentUrl !== "urunler/index.html")
        crumbs.push({
          label: parent.titleKey
            ? t(parent.titleKey)
            : parent.title || parent.parent,
          url: parentUrl,
        });
    }
    crumbs.push({
      label:
        route.title || (route.titleKey ? t(route.titleKey) : t("ui.copy.051")),
      url,
    });
  }
  return crumbs.map((crumb, index) =>
    index === crumbs.length - 1 ? { label: crumb.label, current: true } : crumb,
  );
}
