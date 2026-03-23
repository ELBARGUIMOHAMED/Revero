import {getTranslations} from 'next-intl/server';

import RevenueChart from '../../../components/dashboard/RevenueChart';
import InvoiceStatusBadge from '../../../components/invoices/InvoiceStatusBadge';
import {Link} from '../../../i18n/navigation';
import {requireUser} from '../../../lib/auth';
import {buildDashboardSummary} from '../../../lib/dashboard';
import {formatCurrency} from '../../../lib/invoices';
import type {InvoiceRow} from '../../../lib/types';

function trend(current: number, previous: number): {label: string; positive: boolean} {
  if (previous === 0 && current === 0) return {label: '0%', positive: true};
  if (previous === 0) return {label: '+100%', positive: true};

  const delta = ((current - previous) / previous) * 100;
  return {
    label: `${delta >= 0 ? '+' : '-'}${Math.abs(Math.round(delta))}%`,
    positive: delta >= 0,
  };
}

function isSameMonth(date: string, year: number, month: number) {
  const d = new Date(date);
  return d.getUTCFullYear() === year && d.getUTCMonth() === month;
}

function StatIcon({type}: {type: string}) {
  const className = 'h-5 w-5';
  if (type === 'paid') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M12 1.5A10.5 10.5 0 1 0 22.5 12 10.52 10.52 0 0 0 12 1.5Zm-1 14.5-4-4 1.4-1.4 2.6 2.6 5.6-5.6L18 9l-7 7Z" />
      </svg>
    );
  }
  if (type === 'overdue') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z" />
      </svg>
    );
  }
  if (type === 'sent') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path fill="currentColor" d="m3 12 18-9-4 18-5-7-9-2Zm9.6 1.1 2.7 3.8 2.1-9.4-9.7 4.8 4.9.8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16l3-1.5L10 20l3-1.5 3 1.5 3-1.5L22 20V8l-8-6Zm-4 9h8v2h-8v-2Zm0 4h6v2h-6v-2Z" />
    </svg>
  );
}

type Props = {
  params: Promise<{locale: string}>;
};

export default async function DashboardPage({params}: Props) {
  const t = await getTranslations('Dashboard');
  const {locale} = await params;
  const {user, supabase} = await requireUser();

  const {data} = await supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', {ascending: false});

  const invoices = (data || []) as InvoiceRow[];
  const summary = buildDashboardSummary(invoices, locale);

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();
  const previousMonthDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
  const previousYear = previousMonthDate.getUTCFullYear();
  const previousMonth = previousMonthDate.getUTCMonth();

  const currentInvoices = invoices.filter((invoice) => isSameMonth(invoice.created_at, currentYear, currentMonth));
  const previousInvoices = invoices.filter((invoice) => isSameMonth(invoice.created_at, previousYear, previousMonth));

  const counts = {
    paid: invoices.filter((invoice) => invoice.status === 'paid').length,
    overdue: invoices.filter((invoice) => invoice.status === 'overdue').length,
    sent: invoices.filter((invoice) => invoice.status === 'sent').length,
    draft: invoices.filter((invoice) => invoice.status === 'draft').length,
  };
  const previousCounts = {
    paid: previousInvoices.filter((invoice) => invoice.status === 'paid').length,
    overdue: previousInvoices.filter((invoice) => invoice.status === 'overdue').length,
    sent: previousInvoices.filter((invoice) => invoice.status === 'sent').length,
    draft: previousInvoices.filter((invoice) => invoice.status === 'draft').length,
  };

  const stats = [
    {title: t('cards.paid'), value: counts.paid.toString(), style: 'text-emerald-700 bg-emerald-50', icon: 'paid', trend: trend(counts.paid, previousCounts.paid)},
    {title: t('cards.overdue'), value: counts.overdue.toString(), style: 'text-red-700 bg-red-50', icon: 'overdue', trend: trend(counts.overdue, previousCounts.overdue)},
    {title: t('cards.sent'), value: counts.sent.toString(), style: 'text-blue-700 bg-blue-50', icon: 'sent', trend: trend(counts.sent, previousCounts.sent)},
    {title: t('cards.draft'), value: counts.draft.toString(), style: 'text-slate-700 bg-slate-100', icon: 'draft', trend: trend(counts.draft, previousCounts.draft)},
  ];

  const revenueTrend = trend(
    currentInvoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + Number(invoice.total), 0),
    previousInvoices.filter((invoice) => invoice.status === 'paid').reduce((sum, invoice) => sum + Number(invoice.total), 0),
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">{t('overviewTag')}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-600">{t('subtitle')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">{t('totalRevenue')}</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency('USD', summary.totalRevenue, locale)}</p>
          <p className={`text-xs font-semibold ${revenueTrend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
            {t('trend', {value: revenueTrend.label})}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">{card.title}</p>
              <span className={`rounded-lg p-2 ${card.style}`}>
                <StatIcon type={card.icon} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{card.value}</p>
            <p className={`mt-3 text-xs font-semibold ${card.trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {t('trend', {value: card.trend.label})}
            </p>
          </article>
        ))}
      </section>

      <RevenueChart points={summary.monthlyRevenue} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{t('recentInvoices')}</h2>
          <Link
            href="/dashboard/invoices/new"
            className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
          >
            {t('newInvoice')}
          </Link>
        </div>

        {summary.recentInvoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="text-sm font-medium text-slate-600">{t('empty.title')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('empty.description')}</p>
            <Link
              href="/dashboard/invoices/new"
              className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
            >
              {t('empty.cta')}
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {summary.recentInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/dashboard/invoices/${invoice.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">{invoice.invoice_number}</span>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.currency, invoice.total, locale)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
