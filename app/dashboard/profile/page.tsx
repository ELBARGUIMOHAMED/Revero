import ProfileClientForm from '../../../components/dashboard/ProfileClientForm';
import { requireUser } from '../../../lib/auth';
import type { ProfileRow } from '../../../lib/types';

export default async function ProfilePage() {
  const { user, supabase } = await requireUser();

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const profile = data as ProfileRow | null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Profile</h1>
        <p className="text-sm text-slate-300">Customize your company details used in generated invoices.</p>
      </div>
      <ProfileClientForm
        initialProfile={{
          companyName: profile?.company_name || '',
          logoUrl: profile?.logo_url || '',
          taxId: profile?.tax_id || '',
        }}
      />
    </div>
  );
}

