const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#14101f"/>
      <stop offset="1" stop-color="#0e0a18"/>
    </linearGradient>
  </defs>
  <rect width="400" height="250" fill="url(#g)"/>
  <g fill="none" stroke="#3a2e59" stroke-width="2">
    <circle cx="200" cy="112" r="34"/>
    <line x1="200" y1="60" x2="200" y2="90"/>
    <line x1="200" y1="134" x2="200" y2="164"/>
    <line x1="148" y1="112" x2="178" y2="112"/>
    <line x1="222" y1="112" x2="252" y2="112"/>
  </g>
  <circle cx="200" cy="112" r="3" fill="#a855f7"/>
  <text x="200" y="200" fill="#5b4b7a" font-family="monospace" font-size="13" font-weight="bold"
    letter-spacing="3" text-anchor="middle">SEM IMAGEM</text>
</svg>`;

export const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export function cover(images?: string[]): string {
  return images && images.length > 0 && images[0] ? images[0] : PLACEHOLDER_IMG;
}

export function thumbOf(url?: string | null): string {
  if (!url || url.startsWith("data:")) return url || PLACEHOLDER_IMG;
  const dot = url.lastIndexOf(".");
  if (dot === -1) return url;
  return `${url.slice(0, dot)}-thumb${url.slice(dot)}`;
}

export function onThumbError(fullUrl: string) {
  return (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.src.includes("-thumb.")) {
      el.src = fullUrl;
      el.onerror = onImgError as any;
    } else {
      onImgError(e);
    }
  };
}

export function onImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const el = e.currentTarget;
  if (el.src !== PLACEHOLDER_IMG) {
    el.src = PLACEHOLDER_IMG;
    el.onerror = null;
  }
}
