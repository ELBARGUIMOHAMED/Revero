'use client';

import {useTranslations} from 'next-intl';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import {useRouter} from '../../i18n/navigation';
import { createClient } from '../../lib/supabase/client';

export default function LoginForm() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message || t('signInFailed'));
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-[#10263b]/85 p-6 shadow-xl shadow-black/20">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-200">{t('email')}</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-lg border border-white/15 bg-[#0f2236] px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          placeholder={t('emailPlaceholder')}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-200">{t('password')}</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="w-full rounded-lg border border-white/15 bg-[#0f2236] px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          placeholder={t('passwordPlaceholder')}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? t('signingIn') : t('signIn')}
      </button>
    </form>
  );
}
