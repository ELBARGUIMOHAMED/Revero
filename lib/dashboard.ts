import type { DashboardSummary, InvoiceRow } from './types';

function formatMonth(value: Date, locale: string): string {
  return value.toLocaleString(locale, { month: 'short' });
}

function isPaidStatus(status: string): boolean {
  return status.toLowerCase() === 'paid';
}

export function buildMonthlySeries(invoices: InvoiceRow[], locale: string): Array<{ month: string; total: number }> {
  const paidInvoices = invoices.filter((invoice) => isPaidStatus(invoice.status));
  const now = new Date();
  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: formatMonth(date, locale),
    };
  });

  const totals = new Map<string, number>();

  paidInvoices.forEach((invoice) => {
    const date = new Date(invoice.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    totals.set(key, (totals.get(key) || 0) + Number(invoice.total));
  });

  return monthKeys.map(({ key, label }) => ({
    month: label,
    total: Number((totals.get(key) || 0).toFixed(2)),
  }));
}

export function buildDashboardSummary(invoices: InvoiceRow[], locale = 'en-US'): DashboardSummary {
  const paidInvoices = invoices.filter((invoice) => isPaidStatus(invoice.status));
  const sorted = [...invoices].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    totalRevenue: Number(paidInvoices.reduce((sum, invoice) => sum + Number(invoice.total), 0).toFixed(2)),
    invoiceCount: invoices.length,
    monthlyRevenue: buildMonthlySeries(invoices, locale),
    recentInvoices: sorted.slice(0, 5),
  };
}
