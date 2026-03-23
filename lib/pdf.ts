import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './invoices';
import type { InvoiceWithItems, ProfileRow } from './types';

type PdfLabels = {
  invoiceTitle: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  billTo: string;
  notes: string;
  subtotal: string;
  tax: string;
  total: string;
  tableDescription: string;
  tableQty: string;
  tableUnitPrice: string;
  tableTotal: string;
};

async function tryLoadImageDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateInvoicePdf(
  invoice: InvoiceWithItems,
  profile: ProfileRow | null,
  locale = 'en-US',
  labels?: Partial<PdfLabels>,
): Promise<void> {
  const finalLabels: PdfLabels = {
    invoiceTitle: labels?.invoiceTitle || 'INVOICE',
    invoiceNumber: labels?.invoiceNumber || 'Invoice #',
    issueDate: labels?.issueDate || 'Issue Date',
    dueDate: labels?.dueDate || 'Due Date',
    billTo: labels?.billTo || 'Bill To',
    notes: labels?.notes || 'Notes',
    subtotal: labels?.subtotal || 'Subtotal',
    tax: labels?.tax || 'Tax',
    total: labels?.total || 'Total',
    tableDescription: labels?.tableDescription || 'Description',
    tableQty: labels?.tableQty || 'Qty',
    tableUnitPrice: labels?.tableUnitPrice || 'Unit Price',
    tableTotal: labels?.tableTotal || 'Total',
  };
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const rightEdge = 595 - margin;
  let y = margin;

  if (profile?.logo_url) {
    const logoDataUrl = await tryLoadImageDataUrl(profile.logo_url);
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', margin, y, 72, 36);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(finalLabels.invoiceTitle, rightEdge, y + 24, { align: 'right' });
  y += 52;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${finalLabels.invoiceNumber}: ${invoice.invoice_number}`, margin, y);
  doc.text(`${finalLabels.issueDate}: ${invoice.issue_date}`, margin, y + 16);
  doc.text(`${finalLabels.dueDate}: ${invoice.due_date}`, margin, y + 32);

  const companyName = profile?.company_name || 'Your Company';
  doc.text(companyName, rightEdge, y, { align: 'right' });
  if (profile?.tax_id) {
    doc.text(`Tax ID: ${profile.tax_id}`, rightEdge, y + 16, { align: 'right' });
  }

  y += 56;
  doc.setFont('helvetica', 'bold');
  doc.text(finalLabels.billTo, margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.client_name, margin, y + 16);
  doc.text(invoice.client_email, margin, y + 32);

  y += 54;
  autoTable(doc, {
    startY: y,
    head: [[finalLabels.tableDescription, finalLabels.tableQty, finalLabels.tableUnitPrice, finalLabels.tableTotal]],
    body: invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      formatCurrency(invoice.currency, item.unit_price, locale),
      formatCurrency(invoice.currency, item.line_total, locale),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [17, 24, 39] },
    margin: { left: margin, right: margin },
  });

  const tableEndY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || y + 180;
  const summaryY = tableEndY + 30;

  doc.text(`${finalLabels.subtotal}: ${formatCurrency(invoice.currency, invoice.subtotal, locale)}`, rightEdge, summaryY, { align: 'right' });
  doc.text(`${finalLabels.tax} (${invoice.tax_rate}%): ${formatCurrency(invoice.currency, invoice.tax_amount, locale)}`, rightEdge, summaryY + 16, {
    align: 'right',
  });

  doc.setFont('helvetica', 'bold');
  doc.text(`${finalLabels.total}: ${formatCurrency(invoice.currency, invoice.total, locale)}`, rightEdge, summaryY + 36, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  if (invoice.notes.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.text(finalLabels.notes, margin, summaryY + 70);
    doc.setFont('helvetica', 'normal');
    const wrapped = doc.splitTextToSize(invoice.notes, 500);
    doc.text(wrapped, margin, summaryY + 88);
  }

  doc.save(`${invoice.invoice_number}.pdf`);
}
