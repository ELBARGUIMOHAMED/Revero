'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useState} from 'react';

import {generateInvoicePdf} from '../../lib/pdf';
import type {InvoiceWithItems, ProfileRow} from '../../lib/types';

type Props = {
  invoice: InvoiceWithItems;
  profile: ProfileRow | null;
};

export default function DownloadPdfButton({invoice, profile}: Props) {
  const t = useTranslations('Pdf');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);

    const response = await fetch(`/api/invoices/${invoice.id}`);
    if (!response.ok) {
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as { invoice?: InvoiceWithItems };
    const invoiceWithItems = payload.invoice || invoice;

    await generateInvoicePdf(invoiceWithItems, profile, locale, {
      invoiceTitle: t('title'),
      invoiceNumber: t('invoiceNumber'),
      issueDate: t('issueDate'),
      dueDate: t('dueDate'),
      billTo: t('billTo'),
      notes: t('notes'),
      subtotal: t('subtotal'),
      tax: t('tax'),
      total: t('total'),
      tableDescription: t('tableDescription'),
      tableQty: t('tableQty'),
      tableUnitPrice: t('tableUnitPrice'),
      tableTotal: t('tableTotal'),
    });

    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={() => void handleDownload()}
      disabled={loading}
      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-blue-500 hover:text-blue-700"
    >
      {loading ? t('loading') : t('download')}
    </button>
  );
}
