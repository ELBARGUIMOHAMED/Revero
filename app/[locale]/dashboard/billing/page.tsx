import {getTranslations} from 'next-intl/server';

import CheckoutButton from '../../../../components/dashboard/CheckoutButton';
import {requireUser} from '../../../../lib/auth';
import {FREE_INVOICE_LIMIT_PER_MONTH, hasActiveProPlan} from '../../../../lib/billing';
import {getBaseUrl} from '../../../../lib/env';
import type {SubscriptionRow} from '../../../../lib/types';

type Props = {
  params: Promise<{locale: string}>;
};

export default async function BillingPage({params}: Props) {
  const {locale} = await params;
  const t = await getTranslations('Billing');
  const {user, supabase} = await requireUser();

  const {data} = await supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle();
  const subscription = (data || null) as SubscriptionRow | null;
  const isPro = hasActiveProPlan(subscription);

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{t('title')}</h1>
        <p className="text-sm text-slate-300">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-[#0f2236] p-4 text-sm text-slate-200">
          <p className="text-base font-semibold text-white">{t('free.title')}</p>
          <p className="mt-2">{t('free.limit', {limit: FREE_INVOICE_LIMIT_PER_MONTH})}</p>
          <p>{t('free.analytics')}</p>
          <p>{t('free.pdf')}</p>
        </article>
        <article className="rounded-xl border border-cyan-300/40 bg-gradient-to-r from-blue-500/15 to-cyan-400/15 p-4 text-sm text-slate-100">
          <p className="text-base font-semibold text-white">{t('pro.title')}</p>
          <p className="mt-2">{t('pro.unlimited')}</p>
          <p>{t('pro.stripe')}</p>
          <p>{t('pro.support')}</p>
        </article>
      </div>

      <p className="text-sm text-slate-300">
        {t('currentStatus')} <span className="font-semibold capitalize text-white">{subscription?.status || t('free.title')}</span>
      </p>
      <CheckoutButton checkoutUrl={`${getBaseUrl()}/${locale}/dashboard/billing`} isPro={isPro} />
    </section>
  );
}
