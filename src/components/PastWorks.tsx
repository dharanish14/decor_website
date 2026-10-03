'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PastWork } from '@/lib/dataStore';
import { Palette, ExternalLink, Sparkles, Filter, Download, X, Layers } from 'lucide-react';
import { exportPastWorksToExcel } from '@/lib/excelExport';

interface PastWorksProps {
  works: PastWork[];
}

export default function PastWorks({ works }: PastWorksProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWork, setSelectedWork] = useState<PastWork | null>(null);

  const categories = ['All', 'Residential', 'Commercial', 'Furniture & Lighting', 'Architectural 3D', 'Renovation'];

  const filteredWorks = selectedCategory === 'All'
    ? works
    : works.filter(w => w.category === selectedCategory);

  return (
    <section id="past-works" className="w-full py-24 px-4 sm:px-8 bg-manova-bg relative overflow-hidden">
      
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-manova-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-manova-primary font-bold uppercase tracking-widest mb-2">
              <Palette className="w-4 h-4" />
              ARCHITECTURAL PORTFOLIO & INTERIOR SHOWCASE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              BESPOKE INTERIOR DESIGN & SPATIAL PROJECTS
            </h2>
            <p className="text-manova-muted text-sm sm:text-base font-mono max-w-2xl mt-3">
              Explore our luxury residential penthouses, executive boardroom suites, custom walnut furniture, and 3D architectural renders. Fully customizable via Admin Panel.
            </p>
          </div>

          <button
            onClick={() => exportPastWorksToExcel(works)}
            className="px-4 py-2.5 rounded-xl border border-manova-border hover:border-manova-primary text-manova-text hover:text-manova-primary bg-manova-card font-mono text-xs flex items-center gap-2 transition-all shadow-lg self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-manova-primary" />
            Export Portfolio (.xlsx)
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none border-b border-manova-border/50">
          <Filter className="w-4 h-4 text-manova-muted shrink-0 mr-2" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-manova-primary text-manova-bg shadow-lg shadow-manova-primary/20'
                  : 'bg-manova-card border border-manova-border/60 text-manova-muted hover:text-white hover:border-manova-primary/40'
              }`}
            >
              {cat === 'All' ? 'ALL PROJECTS' : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Past Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredWorks.map((work) => (
              <motion.div
                key={work.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                className="glass-panel-interactive rounded-2xl overflow-hidden flex flex-col group cursor-pointer"
                onClick={() => setSelectedWork(work)}
              >
                {/* Image Container */}
                <div className="relative w-full h-64 bg-manova-card overflow-hidden">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-manova-card via-transparent to-transparent opacity-85" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-manova-bg/85 backdrop-blur-md text-manova-primary border border-manova-primary/40">
                      {work.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-manova-bg/85 backdrop-blur-md text-manova-gold border border-manova-gold/40">
                      {work.year}
                    </span>
                  </div>

                  {work.featured && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono bg-manova-secondary/80 backdrop-blur-md text-white border border-manova-secondary">
                      <Sparkles className="w-3 h-3 text-manova-gold" />
                      FEATURED PROJECT
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-manova-primary transition-colors flex items-center justify-between">
                      {work.title}
                      <ExternalLink className="w-4 h-4 text-manova-muted group-hover:text-manova-primary transition-colors" />
                    </h3>
                    <p className="text-xs text-manova-muted font-mono line-clamp-2 mt-2 leading-relaxed">
                      {work.description}
                    </p>
                  </div>

                  {/* Specs Quick Pill */}
                  <div className="mt-6 pt-4 border-t border-manova-border/60 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    {work.specs.slice(0, 2).map((spec, idx) => (
                      <div key={idx} className="bg-manova-bg/50 p-2 rounded-lg border border-manova-border/40">
                        <span className="text-manova-muted block text-[9px] uppercase">{spec.label}</span>
                        <span className="text-white font-bold truncate block">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Work Detail Modal */}
      <AnimatePresence>
        {selectedWork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel w-full max-w-3xl rounded-2xl overflow-hidden border border-manova-primary/40 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-manova-bg/80 border border-manova-border text-white hover:text-manova-primary"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full h-80 bg-manova-card">
                <img
                  src={selectedWork.image}
                  alt={selectedWork.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-manova-bg via-manova-bg/40 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-xs font-mono text-manova-primary uppercase tracking-widest block font-bold">
                    {selectedWork.category} • {selectedWork.year}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    {selectedWork.title}
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="text-xs font-mono text-manova-muted uppercase tracking-widest mb-2 font-bold">
                    SPATIAL DESIGN OVERVIEW
                  </h4>
                  <p className="text-sm font-mono text-manova-text leading-relaxed bg-manova-card/60 p-4 rounded-xl border border-manova-border/60">
                    {selectedWork.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-manova-muted uppercase tracking-widest mb-3 font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-manova-primary" />
                    TECHNICAL SPECIFICATIONS & MATERIAL PALETTE
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    {selectedWork.specs.map((spec, idx) => (
                      <div key={idx} className="bg-manova-card p-3 rounded-xl border border-manova-border flex justify-between items-center">
                        <span className="text-manova-muted">{spec.label}:</span>
                        <span className="text-manova-primary font-bold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-manova-border flex justify-end">
                  <button
                    onClick={() => setSelectedWork(null)}
                    className="px-6 py-2.5 rounded-xl bg-manova-primary text-manova-bg font-mono font-bold text-xs uppercase"
                  >
                    CLOSE PROJECT DETAILS
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
