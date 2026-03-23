import AppShell from '../../../components/ui/AppShell';
import { requireUser } from '../../../lib/auth';
import { FREE_INVOICE_LIMIT_PER_MONTH, hasActiveProPlan } from '../../../lib/billing';
import { getUserSubscription } from '../../../lib/subscription';
import type { SubscriptionRow } from '../../../lib/types';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, supabase } = await requireUser();

  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

  const [{ data: subscriptionData }, { count }, userSubscription] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monthStart),
    getUserSubscription(user.id),
  ]);

  const subscription = (subscriptionData || null) as SubscriptionRow | null;
  const isPro = userSubscription.plan === 'pro' || hasActiveProPlan(subscription);

  const banner =
    userSubscription.role === 'admin'
      ? ({ type: 'admin' } as const)
      : isPro
        ? ({ type: 'pro' } as const)
        : ({
            type: 'free',
            used: count || 0,
            limit: FREE_INVOICE_LIMIT_PER_MONTH,
          } as const);

  return <AppShell banner={banner}>{children}</AppShell>;
}
