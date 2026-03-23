'use client';

import {useTranslations} from 'next-intl';
import {useState} from 'react';

import {useRouter} from '../../i18n/navigation';

type Props = {
  invoiceId: string;
};

export default function DeleteInvoiceButton({invoiceId}: Props) {
  const t = useTranslations('Invoices');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function removeInvoice() {
    const confirmed = window.confirm(t('deleteConfirm'));
    if (!confirmed) return;

    setLoading(true);
    const response = await fetch(`/api/invoices/${invoiceId}`, {method: 'DELETE'});
    if (response.ok) {
      router.push('/dashboard/invoices?toast=invoice_deleted');
      router.refresh();
      return;
    }

    setLoading(false);
    window.alert(t('deleteFailed'));
  }

  return (
    <button
      type="button"
      onClick={removeInvoice}
      disabled={loading}
      className="rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition-all duration-200 hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? t('deleting') : t('delete')}
    </button>
  );
}
