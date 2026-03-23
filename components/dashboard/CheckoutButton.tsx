'use client';

import {useTranslations} from 'next-intl';
import { useState } from 'react';

type Props = {
  checkoutUrl: string;
  isPro: boolean;
};

export default function CheckoutButton({ checkoutUrl, isPro }: Props) {
  const t = useTranslations('Billing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function startCheckout() {
    setError('');
    setLoading(true);

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnUrl: checkoutUrl }),
    });

    const payload = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !payload.url) {
      setError(t('checkoutError'));
      setLoading(false);
      return;
    }

    window.location.href = payload.url;
  }

  if (isPro) {
    return (
      <p className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-200 ring-1 ring-inset ring-emerald-300/40">
        {t('active')}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? t('redirecting') : t('upgrade')}
      </button>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

