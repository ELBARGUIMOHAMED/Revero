import InvoiceForm from '../../../../components/invoices/InvoiceForm';

export default function NewInvoicePage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[#10263b]/85 p-5 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Create invoice</h1>
        <p className="text-sm text-slate-300">Generate a professional invoice in seconds.</p>
      </div>
      <InvoiceForm mode="create" />
    </div>
  );
}

