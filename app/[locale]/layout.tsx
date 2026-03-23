import type {Metadata} from 'next';
import {Manrope} from 'next/font/google';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';

import LocaleSwitcher from '../../components/ui/LocaleSwitcher';
import {Link} from '../../i18n/navigation';
import {routing} from '../../i18n/routing';
import {createClient} from '../../lib/supabase/server';
import '../globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Revora',
  description: 'Smart invoicing for modern businesses.',
};

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('Common');

  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className={manrope.variable}>
        <NextIntlClientProvider messages={messages}>
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1C2D]/85 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                Revora
              </Link>
              <nav className="flex items-center gap-2 text-sm">
                <LocaleSwitcher />
                {user ? (
                  <Link
                    href="/dashboard"
                    className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-2 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {t('dashboard')}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-xl border border-white/20 px-3 py-2 font-semibold text-slate-100 transition-all duration-200 hover:border-cyan-300/70 hover:text-cyan-200"
                    >
                      {t('signIn')}
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-2 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {t('startFree')}
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
