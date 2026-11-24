"use client";

import Link from "next/link";

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  const retry = onRetry ?? (() => window.location.reload());

  return (
    <main className="loading-screen">
      <section className="empty-panel w-full max-w-xl" role="alert" aria-live="polite">
        <p className="collection-kicker">AFIYA SHOPE</p>
        <h1 className="mt-3 text-xl font-bold">
          មិនអាចភ្ជាប់ទៅកាន់កាតាឡុកបានទេ
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          សេវាកាតាឡុកកំពុងមិនដំណើរការ។ ព័ត៌មានម៉ូដមិនអាចបង្ហាញបាននៅពេលនេះទេ។
          សូមសាកល្បងម្តងទៀតនៅពេលក្រោយ។
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="primary-link" onClick={retry}>
            ព្យាយាមម្តងទៀត
          </button>
          <Link className="primary-link" href="/">
            ទំព័រដើម
          </Link>
        </div>
      </section>
    </main>
  );
}
