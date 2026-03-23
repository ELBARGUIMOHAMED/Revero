'use client';

import {useTranslations} from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function ToastViewport() {
  const t = useTranslations('Toasts');
  const [dismissedKey, setDismissedKey] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const toastKey = useMemo(() => searchParams.get('toast') || '', [searchParams]);
  const message = useMemo(() => {
    if (!toastKey) return '';
    if (toastKey === 'invoice_created' || toastKey === 'invoice_updated' || toastKey === 'invoice_deleted') {
      return t(toastKey);
    }
    return '';
  }, [t, toastKey]);
  const visible = Boolean(message) && dismissedKey !== toastKey;

  useEffect(() => {
    if (!message) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('toast');
    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    router.replace(nextUrl, { scroll: false });

    const timer = window.setTimeout(() => {
      setDismissedKey(toastKey);
    }, 3200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message, pathname, router, searchParams, toastKey]);

  if (!visible || !message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="rounded-xl border border-cyan-300/40 bg-[#10263b] px-4 py-3 text-sm font-medium text-cyan-100 shadow-xl shadow-black/30 backdrop-blur">
        {message}
      </div>
    </div>
  );
}
