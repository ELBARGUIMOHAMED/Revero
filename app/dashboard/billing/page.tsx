import CheckoutButton from '../../../components/dashboard/CheckoutButton';
import { requireUser } from '../../../lib/auth';
import { FREE_INVOICE_LIMIT_PER_MONTH, hasActiveProPlan } from '../../../lib/billing';
import { getBaseUrl } from '../../../lib/env';
import type { SubscriptionRow } from '../../../lib/types';

export default async function BillingPage() {
  const { user, supabase } = await requireUser();

  const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle();
  const subscription = (data || null) as SubscriptionRow | null;
  const isPro = hasActiveProPlan(subscription);

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Billing</h1>
        <p className="text-sm text-slate-300">Manage your subscription and unlock unlimited invoicing.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-white/10 bg-[#0f2236] p-4 text-sm text-slate-200">
          <p className="text-base font-semibold text-white">Free Plan</p>
          <p className="mt-2">{FREE_INVOICE_LIMIT_PER_MONTH} invoices/month</p>
          <p>Basic analytics</p>
          <p>PDF export</p>
        </article>
        <article className="rounded-xl border border-cyan-300/40 bg-gradient-to-r from-blue-500/15 to-cyan-400/15 p-4 text-sm text-slate-100">
          <p className="text-base font-semibold text-white">Pro Plan ($19/month)</p>
          <p className="mt-2">Unlimited invoices</p>
          <p>Stripe integration</p>
          <p>Advanced analytics + Priority support</p>
        </article>
      </div>

      <p className="text-sm text-slate-300">Current status: <span className="font-semibold capitalize text-white">{subscription?.status || 'free'}</span></p>
      <CheckoutButton checkoutUrl={`${getBaseUrl()}/dashboard/billing`} isPro={isPro} />
    </section>
  );
}

