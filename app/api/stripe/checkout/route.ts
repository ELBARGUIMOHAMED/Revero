import { createClient } from '../../../../lib/supabase/server';
import { getBaseUrl, requireEnv } from '../../../../lib/env';
import { jsonUtf8 } from '../../../../lib/http';
import { getStripeServerClient } from '../../../../lib/stripe';
import type { SubscriptionRow } from '../../../../lib/types';

function getRedirectUrl(returnUrl: unknown): string {
  if (typeof returnUrl !== 'string' || returnUrl.length === 0) {
    return `${getBaseUrl()}/dashboard/billing`;
  }

  const baseUrl = getBaseUrl();
  const incoming = new URL(returnUrl, baseUrl);
  const base = new URL(baseUrl);

  if (incoming.origin !== base.origin) {
    return `${baseUrl}/dashboard/billing`;
  }

  return incoming.toString();
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonUtf8({ error: authError?.message || 'Unauthorized' }, { status: 401 });
    }

    const requestBody = (await request.json().catch(() => ({}))) as { returnUrl?: string };

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) {
      return jsonUtf8({ error: subscriptionError.message }, { status: 400 });
    }

    const subscription = (subscriptionData || null) as SubscriptionRow | null;
    if (subscription?.plan === 'pro' && ['active', 'trialing', 'past_due'].includes(subscription.status)) {
      return jsonUtf8({ error: 'An active Pro subscription already exists.' }, { status: 400 });
    }

    const stripe = getStripeServerClient();
    const priceId = requireEnv('STRIPE_PRO_PRICE_ID');

    let stripeCustomerId = subscription?.stripe_customer_id || null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      stripeCustomerId = customer.id;

      const { error: upsertCustomerError } = await supabase.from('subscriptions').upsert(
        {
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
          plan: subscription?.plan || 'free',
          status: subscription?.status || 'free',
          stripe_subscription_id: subscription?.stripe_subscription_id || null,
          current_period_end: subscription?.current_period_end || null,
        },
        { onConflict: 'user_id' },
      );

      if (upsertCustomerError) {
        return jsonUtf8({ error: upsertCustomerError.message }, { status: 400 });
      }
    }

    const redirectUrl = getRedirectUrl(requestBody.returnUrl);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}checkout=success`,
      cancel_url: `${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}checkout=cancel`,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      subscription_data: {
        metadata: { user_id: user.id },
      },
    });

    if (!session.url) {
      return jsonUtf8({ error: 'Unable to create checkout session.' }, { status: 400 });
    }

    return jsonUtf8({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonUtf8({ error: message }, { status: 500 });
  }
}
