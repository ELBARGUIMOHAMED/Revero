import type Stripe from 'stripe';

import { requireEnv } from '../../../../lib/env';
import { jsonUtf8 } from '../../../../lib/http';
import { getStripeServerClient } from '../../../../lib/stripe';
import { createAdminClient } from '../../../../lib/supabase/admin';

export const runtime = 'nodejs';

type PlanType = 'free' | 'pro';

function toIsoDate(unixSeconds: number | null | undefined): string | null {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

function resolvePlan(subscription: Stripe.Subscription): PlanType {
  if (['canceled', 'incomplete_expired', 'unpaid'].includes(subscription.status)) {
    return 'free';
  }
  return subscription.items.data.length > 0 ? 'pro' : 'free';
}

function getCurrentPeriodEndFromItems(subscription: Stripe.Subscription): number | null {
  if (subscription.items.data.length === 0) return null;
  return Math.max(...subscription.items.data.map((item) => item.current_period_end));
}

async function upsertSubscriptionByUserId(params: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: PlanType;
  status: string;
  currentPeriodEnd: string | null;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: params.userId,
      stripe_customer_id: params.stripeCustomerId,
      stripe_subscription_id: params.stripeSubscriptionId,
      plan: params.plan,
      status: params.status,
      current_period_end: params.currentPeriodEnd,
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();
  const stripeCustomerId = String(subscription.customer);

  const { data: existingByCustomer, error: existingByCustomerError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();

  if (existingByCustomerError) {
    throw new Error(existingByCustomerError.message);
  }

  let userId = existingByCustomer?.user_id || subscription.metadata.user_id || null;

  if (!userId) {
    const stripe = getStripeServerClient();
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    if (!customer.deleted) {
      userId = customer.metadata.user_id || null;
    }
  }

  if (!userId) {
    throw new Error(`No Supabase user_id found for Stripe customer ${stripeCustomerId}`);
  }

  await upsertSubscriptionByUserId({
    userId,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    plan: resolvePlan(subscription),
    status: subscription.status,
    currentPeriodEnd: toIsoDate(getCurrentPeriodEndFromItems(subscription)),
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription') return;

  const userId = session.metadata?.user_id || session.client_reference_id;
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;
  const stripeSubscriptionId =
    typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;

  if (!userId || !stripeCustomerId) {
    throw new Error('Missing checkout session metadata for subscription synchronization.');
  }

  if (!stripeSubscriptionId) {
    await upsertSubscriptionByUserId({
      userId,
      stripeCustomerId,
      stripeSubscriptionId: null,
      plan: 'pro',
      status: 'incomplete',
      currentPeriodEnd: null,
    });
    return;
  }

  const stripe = getStripeServerClient();
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  await upsertSubscriptionByUserId({
    userId,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    plan: resolvePlan(subscription),
    status: subscription.status,
    currentPeriodEnd: toIsoDate(getCurrentPeriodEndFromItems(subscription)),
  });
}

export async function POST(request: Request) {
  const stripe = getStripeServerClient();
  const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return jsonUtf8({ error: 'Missing Stripe signature header.' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid Stripe webhook signature.';
    return jsonUtf8({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }

    return jsonUtf8({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handler failed.';
    return jsonUtf8({ error: message }, { status: 500 });
  }
}
