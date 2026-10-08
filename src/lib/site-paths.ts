/** Use an empty base for domain-root hosting and /ai_ui for GitHub Pages. */
export function normalizeBasePath(value = "") {
  const normalized = value.replace(/\/+$/, "");
  if (normalized && !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(normalized)) {
    throw new Error("The site base path must be empty or a slash-prefixed path.");
  }
  return normalized;
}

export function assetPath(
  pathname: string,
  basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "",
) {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    throw new Error("Public asset paths must start with a single slash.");
  }
  return `${normalizeBasePath(basePath)}${pathname}`;
}
