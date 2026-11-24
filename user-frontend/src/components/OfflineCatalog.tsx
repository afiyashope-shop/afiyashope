"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { CategoryRail } from "@/components/CategoryRail";
import { OfflineState } from "@/components/OfflineState";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { ProtectedContent } from "@/components/ProtectedContent";
import { ShopFooter } from "@/components/ShopFooter";
import { ShopHeader } from "@/components/ShopHeader";
import { LoadingScreen } from "@/components/LoadingScreen";
import { formatRiel, type Product, type ShopSettings } from "@/lib/api";
import {
  getCatalogCacheSnapshot,
  getServerCatalogCacheSnapshot,
  subscribeCatalogCache,
  type CachedCatalog,
  writeCatalogCache,
} from "@/lib/catalog-cache";
import { formatNumber, translate, type Language } from "@/lib/i18n";

type OfflineCatalogProps = {
  search?: string;
  tag?: string;
  language: Language;
  productId?: string;
};

export function CatalogCacheWriter({
  products,
  settings,
}: {
  products: Product[];
  settings: ShopSettings;
}) {
  useEffect(() => {
    writeCatalogCache(products, settings);
  }, [products, settings]);

  return null;
}

export function OfflineCatalog({
  search = "",
  tag = "all",
  language,
  productId,
}: OfflineCatalogProps) {
  const catalog = useSyncExternalStore(
    subscribeCatalogCache,
    getCatalogCacheSnapshot,
    getServerCatalogCacheSnapshot,
  );

  if (catalog === undefined) {
    return <LoadingScreen message="កំពុងពិនិត្យទិន្នន័យដែលបានរក្សាទុក…" />;
  }

  if (!catalog) {
    return <OfflineState />;
  }

  const t = (text: string) => translate(language, text);

  if (productId) {
    const product = catalog.products.find((item) => String(item.id) === productId);
    if (!product) return <OfflineState />;
    return <CachedProduct catalog={catalog} product={product} language={language} />;
  }

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const products = catalog.products.filter((product) => {
    const matchesTag = tag === "all" || product.tag === tag;
    const searchableText = [
      product.name,
      product.description ?? "",
      String(product.price),
      String(product.old_price ?? ""),
    ].join(" ").toLocaleLowerCase();
    return matchesTag && (!normalizedSearch || searchableText.includes(normalizedSearch));
  });

  return (
    <ProtectedContent enabled={catalog.settings.protect_copy}>
      <ShopHeader settings={catalog.settings} activeTag={tag} search={search} language={language} />
      <section className={`fashion-hero${catalog.settings.banner_url ? " has-banner" : ""}`}>
        {catalog.settings.banner_url ? (
          <Image
            src={catalog.settings.banner_url}
            alt={t("រូបភាពបដាហាង Afiya Shope")}
            fill
            sizes="100vw"
            className="fashion-hero-image"
            unoptimized
          />
        ) : null}
        <div className="fashion-hero-shade" />
        <div className="fashion-hero-content mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="fashion-hero-copy">
            <span className="hero-kicker">{t("✨ កម្រងម៉ូដថ្មី ២០២៦")}</span>
            <h1>{t("សម្រស់សុភាពរាបសារ ជាមួយម៉ូដ Abaya ប្រណិត")}</h1>
            <p>{catalog.settings.shop_subtitle}</p>
            <a className="primary-link" href={catalog.settings.fb_url} target="_blank" rel="noopener noreferrer">
              {t("💬 ឆាតសួរព័ត៌មានតាម Facebook")} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-side-note" aria-hidden="true">
            <span>AFIYA</span>
            <span>ABAYA · 2026</span>
          </div>
        </div>
      </section>

      <CategoryRail activeTag={tag} search={search} language={language} />

      <main className="mx-auto min-h-[50vh] max-w-7xl px-3 pb-16 pt-5 sm:px-6">
        <div className="offline-cache-notice" role="status">
          {t("កំពុងបង្ហាញទិន្នន័យដែលបានរក្សាទុកក្នុងឧបករណ៍នេះ។ ព័ត៌មានអាចមិនទាន់ថ្មីបំផុតទេ។")}
        </div>
        <div className="collection-heading mt-5">
          <div>
            <span className="collection-kicker">{t("កម្រងម៉ូដ Afiya Shope")}</span>
            <h2>{search ? t("លទ្ធផលស្វែងរក") : t("ស្វែងរកម៉ូដដែលអ្នកស្រឡាញ់")}</h2>
            <p>{search ? `“${search}”` : t("ជ្រើសរើសរចនាបថដែលសមនឹងអ្នក")}</p>
          </div>
          <div className="collection-meta">
            <span className="collection-count">
              {language === "en"
                ? `${formatNumber(products.length, language)} saved styles`
                : `ម៉ូដដែលបានរក្សាទុក ${formatNumber(products.length, language)} ម៉ូដ`}
            </span>
          </div>
        </div>
        {products.length ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} language={language} />)}
          </div>
        ) : (
          <div className="empty-panel">
            <h2 className="text-lg font-bold">{t("រកមិនឃើញម៉ូដដែលអ្នកស្វែងរកទេ")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("សូមសាកល្បងពាក្យផ្សេង ឬមើលម៉ូដទាំងអស់។")}</p>
            <Link href="/" className="primary-link mt-4">{t("បង្ហាញម៉ូដទាំងអស់")}</Link>
          </div>
        )}
      </main>
      <ShopFooter settings={catalog.settings} language={language} />
    </ProtectedContent>
  );
}

