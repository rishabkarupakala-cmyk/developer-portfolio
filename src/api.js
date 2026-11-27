
const STRAPI_URL = (
  import.meta.env.VITE_STRAPI_URL || "http://localhost:1337"
).replace(/\/+$/, "");

export async function fetchCollection(collection) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `${STRAPI_URL}/api/${collection}?populate=*`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${collection}: HTTP ${response.status}`
      );
    }

    const result = await response.json();

    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `Fetching ${collection} timed out after 15 seconds`
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
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
