import type { ReactNode } from 'react';
import {useTranslations} from 'next-intl';

import {Link} from '../../i18n/navigation';
import DashboardNav from './DashboardNav';
import LogoutButton from './LogoutButton';
import ToastViewport from './ToastViewport';

type Props = {
  children: ReactNode;
  banner:
    | { type: 'free'; used: number; limit: number }
    | { type: 'pro' }
    | { type: 'admin' };
};

export default function AppShell({ children, banner }: Props) {
  const t = useTranslations('DashboardShell');

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between px-1">
              <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-slate-900">
                {t('workspace')}
              </Link>
              <LogoutButton />
            </div>
            <DashboardNav />
          </aside>

          <main className="space-y-6">
            {banner.type === 'free' ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-cyan-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-medium text-slate-700">
                  {t('freePlanUsage', {used: banner.used, limit: banner.limit})}
                </p>
                <Link
                  href="/dashboard/billing"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                >
                  {t('upgradePlan')}
                </Link>
              </div>
            ) : banner.type === 'pro' ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                {t('proPlan')}
              </div>
            ) : (
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm font-medium text-violet-700">
                {t('adminMode')}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
      <ToastViewport />
    </div>
  );
}
