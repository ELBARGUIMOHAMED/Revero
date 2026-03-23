'use client';

import {useTranslations} from 'next-intl';
import { useState } from 'react';

type ProfileForm = {
  companyName: string;
  logoUrl: string;
  taxId: string;
};

type Props = {
  initialProfile: ProfileForm;
};

const inputClass =
  'mt-1 w-full rounded-xl border border-white/15 bg-[#0f2236] px-3 py-2.5 text-sm text-slate-100 shadow-sm transition-all duration-200 placeholder:text-slate-500 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/20';

export default function ProfileClientForm({ initialProfile }: Props) {
  const t = useTranslations('Profile');
  const [form, setForm] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(t('updateError'));
      setLoading(false);
      return;
    }

    setMessage(t('updated'));
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
      <label className="block text-sm font-semibold text-slate-200">
        {t('companyName')}
        <input
          className={inputClass}
          value={form.companyName}
          onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
        />
      </label>
      <label className="block text-sm font-semibold text-slate-200">
        {t('logoUrl')}
        <input
          className={inputClass}
          value={form.logoUrl}
          onChange={(event) => setForm((current) => ({ ...current, logoUrl: event.target.value }))}
        />
      </label>
      <label className="block text-sm font-semibold text-slate-200">
        {t('taxId')}
        <input
          className={inputClass}
          value={form.taxId}
          onChange={(event) => setForm((current) => ({ ...current, taxId: event.target.value }))}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? t('saving') : t('save')}
      </button>
      {message ? <p className="text-sm font-medium text-slate-300">{message}</p> : null}
    </form>
  );
}

