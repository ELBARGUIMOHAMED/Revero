import {getTranslations} from 'next-intl/server';

import InvoiceForm from '../../../../../components/invoices/InvoiceForm';

export default async function NewInvoicePage() {
  const t = await getTranslations('Invoices');

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{t('createTitle')}</h1>
        <p className="text-sm text-slate-300">{t('createSubtitle')}</p>
      </div>
      <InvoiceForm mode="create" />
    </div>
  );
}
