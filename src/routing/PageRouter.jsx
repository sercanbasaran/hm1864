import React from "react";
import HomePage from "../pages/HomePage.jsx";
import ProductPage from "../pages/ProductPage.jsx";
import CategoryPage from "../pages/CategoryPage.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";
import StoresPage from "../pages/StoresPage.jsx";
import SitemapPage from "../pages/SitemapPage.jsx";
import PlaceholderPage from "../pages/PlaceholderPage.jsx";

export default function PageRouter({ route }) {
  switch (route.kind) {
    case "home":
      return <HomePage />;
    case "product":
      return <ProductPage product={route.product} />;
    case "category":
      return <CategoryPage category={route.category} />;
    case "overview":
      return <ProductsPage />;
    case "stores":
      return <StoresPage />;
    case "sitemap":
      return <SitemapPage />;
    default:
      return <PlaceholderPage route={route} />;
  }
}
