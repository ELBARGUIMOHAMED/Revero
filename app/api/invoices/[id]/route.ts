import { createOptionalAdminClient } from '../../../../lib/supabase/admin';
import { jsonUtf8 } from '../../../../lib/http';
import { createClient } from '../../../../lib/supabase/server';
import type { InvoiceInput, InvoiceStatus } from '../../../../lib/types';

type Params = {
  params: Promise<{ id: string }>;
};

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function hasOnlyStatus(payload: Partial<InvoiceInput> & { status?: InvoiceStatus }): boolean {
  const keys = Object.keys(payload);
  return keys.length === 1 && keys[0] === 'status';
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminSupabase = createOptionalAdminClient() || supabase;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonUtf8({ error: authError?.message || 'Unauthorized' }, { status: 401 });
    }

    const [{ data: invoice, error: invoiceError }, { data: items, error: itemsError }] = await Promise.all([
      supabase.from('invoices').select('*').eq('id', id).eq('user_id', user.id).single(),
      adminSupabase.from('invoice_items').select('*').eq('invoice_id', id),
    ]);

    if (invoiceError || !invoice) {
      return jsonUtf8({ error: invoiceError?.message || 'Invoice not found.' }, { status: 404 });
    }

    if (itemsError) {
      return jsonUtf8({ error: itemsError.message }, { status: 400 });
    }

    return jsonUtf8({
      invoice: {
        ...invoice,
        items: items || [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonUtf8({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminSupabase = createOptionalAdminClient() || supabase;
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonUtf8({ error: authError?.message || 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json().catch(() => ({}))) as Partial<InvoiceInput> & { status?: InvoiceStatus };

    // Fast path for status-only updates (e.g. "Mark as sent/paid")
    if (payload.status && hasOnlyStatus(payload)) {
      const { error } = await supabase
        .from('invoices')
        .update({ status: payload.status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return jsonUtf8({ error: error.message || 'Failed to update status.' }, { status: 400 });
      }

      return jsonUtf8({ success: true, status: payload.status });
    }

    const { data: existingInvoice, error: existingError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (existingError || !existingInvoice) {
      return jsonUtf8({ error: existingError?.message || 'Invoice not found.' }, { status: 404 });
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    if (items.length === 0) {
      return jsonUtf8({ error: 'At least one invoice item is required.' }, { status: 400 });
    }

    const subtotal = Number(
      items
        .reduce((sum, item) => sum + toNumber(item.quantity) * toNumber(item.unitPrice), 0)
        .toFixed(2),
    );
    const taxRate = toNumber(payload.taxRate ?? existingInvoice.tax_rate);
    const taxAmount = Number((subtotal * (taxRate / 100)).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));

    const { data: invoice, error: updateError } = await supabase
      .from('invoices')
      .update({
        client_name: payload.clientName ?? existingInvoice.client_name,
        client_email: payload.clientEmail ?? existingInvoice.client_email,
        issue_date: payload.issueDate ?? existingInvoice.issue_date,
        due_date: payload.dueDate ?? existingInvoice.due_date,
        notes: payload.notes ?? existingInvoice.notes,
        status: payload.status ?? existingInvoice.status,
        currency: payload.currency ?? existingInvoice.currency,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (updateError || !invoice) {
      return jsonUtf8({ error: updateError?.message || 'Failed to update invoice.' }, { status: 400 });
    }

    const { error: deleteItemsError } = await adminSupabase.from('invoice_items').delete().eq('invoice_id', id);
    if (deleteItemsError) {
      return jsonUtf8({ error: deleteItemsError.message }, { status: 400 });
    }

    const itemRows = items.map((item) => {
      const quantity = toNumber(item.quantity);
      const unitPrice = toNumber(item.unitPrice);
      return {
        invoice_id: id,
        description: item.description,
        quantity,
        unit_price: unitPrice,
        line_total: Number((quantity * unitPrice).toFixed(2)),
      };
    });

    const { error: insertItemsError } = await adminSupabase.from('invoice_items').insert(itemRows);
    if (insertItemsError) {
      return jsonUtf8({ error: insertItemsError.message }, { status: 400 });
    }

    return jsonUtf8({ invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonUtf8({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonUtf8({ error: authError?.message || 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase.from('invoices').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      return jsonUtf8({ error: error.message }, { status: 400 });
    }

    return jsonUtf8({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonUtf8({ error: message }, { status: 500 });
  }
}
