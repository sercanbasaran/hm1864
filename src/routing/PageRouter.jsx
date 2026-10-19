import React from "react";
import BrandPage from "../pages/BrandPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import ProductPage from "../pages/ProductPage.jsx";
import CategoryPage from "../pages/CategoryPage.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";
import StoreDetailPage from "../pages/StoreDetailPage.jsx";
import StoresPage from "../pages/StoresPage.jsx";
import SitemapPage from "../pages/SitemapPage.jsx";
import PlaceholderPage from "../pages/PlaceholderPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import CheckoutPage from "../pages/CheckoutPage.jsx";
import OrderResultPage from "../pages/OrderResultPage.jsx";
import AccountPage from "../pages/AccountPage.jsx";

export default function PageRouter({ route }) {
  switch (route.kind) {
    case "cart": return <CartPage />;
    case "checkout": return <CheckoutPage />;
    case "order-result": return <OrderResultPage />;
    case "account": return <AccountPage />;
    case "register": return <AccountPage mode="register" />;
    case "password-reset": return <AccountPage mode="reset" />;
    case "brand":
      return <BrandPage key={route.page.id} page={route.page} />;
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
    case "store":
      return <StoreDetailPage store={route.store} />;
    case "sitemap":
      return <SitemapPage />;
    default:
      return <PlaceholderPage route={route} />;
  }
}