function CachedProduct({
  catalog,
  product,
  language,
}: {
  catalog: CachedCatalog;
  product: Product;
  language: Language;
}) {
  const t = (text: string) => translate(language, text);
  const inStock = product.stock === "in_stock";

  return (
    <ProtectedContent enabled={catalog.settings.protect_copy}>
      <ShopHeader settings={catalog.settings} activeTag="all" search="" language={language} />
      <main className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
        <div className="offline-cache-notice mb-4" role="status">
          {t("កំពុងបង្ហាញទិន្នន័យដែលបានរក្សាទុកក្នុងឧបករណ៍នេះ។")}
        </div>
        <Link href="/" className="mb-4 inline-flex text-sm font-bold text-[#1696c4] hover:underline">
          {t("‹ ត្រឡប់ទៅបញ្ជីម៉ូដ")}
        </Link>
        <article className="grid gap-5 rounded-3xl border border-[#ff9999]/70 bg-white/90 p-3 shadow-xl shadow-pink-100/60 md:grid-cols-2 md:gap-7 md:p-6">
          <ProductGallery product={product} language={language} />
          <section className="flex flex-col gap-4 py-1">
            <div>
              <span className={`stock-badge${inStock ? "" : " out"}`}>
                {inStock ? `✅ ${t("មានក្នុងស្តុក")}` : `❌ ${t("អស់ស្តុក")}`}
              </span>
              <h1 className="mt-3 text-2xl font-bold leading-relaxed text-slate-900">{product.name}</h1>
            </div>
            <div className="flex items-baseline gap-2">
              {product.old_price ? <span className="old-price">{formatRiel(product.old_price, language)}</span> : null}
              <span className="detail-price">{formatRiel(product.price, language)}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-8 text-slate-600">
              {product.description || t("សូមឆាតមកកាន់ហាងដើម្បីសួរព័ត៌មានបន្ថែមអំពីម៉ូដនេះ។")}
            </p>
            <a className="primary-link mt-auto" href={catalog.settings.fb_url} target="_blank" rel="noopener noreferrer">
              {t("💬 បញ្ជាទិញម៉ូដនេះតាម Facebook")}
            </a>
          </section>
        </article>
      </main>
      <ShopFooter settings={catalog.settings} language={language} />
    </ProtectedContent>
  );
}
