'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Plus, Trash2, FileText, Table as TableIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface LineItem {
  id: string;
  material: string;
  quantity: number;
  unitPrice: number;
}

export default function EstimateGenerator() {
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    project: '',
    address: '',
    sqft: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', material: 'Modular Kitchen - Plywood', quantity: 1, unitPrice: 150000 },
    { id: '2', material: 'Wardrobe - Sliding', quantity: 2, unitPrice: 45000 },
  ]);

  const updateCustomer = (field: string, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), material: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text('Elshadai Decors', 14, 20);
    doc.setFontSize(10);
    doc.text('Interior Design Estimate', 14, 28);
    
    // Customer Details
    doc.setFontSize(12);
    doc.text('Customer Details:', 14, 40);
    doc.setFontSize(10);
    doc.text(`Name: ${customer.name}`, 14, 48);
    doc.text(`Phone: ${customer.phone}`, 14, 54);
    doc.text(`Email: ${customer.email}`, 14, 60);
    doc.text(`Address: ${customer.address}`, 14, 66);
    
    doc.text(`Project: ${customer.project}`, 120, 48);
    doc.text(`Area (SqFt): ${customer.sqft}`, 120, 54);
    doc.text(`Date: ${customer.date}`, 120, 60);

    // Table
    const tableColumn = ["Material / Description", "Qty / SqFt", "Unit Price", "Total (INR)"];
    const tableRows = items.map(item => [
      item.material,
      item.quantity.toString(),
      item.unitPrice.toLocaleString('en-IN'),
      (item.quantity * item.unitPrice).toLocaleString('en-IN')
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [37, 48, 44] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 75;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total: INR ${totalAmount.toLocaleString('en-IN')}`, 14, finalY + 15);
    
    doc.save(`Estimate_${customer.name.replace(/\\s+/g, '_')}_${customer.date}.pdf`);
  };

  const generateExcel = () => {
    // Transform items for excel
    const excelData = items.map(item => ({
      'Material / Description': item.material,
      'Qty / SqFt': item.quantity,
      'Unit Price (INR)': item.unitPrice,
      'Total (INR)': item.quantity * item.unitPrice
    }));
    
    // Add Total Row
    excelData.push({
      'Material / Description': 'GRAND TOTAL',
      'Qty / SqFt': '' as any,
      'Unit Price (INR)': '' as any,
      'Total (INR)': totalAmount
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Customer Info in Excel could be added manually, but for a clean table we just add the list
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estimate");
    
    XLSX.writeFile(workbook, `Estimate_${customer.name.replace(/\\s+/g, '_')}_${customer.date}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] p-8 font-sans text-[#25302c]">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-[#c8714d] hover:underline mb-2 font-bold uppercase tracking-wider"><ArrowLeft size={16}/> Back to CMS</Link>
            <h1 className="text-3xl font-serif">Estimate & Billing Generator</h1>
            <p className="text-sm text-[#6c756e] mt-1">Create dynamic interior estimates and export to PDF or Excel.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={generatePDF} className="flex items-center gap-2 bg-[#25302c] text-white px-4 py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-[#1a221f]">
              <FileText size={16} /> Download PDF
            </button>
            <button onClick={generateExcel} className="flex items-center gap-2 bg-[#107c41] text-white px-4 py-2 rounded text-sm font-bold uppercase tracking-wide hover:bg-[#0c5e31]">
              <TableIcon size={16} /> Download Excel
            </button>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white p-6 rounded shadow-sm border border-[#eeeae2]">
          <h2 className="text-xl font-serif mb-4">Customer & Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e]">
              Customer Name
              <input value={customer.name} onChange={e => updateCustomer('name', e.target.value)} className="w-full p-2 mt-1 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d]" placeholder="e.g. John Doe" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e]">
              Project Name
              <input value={customer.project} onChange={e => updateCustomer('project', e.target.value)} className="w-full p-2 mt-1 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d]" placeholder="e.g. 3BHK Apartment - OMR" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e]">
              Phone Number
              <input value={customer.phone} onChange={e => updateCustomer('phone', e.target.value)} className="w-full p-2 mt-1 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d]" placeholder="+91 98765 43210" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e]">
              Total Area (SqFt)
              <input value={customer.sqft} onChange={e => updateCustomer('sqft', e.target.value)} className="w-full p-2 mt-1 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d]" placeholder="1200 SqFt" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e]">
              Email Address
              <input value={customer.email} onChange={e => updateCustomer('email', e.target.value)} className="w-full p-2 mt-1 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d]" placeholder="john@example.com" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e]">
              Date
              <input type="date" value={customer.date} onChange={e => updateCustomer('date', e.target.value)} className="w-full p-2 mt-1 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d]" />
            </label>
            <label className="block md:col-span-2 text-xs font-bold uppercase tracking-wider text-[#6c756e]">
              Address
              <textarea value={customer.address} onChange={e => updateCustomer('address', e.target.value)} rows={2} className="w-full p-2 mt-1 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d]" placeholder="Project / Shipping Address" />
            </label>
          </div>
        </div>

        {/* Materials Table */}
        <div className="bg-white p-6 rounded shadow-sm border border-[#eeeae2]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif">Materials & Line Items</h2>
            <button onClick={addItem} className="flex items-center gap-1 text-sm font-bold uppercase tracking-wider text-[#c8714d] hover:bg-[#faf8f5] px-3 py-1 rounded border border-transparent hover:border-[#d8d4ca]">
              <Plus size={16} /> Add Row
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-bold uppercase tracking-wider text-[#6c756e] border-b border-[#eeeae2] pb-2">
              <div className="col-span-6">Material Description</div>
              <div className="col-span-2 text-center">Qty / SqFt</div>
              <div className="col-span-2 text-center">Unit Price (₹)</div>
              <div className="col-span-2 text-right pr-8">Total (₹)</div>
            </div>

            {/* Rows */}
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-[#eeeae2] p-3 rounded md:border-0 md:p-0 md:border-b pb-3">
                <div className="col-span-6">
                  <input 
                    value={item.material} 
                    onChange={(e) => updateItem(item.id, 'material', e.target.value)} 
                    placeholder="E.g. Wardrobe, Kitchen Cabinets..."
                    className="w-full p-2 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d] text-sm" 
                  />
                </div>
                <div className="col-span-2">
                  <span className="md:hidden text-xs uppercase font-bold text-[#6c756e] block mb-1">Qty</span>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} 
                    className="w-full p-2 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d] text-sm text-center" 
                  />
                </div>
                <div className="col-span-2">
                  <span className="md:hidden text-xs uppercase font-bold text-[#6c756e] block mb-1">Unit Price</span>
                  <input 
                    type="number" 
                    value={item.unitPrice} 
                    onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))} 
                    className="w-full p-2 border border-[#d8d4ca] rounded focus:outline-none focus:border-[#c8714d] text-sm text-center" 
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between md:justify-end gap-2">
                  <span className="md:hidden text-xs uppercase font-bold text-[#6c756e]">Total</span>
                  <div className="font-bold whitespace-nowrap">₹ {(item.quantity * item.unitPrice).toLocaleString('en-IN')}</div>
                  <button onClick={() => removeItem(item.id)} className="text-[#9d442d] hover:bg-[#f8e4df] p-2 rounded" title="Remove Item">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end pt-4 border-t border-[#d8d4ca]">
            <div className="text-xl">
              <span className="font-serif mr-4">Grand Total:</span>
              <span className="font-bold text-[#25302c]">₹ {totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
