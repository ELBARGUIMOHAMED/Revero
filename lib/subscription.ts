import 'server-only';

import { createAdminClient } from './supabase/admin';
import type { PlanType, UserRole } from './types';

type UserSubscription = {
  plan: PlanType;
  role: UserRole;
};

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('plan, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const plan: PlanType = data?.plan === 'pro' ? 'pro' : 'free';
  const role: UserRole = data?.role === 'admin' ? 'admin' : 'user';

  return { plan, role };
}
