import {getTranslations} from 'next-intl/server';

import RegisterForm from '../../../components/auth/RegisterForm';
import {Link} from '../../../i18n/navigation';

export default async function RegisterPage() {
  const t = await getTranslations('Auth');

  return (
    <main className="mx-auto grid min-h-[calc(100vh-70px)] max-w-md place-items-center px-4 py-14">
      <div className="w-full space-y-4">
        <h1 className="text-2xl font-bold text-white">{t('createAccount')}</h1>
        <RegisterForm />
        <p className="text-sm text-slate-300">
          {t('hasAccount')}{' '}
          <Link href="/login" className="font-medium text-cyan-200 underline">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </main>
  );
}
