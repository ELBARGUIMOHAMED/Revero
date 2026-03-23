import {getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';

import InvoiceForm from '../../../../../../components/invoices/InvoiceForm';
import {requireUser} from '../../../../../../lib/auth';
import {createOptionalAdminClient} from '../../../../../../lib/supabase/admin';
import type {InvoiceItemRow, InvoiceRow, InvoiceWithItems} from '../../../../../../lib/types';

type Params = {
  params: Promise<{id: string}>;
};

export default async function EditInvoicePage({params}: Params) {
  const t = await getTranslations('Invoices');
  const {id} = await params;
  const {user, supabase} = await requireUser();
  const adminSupabase = createOptionalAdminClient() || supabase;

  const [{data: invoiceData}, {data: itemData}] = await Promise.all([
    supabase.from('invoices').select('*').eq('id', id).eq('user_id', user.id).single(),
    adminSupabase.from('invoice_items').select('*').eq('invoice_id', id),
  ]);

  if (!invoiceData) {
    notFound();
  }

  const invoice = invoiceData as InvoiceRow;
  const items = (itemData || []) as InvoiceItemRow[];

  const fullInvoice: InvoiceWithItems = {
    ...invoice,
    items,
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{t('editTitle', {number: invoice.invoice_number})}</h1>
        <p className="text-sm text-slate-300">{t('editSubtitle')}</p>
      </div>
      <InvoiceForm mode="edit" invoice={fullInvoice} />
    </div>
  );
}
