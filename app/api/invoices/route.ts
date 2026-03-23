import { FREE_INVOICE_LIMIT_PER_MONTH } from '../../../lib/billing';
import { jsonUtf8 } from '../../../lib/http';
import { getUserSubscription } from '../../../lib/subscription';
import { createOptionalAdminClient } from '../../../lib/supabase/admin';
import { createClient } from '../../../lib/supabase/server';
import type { InvoiceInput } from '../../../lib/types';

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function buildInvoiceNumber(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `INV-${yyyy}${mm}${dd}-${rand}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = createOptionalAdminClient() || supabase;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonUtf8(
        { error: authError?.message || 'Unauthorized' },
        { status: 401 },
      );
    }

    const userSubscription = await getUserSubscription(user.id);
    const isAdmin = userSubscription.role === 'admin';
    const isPro = userSubscription.plan === 'pro';

    if (!isAdmin && !isPro) {
      const now = new Date();
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

      const { count, error: countError } = await supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', monthStart);

      if (countError) {
        return jsonUtf8({ error: countError.message }, { status: 400 });
      }

      if ((count || 0) >= FREE_INVOICE_LIMIT_PER_MONTH) {
        return jsonUtf8({ error: 'Free plan limit reached (10 invoices/month)' }, { status: 403 });
      }
    }

    const body = (await request.json()) as Partial<InvoiceInput>;

    if (!body.clientName || !body.clientEmail || !body.issueDate || !body.dueDate) {
      return jsonUtf8(
        { error: 'Missing required invoice fields.' },
        { status: 400 },
      );
    }

    const items = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return jsonUtf8(
        { error: 'At least one invoice item is required.' },
        { status: 400 },
      );
    }

    const subtotal = Number(
      items
        .reduce((sum, item) => sum + toNumber(item.quantity) * toNumber(item.unitPrice), 0)
        .toFixed(2),
    );
    const taxRate = toNumber(body.taxRate);
    const taxAmount = Number((subtotal * (taxRate / 100)).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));

    const { data: invoice, error: insertInvoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        invoice_number: buildInvoiceNumber(),
        client_name: body.clientName,
        client_email: body.clientEmail,
        issue_date: body.issueDate,
        due_date: body.dueDate,
        notes: body.notes ?? '',
        status: body.status ?? 'draft',
        currency: body.currency ?? 'USD',
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
      })
      .select('*')
      .single();

    if (insertInvoiceError || !invoice) {
      return jsonUtf8(
        { error: insertInvoiceError?.message || 'Failed to create invoice.' },
        { status: 400 },
      );
    }

    const itemRows = items.map((item) => {
      const quantity = toNumber(item.quantity);
      const unitPrice = toNumber(item.unitPrice);
      return {
        invoice_id: invoice.id,
        description: item.description,
        quantity,
        unit_price: unitPrice,
        line_total: Number((quantity * unitPrice).toFixed(2)),
      };
    });

    const { error: insertItemsError } = await adminSupabase.from('invoice_items').insert(itemRows);
    if (insertItemsError) {
      return jsonUtf8(
        { error: insertItemsError.message },
        { status: 400 },
      );
    }

    return jsonUtf8({ invoice }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonUtf8({ error: message }, { status: 500 });
  }
}
