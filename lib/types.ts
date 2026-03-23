export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'MAD';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type PlanType = 'free' | 'pro';
export type UserRole = 'user' | 'admin';

export type InvoiceItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceInput = {
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  taxRate: number;
  currency: CurrencyCode;
  status: InvoiceStatus;
  items: InvoiceItemInput[];
};

export type InvoiceRow = {
  id: string;
  user_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  due_date: string;
  notes: string;
  status: InvoiceStatus;
  currency: CurrencyCode;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
};

export type InvoiceItemRow = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  tax_id: string | null;
  plan: PlanType;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanType;
  status: string;
  current_period_end: string | null;
  created_at: string;
};

export type InvoiceWithItems = InvoiceRow & {
  items: InvoiceItemRow[];
};

export type DashboardSummary = {
  totalRevenue: number;
  invoiceCount: number;
  monthlyRevenue: Array<{ month: string; total: number }>;
  recentInvoices: InvoiceRow[];
};
