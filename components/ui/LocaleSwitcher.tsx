'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useTransition} from 'react';
import type {ChangeEvent} from 'react';

import {routing} from '../../i18n/routing';
import {usePathname, useRouter} from '../../i18n/navigation';

export default function LocaleSwitcher() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;

    startTransition(() => {
      router.replace(pathname, {locale: nextLocale});
      router.refresh();
    });

    void fetch('/api/preferences/locale', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({locale: nextLocale}),
    }).catch(() => {});
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs text-slate-200">
      <span className="hidden sm:inline">{t('language')}</span>
      <select
        aria-label={t('language')}
        value={locale}
        disabled={pending}
        onChange={onChange}
        className="rounded-xl border border-white/20 bg-transparent px-2 py-1 text-xs font-semibold text-slate-100 outline-none transition-colors hover:border-cyan-300/70"
      >
        {routing.locales.map((item) => (
          <option key={item} value={item} className="text-slate-900">
            {item.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
