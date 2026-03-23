import {getTranslations} from 'next-intl/server';

import {Link} from '../../i18n/navigation';

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" aria-hidden>
      <path fill="currentColor" d="m7.8 14.2-4-4 1.4-1.4 2.6 2.6 7-7 1.4 1.4-8.4 8.4Z" />
    </svg>
  );
}

export default async function LandingPage() {
  const t = await getTranslations('Landing');

  const features = [
    {title: t('features.0.title'), description: t('features.0.description')},
    {title: t('features.1.title'), description: t('features.1.description')},
    {title: t('features.2.title'), description: t('features.2.description')},
    {title: t('features.3.title'), description: t('features.3.description')},
    {title: t('features.4.title'), description: t('features.4.description')},
    {title: t('features.5.title'), description: t('features.5.description')},
  ];

  const testimonials = [
    {name: t('testimonials.0.name'), role: t('testimonials.0.role'), quote: t('testimonials.0.quote')},
    {name: t('testimonials.1.name'), role: t('testimonials.1.role'), quote: t('testimonials.1.quote')},
    {name: t('testimonials.2.name'), role: t('testimonials.2.role'), quote: t('testimonials.2.quote')},
  ];

  const faq = [
    {q: t('faq.0.q'), a: t('faq.0.a')},
    {q: t('faq.1.q'), a: t('faq.1.a')},
    {q: t('faq.2.q'), a: t('faq.2.a')},
    {q: t('faq.3.q'), a: t('faq.3.a')},
  ];

  const freePlanFeatures = [t('pricing.free.features.0'), t('pricing.free.features.1'), t('pricing.free.features.2')];
  const proPlanFeatures = [
    t('pricing.pro.features.0'),
    t('pricing.pro.features.1'),
    t('pricing.pro.features.2'),
    t('pricing.pro.features.3'),
    t('pricing.pro.features.4'),
  ];

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1C2D] via-[#112a44] to-[#0B1C2D] py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-12%] top-[-12%] h-[340px] w-[340px] rounded-full bg-blue-500/25 blur-3xl" />
          <div className="absolute right-[-8%] top-[18%] h-[300px] w-[300px] rounded-full bg-cyan-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">Revora</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">{t('hero.title')}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-200">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:scale-[1.02]"
            >
              {t('hero.primaryCta')}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/25 px-6 py-3 font-semibold text-slate-100 transition-all duration-200 hover:scale-[1.02] hover:border-cyan-300/80 hover:text-cyan-200"
            >
              {t('hero.secondaryCta')}
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-300">{t('hero.trustLine')}</p>
          <p className="mt-2 text-sm font-medium text-cyan-200">{t('hero.scarcity')}</p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t('featuresHeading')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">{t('featuresSubheading')}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{t('socialProofTitle')}</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm leading-6 text-slate-700">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t('pricing.heading')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">{t('pricing.subheading')}</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-slate-900">{t('pricing.free.title')}</h3>
              <p className="mt-2 text-4xl font-bold text-slate-900">{t('pricing.free.price')}</p>
              <p className="mt-1 text-sm text-slate-500">{t('pricing.perMonth')}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {freePlanFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <CheckIcon />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-800 transition-all duration-200 hover:scale-[1.02] hover:border-blue-500 hover:text-blue-600"
              >
                {t('pricing.free.cta')}
              </Link>
            </article>

            <article className="relative scale-[1.02] rounded-2xl border border-cyan-300 bg-white p-8 shadow-lg shadow-cyan-100">
              <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {t('pricing.pro.badge')}
              </span>
              <h3 className="text-2xl font-semibold text-slate-900">{t('pricing.pro.title')}</h3>
              <p className="mt-2 text-4xl font-bold text-slate-900">{t('pricing.pro.price')}</p>
              <p className="mt-1 text-sm text-slate-500">{t('pricing.perMonth')}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {proPlanFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                      <CheckIcon />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/billing"
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:scale-[1.02]"
              >
                {t('pricing.pro.cta')}
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t('faqHeading')}</h2>
          <div className="mt-10 space-y-4">
            {faq.map((item) => (
              <article key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{item.q}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center shadow-sm sm:px-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{t('finalCta.heading')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">{t('finalCta.subheading')}</p>
          <Link
            href="/register"
            className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:scale-[1.02]"
          >
            {t('finalCta.button')}
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 md:flex-row">
          <p>{t('footer.copy', {year: new Date().getFullYear()})}</p>
          <div className="flex items-center gap-5">
            <Link href="/register" className="transition-colors duration-200 hover:text-blue-600">
              {t('footer.getStarted')}
            </Link>
            <Link href="/login" className="transition-colors duration-200 hover:text-blue-600">
              {t('footer.signIn')}
            </Link>
            <Link href="/dashboard" className="transition-colors duration-200 hover:text-blue-600">
              {t('footer.dashboard')}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
