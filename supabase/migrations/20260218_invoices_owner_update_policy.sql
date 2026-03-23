alter table public.invoices enable row level security;

drop policy if exists "users can update own invoices" on public.invoices;
create policy "users can update own invoices"
  on public.invoices
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
