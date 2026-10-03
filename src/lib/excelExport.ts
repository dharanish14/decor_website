import * as XLSX from 'xlsx';
import { LeadSubmission, PastWork } from './dataStore';

export interface QuoteItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceQuotationData {
  quoteId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleModel: string; // Property Scope / Project Name e.g. "Skyline Penthouse Redesign"
  items: QuoteItem[];
  taxRate: number; // percentage e.g. 18
  discount: number; // fixed amount
  notes: string;
  watermarkText?: string;
}

/**
 * Generates an Excel Worksheet formatted as a Commercial Billing Invoice for Interior Design Services
 * with Watermark headers and summary calculations.
 */
export function generateQuotationExcel(data: InvoiceQuotationData) {
  const wb = XLSX.utils.book_new();

  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * (data.taxRate / 100));
  const grandTotal = subtotal + taxAmount - data.discount;

  const headerRows = [
    ['================================================================================='],
    ['                 MANOVA SPATIAL DESIGN & ARCHITECTURAL INTERIORS                 '],
    ['                 BESPOKE INTERIOR DESIGN & ARCHITECTURAL FABRICATION             '],
    ['================================================================================='],
    [`WATERMARK: [ ${data.watermarkText || 'MANOVA INTERIORS OFFICIAL QUOTATION'} ]`],
    ['---------------------------------------------------------------------------------'],
    [`QUOTATION REF: ${data.quoteId}`, `DATE: ${data.date}`],
    [`CLIENT NAME: ${data.customerName}`, `PHONE: ${data.customerPhone}`],
    [`CLIENT EMAIL: ${data.customerEmail}`, `PROJECT / PROPERTY: ${data.vehicleModel}`],
    ['---------------------------------------------------------------------------------'],
    ['ITEM #', 'INTERIOR SERVICE / ITEM DESCRIPTION', 'CATEGORY', 'QTY / SQ.FT', 'RATE ($)', 'TOTAL ($)'],
    ['---------------------------------------------------------------------------------']
  ];

  const itemRows = data.items.map((item, idx) => [
    idx + 1,
    item.description,
    item.category,
    item.quantity,
    item.unitPrice.toFixed(2),
    (item.quantity * item.unitPrice).toFixed(2)
  ]);

  const summaryRows = [
    ['---------------------------------------------------------------------------------'],
    ['', '', '', '', 'SUBTOTAL:', subtotal.toFixed(2)],
    ['', '', '', '', `TAX (${data.taxRate}%):`, taxAmount.toFixed(2)],
    ['', '', '', '', 'DISCOUNT:', `-${data.discount.toFixed(2)}`],
    ['', '', '', '', '====================', '===================='],
    ['', '', '', '', 'NET ESTIMATE TOTAL ($):', grandTotal.toFixed(2)],
    ['================================================================================='],
    ['TERMS & WARRANTY:'],
    [data.notes || 'Includes 3D CAD Visualization, Material Sourcing, and 5-Year Craftsmanship Warranty.'],
    ['---------------------------------------------------------------------------------'],
    ['AUTHENTICATED BY MANOVA ADMIN PANEL | COMMERCIAL BILLING SYSTEM'],
    [`VERIFICATION TOKEN: MNV-INT-${Math.floor(100000 + Math.random() * 900000)}`]
  ];

  const fullData = [...headerRows, ...itemRows, ...summaryRows];

  const ws = XLSX.utils.aoa_to_sheet(fullData);

  ws['!cols'] = [
    { wch: 8 },  // Item #
    { wch: 48 }, // Description
    { wch: 22 }, // Category
    { wch: 12 }, // Qty
    { wch: 18 }, // Rate
    { wch: 20 }  // Total
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'MANOVA Interior Quote');

  return wb;
}

export function downloadQuotationExcel(data: InvoiceQuotationData) {
  const wb = generateQuotationExcel(data);
  const filename = `MANOVA_Interior_Quote_${data.quoteId}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportLeadsToExcel(leads: LeadSubmission[]) {
  const wb = XLSX.utils.book_new();

  const formattedLeads = leads.map(l => ({
    'Lead ID': l.id,
    'Client Name': l.name,
    'Email Address': l.email,
    'Phone Number': l.phone,
    'Requested Interior Service': l.serviceType,
    'Estimated Budget': l.budget,
    'Submission Date': l.createdAt,
    'Status': l.status,
    'Project Requirements': l.message
  }));

  const ws = XLSX.utils.json_to_sheet(formattedLeads);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 28 },
    { wch: 18 },
    { wch: 28 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'MANOVA Client Leads');
  XLSX.writeFile(wb, `MANOVA_Interior_Leads_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportPastWorksToExcel(works: PastWork[]) {
  const wb = XLSX.utils.book_new();

  const formattedWorks = works.map(w => ({
    'Project ID': w.id,
    'Project Title': w.title,
    'Category': w.category,
    'Completion Year': w.year,
    'Featured': w.featured ? 'Yes' : 'No',
    'Description': w.description,
    'Image URL': w.image,
    'Specifications & Palette': w.specs.map(s => `${s.label}: ${s.value}`).join(' | ')
  }));

  const ws = XLSX.utils.json_to_sheet(formattedWorks);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 32 },
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 45 },
    { wch: 45 },
    { wch: 40 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'MANOVA Portfolio');
  XLSX.writeFile(wb, `MANOVA_Interior_Portfolio_${new Date().toISOString().split('T')[0]}.xlsx`);
}
