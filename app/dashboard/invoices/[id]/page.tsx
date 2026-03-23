import Link from 'next/link';
import { notFound } from 'next/navigation';

import DeleteInvoiceButton from '../../../../components/invoices/DeleteInvoiceButton';
import DownloadPdfButton from '../../../../components/invoices/DownloadPdfButton';
import InvoiceStatusActions from '../../../../components/invoices/InvoiceStatusActions';
import InvoiceStatusBadge from '../../../../components/invoices/InvoiceStatusBadge';
import { requireUser } from '../../../../lib/auth';
import { formatCurrency } from '../../../../lib/invoices';
import { createOptionalAdminClient } from '../../../../lib/supabase/admin';
import type { InvoiceItemRow, InvoiceRow, InvoiceWithItems, ProfileRow } from '../../../../lib/types';

type Params = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({ params }: Params) {
  const { id } = await params;
  const { user, supabase } = await requireUser();
  const adminSupabase = createOptionalAdminClient() || supabase;

  const [{ data: invoiceData }, { data: itemData }, { data: profileData }] = await Promise.all([
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
    <section className="space-y-5 rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{invoice.invoice_number}</h1>
          <p className="text-sm text-slate-300">{invoice.client_name}</p>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/invoices/${invoice.id}/edit`}
            className="rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-cyan-300/70 hover:text-cyan-200"
          >
            Edit
          </Link>
          <DownloadPdfButton invoice={fullInvoice} profile={profile} />
          <DeleteInvoiceButton invoiceId={invoice.id} />
        </div>
      </div>

      <InvoiceStatusActions invoiceId={invoice.id} currentStatus={invoice.status} />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#0f2236] p-4 text-sm">
          <p className="text-slate-400">Issue date</p>
          <p className="mt-1 font-semibold text-white">{invoice.issue_date}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0f2236] p-4 text-sm">
          <p className="text-slate-400">Due date</p>
          <p className="mt-1 font-semibold text-white">{invoice.due_date}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0f2236] p-4 text-sm">
          <p className="text-slate-400">Status</p>
          <p className="mt-1 font-semibold capitalize text-white">{invoice.status}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#0f2236] text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-3 py-3">Description</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Unit</th>
              <th className="px-3 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-white/5 last:border-b-0">
                <td className="px-3 py-3 text-slate-200">{item.description}</td>
                <td className="px-3 py-3 text-slate-300">{item.quantity}</td>
                <td className="px-3 py-3 text-slate-300">{formatCurrency(invoice.currency, item.unit_price)}</td>
                <td className="px-3 py-3 font-semibold text-white">{formatCurrency(invoice.currency, item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0f2236] p-4 text-sm">
        <p className="text-slate-300">Subtotal: {formatCurrency(invoice.currency, invoice.subtotal)}</p>
        <p className="text-slate-300">Tax ({invoice.tax_rate}%): {formatCurrency(invoice.currency, invoice.tax_amount)}</p>
        <p className="mt-1 text-base font-semibold text-white">Total: {formatCurrency(invoice.currency, invoice.total)}</p>
      </div>

      {invoice.notes ? (
        <div className="rounded-xl border border-white/10 bg-[#0f2236] p-4">
          <h2 className="text-sm font-semibold text-white">Notes</h2>
          <p className="mt-1 text-sm text-slate-300">{invoice.notes}</p>
        </div>
      ) : null}
    </section>
  );
}
