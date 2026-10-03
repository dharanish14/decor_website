'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Download, Printer, FileSpreadsheet, Receipt } from 'lucide-react';
import { downloadQuotationExcel, QuoteItem, InvoiceQuotationData } from '@/lib/excelExport';

interface QuotationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuotationGeneratorModal({ isOpen, onClose }: QuotationGeneratorModalProps) {
  const [customerName, setCustomerName] = useState('Lady Eleanor Vance');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 492-0199');
  const [customerEmail, setCustomerEmail] = useState('eleanor.vance@vancemedia.com');
  const [vehicleModel, setVehicleModel] = useState('The Obsidian Penthouse Suite (4,200 sq.ft)');
  const [taxRate, setTaxRate] = useState(18);
  const [discount, setDiscount] = useState(1500);
  const [watermarkText, setWatermarkText] = useState('MANOVA INTERIORS OFFICIAL QUOTATION');
  const [notes, setNotes] = useState('Includes 3D Spatial Renders, Material Samples, and 5-Year Craftsmanship Warranty.');

  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: '1',
      description: '3D Spatial Conceptualization & Photorealistic Renderings',
      category: 'Design & Renders',
      quantity: 1,
      unitPrice: 6500
    },
    {
      id: '2',
      description: 'Calacatta Gold Italian Marble Wall Cladding & Island Slab',
      category: 'Stone & Fabrication',
      quantity: 1,
      unitPrice: 18500
    },
    {
      id: '3',
      description: 'Acoustic Slotted Smoked Oak Timber Wall Paneling System',
      category: 'Architectural Woodwork',
      quantity: 1,
      unitPrice: 9200
    },
    {
      id: '4',
      description: 'Custom Italian Velvet Modular Seating & Lounger Suite',
      category: 'Bespoke Furniture',
      quantity: 1,
      unitPrice: 12400
    },
    {
      id: '5',
      description: 'DALI Smart Dimmable 2700K Architectural Lighting System',
      category: 'Architectural Lighting',
      quantity: 1,
      unitPrice: 5800
    }
  ]);

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCat, setNewItemCat] = useState('Spatial Design');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(2500);

  const addItem = () => {
    if (!newItemDesc) return;
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: newItemDesc,
        category: newItemCat,
        quantity: Number(newItemQty),
        unitPrice: Number(newItemPrice)
      }
    ]);
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(2500);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const subtotal = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  const taxAmount = (subtotal * (taxRate / 100));
  const grandTotal = subtotal + taxAmount - discount;

  const quoteId = `MNV-INT-${Math.floor(10000 + Math.random() * 90000)}`;
  const currentDate = new Date().toISOString().split('T')[0];

  const handleExportExcel = () => {
    const data: InvoiceQuotationData = {
      quoteId,
      date: currentDate,
      customerName,
      customerPhone,
      customerEmail,
      vehicleModel,
      items,
      taxRate,
      discount,
      notes,
      watermarkText
    };
    downloadQuotationExcel(data);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-5xl rounded-2xl overflow-hidden border border-manova-primary/50 shadow-2xl relative my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-manova-border flex items-center justify-between bg-manova-card/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-manova-primary/10 border border-manova-primary/40 text-manova-primary">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                SUPERMARKET BILLING SYSTEM INTERIOR QUOTATION GENERATOR
              </h2>
              <p className="text-xs text-manova-muted font-mono">
                Generate official spatial estimates with embedded watermarks & instant Excel spreadsheet export (.xlsx)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-manova-bg border border-manova-border text-manova-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Client & Project Details Form */}
            <div className="bg-manova-card p-4 rounded-xl border border-manova-border space-y-3 font-mono text-xs">
              <span className="text-manova-primary font-bold uppercase tracking-wider block text-xs mb-1">
                CLIENT & PROPERTY DETAILS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-manova-muted block mb-1">Client Name:</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono focus:border-manova-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-manova-muted block mb-1">Phone Number:</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono focus:border-manova-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-manova-muted block mb-1">Email Address:</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono focus:border-manova-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-manova-muted block mb-1">Property / Project Scope:</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono focus:border-manova-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Add New Line Item Form */}
            <div className="bg-manova-card p-4 rounded-xl border border-manova-border space-y-3 font-mono text-xs">
              <span className="text-manova-gold font-bold uppercase tracking-wider block text-xs mb-1">
                ADD INTERIOR WORK / ITEM
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Description (e.g. Oak Wall Paneling)"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value)}
                    className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono outline-none"
                  >
                    <option value="Design & Renders">3D Concept</option>
                    <option value="Stone & Fabrication">Marble/Stone</option>
                    <option value="Architectural Woodwork">Woodwork</option>
                    <option value="Bespoke Furniture">Furniture</option>
                    <option value="Architectural Lighting">Lighting</option>
                    <option value="Installation & Supervision">Labor</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Rate $"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono outline-none"
                  />
                </div>
              </div>
              <button
                onClick={addItem}
                className="w-full py-2 bg-manova-primary text-manova-bg font-bold rounded-lg flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> ADD TO QUOTATION
              </button>
            </div>

            {/* Line Items List */}
            <div className="bg-manova-card p-4 rounded-xl border border-manova-border space-y-2 font-mono text-xs">
              <span className="text-white font-bold uppercase tracking-wider block mb-2">
                ESTIMATE LINE ITEMS ({items.length})
              </span>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-manova-bg border border-manova-border/60"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="text-white font-bold block truncate">{item.description}</span>
                    <span className="text-manova-muted text-[10px]">
                      Category: {item.category} | Qty: {item.quantity} x ${item.unitPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-manova-primary font-bold">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-manova-accent hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Adjustments & Watermark Text */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-manova-card p-3 rounded-xl border border-manova-border">
                <label className="text-manova-muted block mb-1">Tax Rate (%):</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono outline-none"
                />
              </div>
              <div className="bg-manova-card p-3 rounded-xl border border-manova-border">
                <label className="text-manova-muted block mb-1">Discount ($):</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono outline-none"
                />
              </div>
              <div className="bg-manova-card p-3 rounded-xl border border-manova-border">
                <label className="text-manova-muted block mb-1">Watermark Label:</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full bg-manova-bg border border-manova-border p-2 rounded-lg text-white font-mono outline-none text-[11px]"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Receipt Preview with Watermark */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="receipt-paper p-6 rounded-xl relative overflow-hidden text-xs border border-gray-300">
              
              {/* Supermarket Billing Watermark Overlay */}
              <div className="watermark-overlay select-none">
                {watermarkText}
              </div>

              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-gray-400 pb-4 mb-4">
                <h3 className="font-bold text-base tracking-widest text-black">MANOVA SPATIAL INTERIORS</h3>
                <p className="text-[10px] text-gray-600">ARCHITECTURAL DESIGN & FABRICATION</p>
                <p className="text-[10px] text-gray-600">COMMERCIAL BILLING SYSTEM RECEIPT</p>
                <div className="text-[10px] text-gray-500 mt-2">
                  REF: {quoteId} | DATE: {currentDate}
                </div>
              </div>

              {/* Client Box */}
              <div className="border-b border-dashed border-gray-400 pb-3 mb-3 text-[11px] leading-tight space-y-0.5">
                <div><span className="font-bold">CLIENT:</span> {customerName}</div>
                <div><span className="font-bold">PHONE:</span> {customerPhone}</div>
                <div><span className="font-bold">PROPERTY:</span> {vehicleModel}</div>
              </div>

              {/* Receipt Items */}
              <div className="space-y-2 border-b border-dashed border-gray-400 pb-4 mb-4">
                <div className="flex justify-between font-bold text-[10px] border-b border-gray-200 pb-1">
                  <span>SERVICE / ITEM</span>
                  <span>AMOUNT ($)</span>
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div className="pr-2">
                      <div className="font-bold leading-tight">{idx + 1}. {item.description}</div>
                      <div className="text-[10px] text-gray-500">{item.quantity} x ${item.unitPrice.toFixed(2)}</div>
                    </div>
                    <div className="font-bold whitespace-nowrap">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations Summary */}
              <div className="space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">SUBTOTAL:</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TAX ({taxRate}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>DISCOUNT:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-black pt-1 mt-2 flex justify-between font-bold text-sm text-black">
                  <span>GRAND ESTIMATE:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center border-t border-dashed border-gray-400 pt-4 mt-4 text-[9px] text-gray-500">
                <p>AUTHENTICATED BY MANOVA ADMIN PANEL</p>
                <div className="font-mono text-xs font-bold text-black tracking-widest mt-1">
                  ||||| ||||||| |||| |||||||| |||||
                </div>
                <p className="text-[8px] mt-0.5">MNV-INT-TOKEN-{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportExcel}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                EXPORT EXCEL WITH WATERMARK (.XLSX)
              </button>

              <button
                onClick={handlePrint}
                className="py-3 px-4 rounded-xl bg-manova-card border border-manova-border text-white hover:text-manova-primary font-mono font-bold text-xs uppercase flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                PRINT
              </button>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
