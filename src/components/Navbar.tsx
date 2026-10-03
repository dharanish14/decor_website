'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Sparkles, FileText, Menu, X, PhoneCall, Layers, Palette } from 'lucide-react';

interface NavbarProps {
  onOpenQuoteModal: () => void;
  onOpenContactModal: () => void;
}

export default function Navbar({ onOpenQuoteModal, onOpenContactModal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl border border-manova-border/70 p-3 sm:px-6 flex items-center justify-between pointer-events-auto shadow-2xl backdrop-blur-xl bg-manova-bg/85">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-manova-primary via-manova-gold to-manova-secondary p-[1px] shadow-lg shadow-manova-primary/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-manova-bg rounded-[11px] flex items-center justify-center">
              <Home className="w-5 h-5 text-manova-primary group-hover:rotate-6 transition-transform" />
            </div>
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-manova-gold to-manova-primary">
              MANOVA
            </span>
            <span className="block text-[9px] font-mono text-manova-primary uppercase tracking-widest">
              INTERIORS & SPATIAL DESIGN
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider uppercase">
          <a href="#hero-deconstructed" className="text-manova-muted hover:text-manova-primary transition-colors flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            3D Room Engine
          </a>
          <a href="#past-works" className="text-manova-muted hover:text-manova-primary transition-colors flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Portfolio
          </a>
          <a href="#contact-section" className="text-manova-muted hover:text-manova-primary transition-colors flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" />
            Consultation
          </a>
        </div>

        {/* Action CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenQuoteModal}
            className="px-4 py-2 rounded-xl border border-manova-primary/50 text-manova-primary hover:bg-manova-primary/10 text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Generate Excel Quote
          </button>

          <button
            onClick={onOpenContactModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-manova-primary to-manova-secondary text-manova-bg font-bold text-xs font-mono tracking-wider uppercase hover:opacity-90 transition-all shadow-md shadow-manova-primary/20 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Book Consultation
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenQuoteModal}
            className="p-2 rounded-lg bg-manova-primary/10 text-manova-primary border border-manova-primary/40 text-xs font-mono"
            title="Excel Quote"
          >
            <FileText className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-manova-card border border-manova-border text-manova-text"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-7xl mx-auto glass-panel rounded-2xl border border-manova-border p-5 flex flex-col gap-4 pointer-events-auto bg-manova-bg/95 backdrop-blur-2xl">
          <a
            href="#hero-deconstructed"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-mono text-manova-text hover:text-manova-primary py-2 border-b border-manova-border/50"
          >
            01. 3D Deconstructed Spatial Engine
          </a>
          <a
            href="#past-works"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-mono text-manova-text hover:text-manova-primary py-2 border-b border-manova-border/50"
          >
            02. Interior Design Portfolio
          </a>
          <a
            href="#contact-section"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-mono text-manova-text hover:text-manova-primary py-2 border-b border-manova-border/50"
          >
            03. Spatial Consultation & Contact
          </a>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuoteModal();
              }}
              className="w-full py-3 rounded-xl border border-manova-primary text-manova-primary font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Generate Excel Billing Quote
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContactModal();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-manova-primary to-manova-secondary text-manova-bg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Book Interior Consultation
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
