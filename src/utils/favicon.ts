const base = import.meta.env.BASE_URL;
export const DEFAULT_FAVICON = base.endsWith("/") ? `${base}favicon.svg` : `${base}/favicon.svg`;

const FAVICON_SELECTOR = 'link[rel="icon"]';

export function setFavicon(url: string | null): void {
  const link =
    document.querySelector<HTMLLinkElement>(FAVICON_SELECTOR) ||
    (() => {
      const el = document.createElement("link");
      el.rel = "icon";
      document.head.appendChild(el);
      return el;
    })();
  if (url) {
    link.href = url;
    link.type = url.startsWith("data:image/svg") ? "image/svg+xml" : "image/png";
  } else {
    link.href = DEFAULT_FAVICON;
    link.type = "image/svg+xml";
  }
}
