create extension if not exists pgcrypto;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'free',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id),
  unique (stripe_customer_id),
  unique (stripe_subscription_id)
);

alter table public.subscriptions enable row level security;

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_customer_id on public.subscriptions(stripe_customer_id);
create index if not exists idx_subscriptions_subscription_id on public.subscriptions(stripe_subscription_id);

create policy "users can read own subscriptions"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

create policy "users can insert own subscriptions"
  on public.subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy "users can update own subscriptions"
  on public.subscriptions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
