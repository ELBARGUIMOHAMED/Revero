import {getTranslations} from 'next-intl/server';

import LoginForm from '../../../components/auth/LoginForm';
import {Link} from '../../../i18n/navigation';

export default async function LoginPage() {
  const t = await getTranslations('Auth');

  return (
    <main className="mx-auto grid min-h-[calc(100vh-70px)] max-w-md place-items-center px-4 py-14">
      <div className="w-full space-y-4">
        <h1 className="text-2xl font-bold text-white">{t('signIn')}</h1>
        <LoginForm />
        <p className="text-sm text-slate-300">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-medium text-cyan-200 underline">
            {t('createOne')}
          </Link>
        </p>
      </div>
    </main>
  );
}
