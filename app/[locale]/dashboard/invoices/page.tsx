import {getLocale, getTranslations} from 'next-intl/server';

import InvoiceStatusBadge from '../../../../components/invoices/InvoiceStatusBadge';
import {Link} from '../../../../i18n/navigation';
import {requireUser} from '../../../../lib/auth';
import {formatCurrency} from '../../../../lib/invoices';
import type {InvoiceRow} from '../../../../lib/types';

async function EmptyState() {
  const t = await getTranslations('Invoices');

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <svg viewBox="0 0 120 120" aria-hidden className="h-20 w-20 text-slate-400">
        <rect x="18" y="14" width="84" height="92" rx="10" fill="currentColor" opacity="0.28" />
        <rect x="30" y="30" width="60" height="6" rx="3" fill="currentColor" />
        <rect x="30" y="44" width="45" height="6" rx="3" fill="currentColor" />
        <rect x="30" y="66" width="28" height="24" rx="4" fill="currentColor" opacity="0.75" />
      </svg>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{t('emptyTitle')}</h2>
      <p className="mt-1 text-sm text-slate-600">{t('emptyDescription')}</p>
      <Link
        href="/dashboard/invoices/new"
        className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5"
      >
        {t('createFirst')}
      </Link>
    </div>
  );
}

export default async function InvoicesPage() {
  const t = await getTranslations('Invoices');
  const {user, supabase} = await requireUser();
  const currentLocale = await getLocale();

  const {data} = await supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', {ascending: false});

  const invoices = (data || []) as InvoiceRow[];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('title')}</h1>
          <p className="text-sm text-slate-700">{t('subtitle')}</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5"
        >
          {t('newInvoice')}
        </Link>
      </div>

      {invoices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-3 py-3">{t('table.number')}</th>
                <th className="px-3 py-3">{t('table.client')}</th>
                <th className="px-3 py-3">{t('table.status')}</th>
                <th className="px-3 py-3">{t('table.total')}</th>
                <th className="px-3 py-3">{t('table.date')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="font-semibold text-slate-900 transition-colors hover:text-blue-700"
                    >
                      {invoice.invoice_number}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{invoice.client_name}</td>
                  <td className="px-3 py-3">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-900">{formatCurrency(invoice.currency, invoice.total, currentLocale)}</td>
                  <td className="px-3 py-3 text-slate-600">{invoice.issue_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
