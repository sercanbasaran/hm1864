import React from "react";
import HeroSlider from "../components/home/HeroSlider.jsx";
import CollectionSection from "../components/home/CollectionSection.jsx";
import FeaturedProductsSection from "../components/home/FeaturedProductsSection.jsx";
import CorporateGiftsSection from "../components/home/CorporateGiftsSection.jsx";
import StoresTeaserSection from "../components/home/StoresTeaserSection.jsx";
import HeritageSection from "../components/home/HeritageSection.jsx";

export default function HomePage() {
  return <>
    <HeroSlider />
    <CollectionSection />
    <FeaturedProductsSection />
    <CorporateGiftsSection />
    <StoresTeaserSection />
    <HeritageSection />
  </>;
}
