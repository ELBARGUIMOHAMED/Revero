import type { SubscriptionRow } from './types';

export const FREE_INVOICE_LIMIT_PER_MONTH = 10;

const PRO_STATUSES = new Set(['active', 'trialing', 'past_due']);

export function hasActiveProPlan(subscription: SubscriptionRow | null): boolean {
  if (!subscription) return false;
  return subscription.plan === 'pro' && PRO_STATUSES.has(subscription.status);
}
