import { useState, useEffect } from "react";
export function useNavigation(setModal) {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const pop = () => {
      setPath(location.pathname);
      setModal(null);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  const goTo = path => {
    document.querySelector("dialog[open]")?.close();
    history.pushState(null, "", path);
    setPath(new URL(path, location.href).pathname);
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
    goTo(url.pathname + url.search);
  };
  return { path, navigate, goTo };
}
