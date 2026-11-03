import { useState, useEffect } from "react";
import { menuChannel, channelUrl } from "../catalog-channel.js";
export function useNavigation(setModal) {
  const [locationKey, setPath] = useState(location.pathname + location.search);
  const path = locationKey.split("?")[0];
  const channel = menuChannel(locationKey.includes("?") ? locationKey.slice(locationKey.indexOf("?")) : "");
  useEffect(() => {
    const pop = () => {
      setPath(location.pathname + location.search);
      setModal(null);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  const goTo = path => {
    document.querySelector("dialog[open]")?.close();
    history.pushState(null, "", path);
    setPath(new URL(path, location.href).pathname + new URL(path, location.href).search);
    setModal(null);
    window.scrollTo(0, 0);
  };
  const navigate = (e) => {
    const a = e.target.closest("a");
    if (
      !a ||
      e.defaultPrevented ||
      e.button !== 0 ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      e.altKey ||
      a.target ||
      a.hasAttribute("download")
    )
      return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (url.origin !== location.origin || url.hash) return;
    if (!/\.html$|\/$/.test(url.pathname)) return;
    e.preventDefault();
    // Preserve store context for product/category links; explicit online links can opt out.
    const requested = a.getAttribute("data-menu-channel");
    const destination = requested === "online" ? channelUrl(url.pathname + url.search, "online") : url.searchParams.has("menu") ? url.pathname + url.search : channelUrl(url.pathname + url.search, channel);
    goTo(destination);
  };
  return { path, locationKey, channel, navigate, goTo };
}
