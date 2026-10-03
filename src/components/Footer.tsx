'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Lock, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-manova-card border-t border-manova-border py-12 px-4 sm:px-8 text-manova-text relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Brand Column */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-manova-primary to-manova-secondary p-[1px]">
              <div className="w-full h-full bg-manova-bg rounded-[11px] flex items-center justify-center">
                <Home className="w-5 h-5 text-manova-primary" />
              </div>
            </div>
            <span className="text-xl font-extrabold tracking-widest text-white">MANOVA SPATIAL INTERIORS</span>
          </div>
          
          <p className="text-xs text-manova-muted font-mono leading-relaxed max-w-md">
            Pioneering architectural interior design, luxury penthouse spatial concepts, acoustic timber paneling, Calacatta marble fabrication, and bespoke lighting automation.
          </p>

          <div className="flex items-center gap-2 text-xs font-mono text-manova-primary bg-manova-primary/10 border border-manova-primary/30 px-3 py-1.5 rounded-lg w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Excel & Google Drive Database Backend Active
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3 font-mono text-xs">
          <span className="text-white font-bold uppercase tracking-wider mb-1 text-sm">NAVIGATE</span>
          <a href="#hero-deconstructed" className="text-manova-muted hover:text-manova-primary transition-colors">
            3D Spatial Engine
          </a>
          <a href="#past-works" className="text-manova-muted hover:text-manova-primary transition-colors">
            Interior Projects Portfolio
          </a>
          <a href="#contact-section" className="text-manova-muted hover:text-manova-primary transition-colors">
            Spatial Consultation
          </a>
        </div>

        {/* Security & Admin Note */}
        <div className="flex flex-col gap-3 font-mono text-xs">
          <span className="text-white font-bold uppercase tracking-wider mb-1 text-sm">SECURITY & GATEWAY</span>
          <div className="text-manova-muted flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-manova-gold" />
            <span>Admin Gateway Protected</span>
          </div>
          <p className="text-[11px] text-manova-muted">
            Client inquiries & billing estimates automatically record to Excel spreadsheets & synchronized data logs.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-manova-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-manova-muted">
        <div>
          © {new Date().getFullYear()} MANOVA SPATIAL INTERIORS LAB. ALL RIGHTS RESERVED.
        </div>
        <div className="flex items-center gap-6">
          <span>DECONSTRUCTED 3D CAD ENGINE</span>
          <span>EXCEL BILLING ENGINE v2.4</span>
        </div>
      </div>
    </footer>
  );
}
