import {getLocale, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';

import DeleteInvoiceButton from '../../../../../components/invoices/DeleteInvoiceButton';
import DownloadPdfButton from '../../../../../components/invoices/DownloadPdfButton';
import InvoiceStatusActions from '../../../../../components/invoices/InvoiceStatusActions';
import InvoiceStatusBadge from '../../../../../components/invoices/InvoiceStatusBadge';
import {Link} from '../../../../../i18n/navigation';
import {requireUser} from '../../../../../lib/auth';
import {formatCurrency} from '../../../../../lib/invoices';
import {createOptionalAdminClient} from '../../../../../lib/supabase/admin';
import type {InvoiceItemRow, InvoiceRow, InvoiceWithItems, ProfileRow} from '../../../../../lib/types';

type Params = {
  params: Promise<{id: string}>;
};

export default async function InvoiceDetailPage({params}: Params) {
  const t = await getTranslations('Invoices');
  const locale = await getLocale();
  const {id} = await params;
  const {user, supabase} = await requireUser();
  const adminSupabase = createOptionalAdminClient() || supabase;

  const [{data: invoiceData}, {data: itemData}, {data: profileData}] = await Promise.all([
    supabase.from('invoices').select('*').eq('id', id).eq('user_id', user.id).single(),
    adminSupabase.from('invoice_items').select('*').eq('invoice_id', id),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ]);

  if (!invoiceData) {
    notFound();
  }

  const invoice = invoiceData as InvoiceRow;
  const items = (itemData || []) as InvoiceItemRow[];
  const profile = (profileData || null) as ProfileRow | null;

  const fullInvoice: InvoiceWithItems = {
    ...invoice,
    items,
  };

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{invoice.invoice_number}</h1>
          <p className="text-sm text-slate-700">{invoice.client_name}</p>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/invoices/${invoice.id}/edit`}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-blue-500 hover:text-blue-700"
          >
            {t('edit')}
          </Link>
          <DownloadPdfButton invoice={fullInvoice} profile={profile} />
          <DeleteInvoiceButton invoiceId={invoice.id} />
        </div>
      </div>

      <InvoiceStatusActions invoiceId={invoice.id} currentStatus={invoice.status} />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="text-slate-600">{t('issueDate')}</p>
          <p className="mt-1 font-semibold text-slate-900">{invoice.issue_date}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="text-slate-600">{t('dueDate')}</p>
          <p className="mt-1 font-semibold text-slate-900">{invoice.due_date}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="text-slate-600">{t('status')}</p>
          <p className="mt-1 font-semibold capitalize text-slate-900">{invoice.status}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="px-3 py-3">{t('table.description')}</th>
              <th className="px-3 py-3">{t('table.qty')}</th>
              <th className="px-3 py-3">{t('table.unit')}</th>
              <th className="px-3 py-3">{t('table.total')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3 text-slate-800">{item.description}</td>
                <td className="px-3 py-3 text-slate-700">{item.quantity}</td>
                <td className="px-3 py-3 text-slate-700">{formatCurrency(invoice.currency, item.unit_price, locale)}</td>
                <td className="px-3 py-3 font-semibold text-slate-900">{formatCurrency(invoice.currency, item.line_total, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <p className="text-slate-700">{t('subtotal')}: {formatCurrency(invoice.currency, invoice.subtotal, locale)}</p>
        <p className="text-slate-700">{t('tax', {rate: invoice.tax_rate})}: {formatCurrency(invoice.currency, invoice.tax_amount, locale)}</p>
        <p className="mt-1 text-base font-semibold text-slate-900">{t('total')}: {formatCurrency(invoice.currency, invoice.total, locale)}</p>
      </div>

      {invoice.notes ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">{t('notes')}</h2>
          <p className="mt-1 text-sm text-slate-700">{invoice.notes}</p>
        </div>
      ) : null}
    </section>
  );
}
