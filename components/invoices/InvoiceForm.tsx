'use client';

import {useLocale, useTranslations} from 'next-intl';
import { useMemo, useState } from 'react';

import {useRouter} from '../../i18n/navigation';
import { formatCurrency } from '../../lib/invoices';
import type { CurrencyCode, InvoiceInput, InvoiceWithItems, InvoiceStatus } from '../../lib/types';

type Props = {
  mode: 'create' | 'edit';
  invoice?: InvoiceWithItems;
};

type ItemDraft = {
  description: string;
  quantity: number;
  unitPrice: number;
};

const currencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'MAD'];
const statuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue'];

function toInitialState(invoice?: InvoiceWithItems): InvoiceInput {
  if (!invoice) {
    const today = new Date().toISOString().slice(0, 10);
    return {
      clientName: '',
      clientEmail: '',
      issueDate: today,
      dueDate: today,
      notes: '',
      taxRate: 20,
      currency: 'USD',
      status: 'draft',
      items: [{ description: 'Service', quantity: 1, unitPrice: 0 }],
    };
  }

  return {
    clientName: invoice.client_name,
    clientEmail: invoice.client_email,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    notes: invoice.notes,
    taxRate: invoice.tax_rate,
    currency: invoice.currency,
    status: invoice.status,
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
  };
}

const inputClass =
  'mt-1 w-full rounded-xl border border-white/15 bg-[#0f2236] px-3 py-2.5 text-sm text-slate-100 shadow-sm transition-all duration-200 placeholder:text-slate-500 focus:border-cyan-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/20';

export default function InvoiceForm({ mode, invoice }: Props) {
  const t = useTranslations('InvoiceForm');
  const locale = useLocale();
  const router = useRouter();
  const [form, setForm] = useState<InvoiceInput>(() => toInitialState(invoice));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const subtotal = useMemo(
    () => form.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [form.items],
  );
  const taxAmount = subtotal * (form.taxRate / 100);
  const total = subtotal + taxAmount;

  function updateItem(index: number, patch: Partial<ItemDraft>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        return { ...item, ...patch };
      }),
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const endpoint = mode === 'create' ? '/api/invoices' : `/api/invoices/${invoice?.id}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as { invoice?: { id: string }; error?: string };

    if (!response.ok) {
      setError(t('saveError'));
      setSaving(false);
      return;
    }

    const nextId = payload.invoice?.id || invoice?.id;
    const toast = mode === 'create' ? 'invoice_created' : 'invoice_updated';
    router.push(nextId ? `/dashboard/invoices/${nextId}?toast=${toast}` : `/dashboard/invoices?toast=${toast}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-200">
          {t('clientName')}
          <input
            value={form.clientName}
            onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
            className={inputClass}
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          {t('clientEmail')}
          <input
            type="email"
            value={form.clientEmail}
            onChange={(event) => setForm((current) => ({ ...current, clientEmail: event.target.value }))}
            className={inputClass}
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          {t('issueDate')}
          <input
            type="date"
            value={form.issueDate}
            onChange={(event) => setForm((current) => ({ ...current, issueDate: event.target.value }))}
            className={inputClass}
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          {t('dueDate')}
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            className={inputClass}
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-200">
          {t('currency')}
          <select
            value={form.currency}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currency: event.target.value as CurrencyCode,
              }))
            }
            className={inputClass}
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-200">
          {t('status')}
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as InvoiceStatus,
              }))
            }
            className={inputClass}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {t(`statuses.${status}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-200">
          {t('taxRate')}
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={form.taxRate}
            onChange={(event) => setForm((current) => ({ ...current, taxRate: Number(event.target.value) || 0 }))}
            className={inputClass}
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">{t('items')}</h2>
          <button
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                items: [...current.items, { description: '', quantity: 1, unitPrice: 0 }],
              }))
            }
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-cyan-300/70 hover:text-cyan-200"
          >
            {t('addItem')}
          </button>
        </div>

        {form.items.map((item, index) => (
          <div key={`item-${index}`} className="grid gap-2 md:grid-cols-[1fr_110px_140px_90px]">
            <input
              value={item.description}
              onChange={(event) => updateItem(index, { description: event.target.value })}
              placeholder="Description"
              className={inputClass}
              required
            />
            <input
              type="number"
              min={0.01}
              step="0.01"
              value={item.quantity}
              onChange={(event) => updateItem(index, { quantity: Number(event.target.value) || 0 })}
              className={inputClass}
              required
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.unitPrice}
              onChange={(event) => updateItem(index, { unitPrice: Number(event.target.value) || 0 })}
              className={inputClass}
              required
            />
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  items: current.items.length === 1 ? current.items : current.items.filter((_, i) => i !== index),
                }))
              }
              className="rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition-all duration-200 hover:border-cyan-300/70 hover:text-cyan-200"
            >
              {t('remove')}
            </button>
          </div>
        ))}
      </div>

      <label className="block text-sm font-semibold text-slate-200">
        {t('notes')}
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          rows={4}
          className={inputClass}
          placeholder={t('notesPlaceholder')}
        />
      </label>

      <div className="rounded-xl border border-white/10 bg-[#0f2236] p-4 text-sm text-slate-300">
        <p>{t('subtotal')}: {formatCurrency(form.currency, subtotal, locale)}</p>
        <p>{t('tax')}: {formatCurrency(form.currency, taxAmount, locale)}</p>
        <p className="mt-1 text-base font-semibold text-white">{t('total')}: {formatCurrency(form.currency, total, locale)}</p>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {saving ? t('saving') : mode === 'create' ? t('createInvoice') : t('saveChanges')}
      </button>
    </form>
  );
}

