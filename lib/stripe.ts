import 'server-only';

import Stripe from 'stripe';

import { requireEnv } from './env';

export function getStripeServerClient(): Stripe {
  const secretKey = requireEnv('STRIPE_SECRET_KEY');
  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
    typescript: true,
  });
}
