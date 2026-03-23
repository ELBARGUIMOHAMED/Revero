alter table public.profiles
  add column if not exists plan text,
  add column if not exists role text;

update public.profiles
set
  plan = coalesce(plan, 'free'),
  role = coalesce(role, 'user')
where plan is null or role is null;

alter table public.profiles
  alter column plan set default 'free',
  alter column role set default 'user',
  alter column plan set not null,
  alter column role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_plan_check check (plan in ('free', 'pro'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'admin'));
  end if;
end
$$;
