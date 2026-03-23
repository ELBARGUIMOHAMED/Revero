'use client';

import {useTranslations} from 'next-intl';

import {useRouter} from '../../i18n/navigation';
import { createClient } from '../../lib/supabase/client';

export default function LogoutButton() {
  const t = useTranslations('Common');
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:border-blue-500 hover:text-blue-600"
    >
      {t('signOut')}
    </button>
  );
}
