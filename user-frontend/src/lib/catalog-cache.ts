import type { Product, ProductImage, ShopSettings } from "./api";

const CACHE_KEY = "afiya-catalog-cache-v1";
const cacheListeners = new Set<() => void>();
let cachedSnapshot: CachedCatalog | null | undefined;

export type CachedCatalog = {
  cachedAt: string;
  products: Product[];
  settings: ShopSettings;
};

export function subscribeCatalogCache(listener: () => void): () => void {
  cacheListeners.add(listener);
  let handleStorage: ((event: StorageEvent) => void) | undefined;
  if (typeof window !== "undefined") {
    handleStorage = (event) => {
      if (event.key !== CACHE_KEY && event.key !== null) return;
      cachedSnapshot = undefined;
      listener();
    };
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    cacheListeners.delete(listener);
    if (handleStorage) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function getCatalogCacheSnapshot(): CachedCatalog | null {
  if (cachedSnapshot === undefined) {
    cachedSnapshot = readCatalogCache();
  }
  return cachedSnapshot;
}

export function getServerCatalogCacheSnapshot(): undefined {
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProductImage(value: unknown): value is ProductImage {
  return isRecord(value)
    && typeof value.id === "number"
    && typeof value.url === "string"
    && typeof value.sort_order === "number";
}

function isProduct(value: unknown): value is Product {
  return isRecord(value)
    && typeof value.id === "number"
    && typeof value.name === "string"
    && (value.tag === "pastel" || value.tag === "luxury" || value.tag === "set")
    && typeof value.price === "number"
    && (value.old_price === null || typeof value.old_price === "number")
    && (value.stock === "in_stock" || value.stock === "out_of_stock")
    && (value.description === null || typeof value.description === "string")
    && Array.isArray(value.images)
    && value.images.every(isProductImage);
}

function isShopSettings(value: unknown): value is ShopSettings {
  return isRecord(value)
    && typeof value.shop_name === "string"
    && typeof value.shop_subtitle === "string"
    && typeof value.fb_url === "string"
    && (value.avatar_url === null || typeof value.avatar_url === "string")
    && (value.banner_url === null || typeof value.banner_url === "string")
    && typeof value.protect_copy === "boolean";
}

function isCachedCatalog(value: unknown): value is CachedCatalog {
  return isRecord(value)
    && typeof value.cachedAt === "string"
    && Array.isArray(value.products)
    && value.products.every(isProduct)
    && isShopSettings(value.settings);
}

export function readCatalogCache(): CachedCatalog | null {
  try {
    const stored = window.localStorage.getItem(CACHE_KEY);
    if (!stored) return null;

    const parsed: unknown = JSON.parse(stored);
    if (!isCachedCatalog(parsed)) {
      console.error("Ignoring invalid cached storefront data.");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Could not read cached storefront data.", error);
    return null;
  }
}

export function writeCatalogCache(products: Product[], settings: ShopSettings): void {
  const cache: CachedCatalog = {
    cachedAt: new Date().toISOString(),
    products,
    settings,
  };

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Could not save storefront data for offline use.", error);
  }

  cachedSnapshot = cache;
  for (const listener of cacheListeners) {
    listener();
  }
}
