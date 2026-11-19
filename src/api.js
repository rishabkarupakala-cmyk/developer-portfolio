
const STRAPI_URL = (
  import.meta.env.VITE_STRAPI_URL || "http://localhost:1337"
).replace(/\/+$/, "");

export async function fetchCollection(collection) {
  const response = await fetch(
    `${STRAPI_URL}/api/${collection}?populate=*`
  );

  if (!response.ok) {
    throw new Error(`${collection}: HTTP ${response.status}`);
  }

  const result = await response.json();
  return Array.isArray(result.data) ? result.data : [];
}

export function getStrapiImage(media) {
  if (!media) return "";

  const item = media.data ?? media;
  const image = Array.isArray(item) ? item[0] : item;

  if (!image) return "";

  const url = image.url || image.attributes?.url;

  if (!url) return "";

  return url.startsWith("http")
    ? url
    : `${STRAPI_URL}${url}`;
}
