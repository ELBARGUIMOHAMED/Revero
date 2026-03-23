import { z } from 'zod';
import type { CurrencyCode, InvoiceInput, InvoiceItemInput } from './types';

export const supportedCurrencies = ['USD', 'EUR', 'GBP', 'MAD'] as const satisfies readonly CurrencyCode[];

export const invoiceItemSchema = z.object({
  description: z.string().min(1).max(300),
  quantity: z.number().positive().max(100000),
  unitPrice: z.number().nonnegative().max(100000000),
});

export const invoiceSchema = z.object({
  clientName: z.string().min(1).max(150),
  clientEmail: z.string().email().max(200),
  issueDate: z.string().min(8).max(20),
  dueDate: z.string().min(8).max(20),
  notes: z.string().max(3000).optional().default(''),
  taxRate: z.number().min(0).max(100),
  currency: z.enum(supportedCurrencies),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  items: z.array(invoiceItemSchema).min(1).max(100),
});

export function calculateInvoiceTotals(items: InvoiceItemInput[], taxRate: number): {
  subtotal: number;
  taxAmount: number;
  total: number;
  normalizedItems: Array<InvoiceItemInput & { lineTotal: number }>;
} {
  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const lineTotal = Number((quantity * unitPrice).toFixed(2));

    return {
      description: item.description.trim(),
      quantity,
      unitPrice,
      lineTotal,
    };
  });

  const subtotal = Number(normalizedItems.reduce((acc, item) => acc + item.lineTotal, 0).toFixed(2));
  const taxAmount = Number((subtotal * (taxRate / 100)).toFixed(2));
  const total = Number((subtotal + taxAmount).toFixed(2));

  return { subtotal, taxAmount, total, normalizedItems };
}

export function parseInvoicePayload(payload: unknown): InvoiceInput {
  return invoiceSchema.parse(payload);
}

export function formatCurrency(currency: CurrencyCode, value: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
