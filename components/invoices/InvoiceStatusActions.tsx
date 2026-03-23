'use client';

import {useTranslations} from 'next-intl';
import {useState} from 'react';

import {useRouter} from '../../i18n/navigation';
import type {InvoiceStatus} from '../../lib/types';

type Props = {
  invoiceId: string;
  currentStatus: InvoiceStatus;
};

const NEXT_STATES: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['sent', 'paid'],
  sent: ['paid', 'overdue', 'draft'],
  paid: ['sent'],
  overdue: ['paid', 'sent'],
};

export default function InvoiceStatusActions({invoiceId, currentStatus}: Props) {
  const t = useTranslations('Invoices');
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState<InvoiceStatus | null>(null);
  const [error, setError] = useState('');

  async function updateStatus(status: InvoiceStatus) {
    setLoadingStatus(status);
    setError('');

    const response = await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status}),
    });

    if (!response.ok) {
      await response.json().catch(() => ({}));
      setError(t('statusUpdateFailed'));
      setLoadingStatus(null);
      return;
    }

    router.refresh();
    setLoadingStatus(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {NEXT_STATES[currentStatus].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => updateStatus(status)}
            disabled={loadingStatus !== null}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold capitalize text-slate-800 transition-all duration-200 hover:border-blue-500 hover:text-blue-700 disabled:opacity-50"
          >
            {loadingStatus === status ? t('updating') : t('markAs', {status: t(`statuses.${status}`)})}
          </button>
        ))}
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

