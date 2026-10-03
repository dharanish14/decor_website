'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, RotateCcw, Sparkles, Home, Box, Eye, ChevronDown } from 'lucide-react';

interface BikeDeconstructedCanvasProps {
  onExploreClick?: () => void;
}

export default function BikeDeconstructedCanvas({ onExploreClick }: BikeDeconstructedCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [explodedProgress, setExplodedProgress] = useState(0);
  const [activePart, setActivePart] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [manualSlider, setManualSlider] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  // Scroll bindings using framer-motion
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scrollExplode = useTransform(scrollYProgress, [0, 0.5, 0.95], [0, 1, 0.2]);

  useEffect(() => {
    const unsubscribe = scrollExplode.on("change", (latest) => {
      if (!manualOverride) {
        setExplodedProgress(latest);
      }
    });
    return () => unsubscribe();
  }, [scrollExplode, manualOverride]);

  const effectiveProgress = manualOverride ? manualSlider : explodedProgress;

  // High-performance 3D Room & Furniture Deconstruction Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Render loop for 3D Deconstructed Architectural Room
    const render = () => {
      if (autoRotate) {
        angle += 0.005;
      }

      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2 + 10;

      ctx.clearRect(0, 0, w, h);

      // Floor grid floor plan
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
      ctx.lineWidth = 1;
      const floorY = centerY + 140;

      for (let x = -w; x < w * 2; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x + (angle * 15) % 50, floorY);
        ctx.lineTo(centerX + (x - centerX) * 2.2, h + 100);
        ctx.stroke();
      }

      // Warm Ambient Interior Spotlight backdrop
      const glowGrad = ctx.createRadialGradient(centerX, centerY - 40, 30, centerX, centerY, 380);
      glowGrad.addColorStop(0, 'rgba(212, 175, 55, 0.18)');
      glowGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.06)');
      glowGrad.addColorStop(1, 'rgba(11, 14, 20, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      const p = effectiveProgress; // 0 = assembled room, 1 = exploded interior space
      const scale = Math.min(w / 950, 1.15);

      // Room Deconstructed Components Definition
      const components = [
        {
          name: 'Acoustic Slotted Oak Wall Panel',
          id: 'wall',
          baseX: 0,
          baseY: -80,
          explodeX: 0,
          explodeY: -160 * p,
          color: '#D4AF37',
          render: (cx: number, cy: number) => {
            // Background Wall Frame
            ctx.fillStyle = 'rgba(22, 28, 38, 0.92)';
            ctx.fillRect(cx - 220 * scale, cy - 80 * scale, 440 * scale, 160 * scale);
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - 220 * scale, cy - 80 * scale, 440 * scale, 160 * scale);

            // Vertical Slotted Oak Slats
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
            ctx.lineWidth = 3 * scale;
            for (let x = cx - 200 * scale; x <= cx + 200 * scale; x += 18 * scale) {
              ctx.beginPath();
              ctx.moveTo(x, cy - 70 * scale);
              ctx.lineTo(x, cy + 70 * scale);
              ctx.stroke();
            }
          }
        },
        {
          name: 'Italian Velvet Modular Sofa',
          id: 'sofa',
          baseX: 0,
          baseY: 40,
          explodeX: 0,
          explodeY: 80 * p,
          color: '#F3E5AB',
          render: (cx: number, cy: number) => {
            // Main Couch Body
            ctx.beginPath();
            ctx.roundRect(cx - 160 * scale, cy - 20 * scale, 320 * scale, 65 * scale, 12 * scale);
            ctx.fillStyle = 'rgba(35, 42, 56, 0.95)';
            ctx.fill();
            ctx.strokeStyle = '#F3E5AB';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Cushions detailing
            ctx.strokeStyle = 'rgba(243, 229, 171, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cx - 140 * scale, cy - 10 * scale, 90 * scale, 45 * scale);
            ctx.strokeRect(cx - 45 * scale, cy - 10 * scale, 90 * scale, 45 * scale);
            ctx.strokeRect(cx + 50 * scale, cy - 10 * scale, 90 * scale, 45 * scale);
          }
        },
        {
          name: 'Calacatta Gold Marble Coffee Table',
          id: 'table',
          baseX: -120,
          baseY: 110,
          explodeX: -180 * p,
          explodeY: 110 * p,
          color: '#D4AF37',
          render: (cx: number, cy: number) => {
            // Oval Marble Top
            ctx.beginPath();
            ctx.ellipse(cx, cy, 75 * scale, 28 * scale, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(245, 245, 240, 0.95)';
            ctx.fill();
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Veining details
            ctx.beginPath();
            ctx.moveTo(cx - 40 * scale, cy - 5 * scale);
            ctx.bezierCurveTo(cx - 10 * scale, cy + 10 * scale, cx + 20 * scale, cy - 10 * scale, cx + 50 * scale, cy + 5 * scale);
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Brass Legs
            ctx.beginPath();
            ctx.moveTo(cx - 50 * scale, cy + 10 * scale);
            ctx.lineTo(cx - 50 * scale, cy + 30 * scale);
            ctx.moveTo(cx + 50 * scale, cy + 10 * scale);
            ctx.lineTo(cx + 50 * scale, cy + 30 * scale);
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 3;
            ctx.stroke();
          }
        },
        {
          name: 'Sculptural Brass Pendant Light',
          id: 'chandelier',
          baseX: 0,
          baseY: -160,
          explodeX: 0,
          explodeY: -180 * p,
          color: '#F3E5AB',
          render: (cx: number, cy: number) => {
            // Suspension Wire
            ctx.beginPath();
            ctx.moveTo(cx, cy - 50 * scale);
            ctx.lineTo(cx, cy);
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Pendant Globes
            ctx.shadowColor = '#F3E5AB';
            ctx.shadowBlur = 20;

            ctx.beginPath();
            ctx.arc(cx - 25 * scale, cy, 14 * scale, 0, Math.PI * 2);
            ctx.arc(cx + 25 * scale, cy + 10 * scale, 18 * scale, 0, Math.PI * 2);
            ctx.arc(cx, cy - 15 * scale, 12 * scale, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF8E7';
            ctx.fill();
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.shadowBlur = 0;
          }
        },
        {
          name: 'Minimalist Arc Lamp & Wool Rug',
          id: 'lamp',
          baseX: 160,
          baseY: 90,
          explodeX: 200 * p,
          explodeY: 100 * p,
          color: '#8B5CF6',
          render: (cx: number, cy: number) => {
            // Arc Lamp Spine
            ctx.beginPath();
            ctx.moveTo(cx + 30 * scale, cy + 40 * scale);
            ctx.bezierCurveTo(cx + 60 * scale, cy - 60 * scale, cx - 20 * scale, cy - 80 * scale, cx - 40 * scale, cy - 40 * scale);
            ctx.strokeStyle = '#8B5CF6';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Lamp Shade Glow
            ctx.shadowColor = '#8B5CF6';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(cx - 40 * scale, cy - 40 * scale, 12 * scale, 0, Math.PI * 2);
            ctx.fillStyle = '#F3E5AB';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      ];

      // Draw Telemetry Connecting Lines in Exploded State
      if (p > 0.05) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = `rgba(212, 175, 55, ${Math.min(p * 0.7, 0.5)})`;
        ctx.lineWidth = 1;

        components.forEach(comp => {
          const originX = centerX + comp.baseX * scale;
          const originY = centerY + comp.baseY * scale;
          const posX = originX + comp.explodeX;
          const posY = originY + comp.explodeY;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(posX, posY);
          ctx.stroke();

          ctx.fillStyle = comp.color;
          ctx.beginPath();
          ctx.arc(posX, posY, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // Render each component
      components.forEach(comp => {
        const posX = centerX + comp.baseX * scale + comp.explodeX;
        const posY = centerY + comp.baseY * scale + comp.explodeY;

        ctx.save();
        comp.render(posX, posY);

        // Technical callout label if exploded
        if (p > 0.35 || activePart === comp.id) {
          ctx.fillStyle = 'rgba(18, 22, 31, 0.9)';
          ctx.strokeStyle = comp.color;
          ctx.lineWidth = 1.5;

          const textWidth = ctx.measureText(comp.name).width + 24;
          const labelX = posX + (comp.baseX >= 0 ? 30 : -textWidth - 30);
          const labelY = posY - 20;

          ctx.fillRect(labelX, labelY, textWidth, 26);
          ctx.strokeRect(labelX, labelY, textWidth, 26);

          ctx.fillStyle = '#F3F4F6';
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillText(comp.name, labelX + 12, labelY + 17);

          ctx.beginPath();
          ctx.moveTo(posX, posY);
          ctx.lineTo(labelX + (comp.baseX >= 0 ? 0 : textWidth), labelY + 13);
          ctx.strokeStyle = comp.color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effectiveProgress, autoRotate, activePart]);

  return (
    <div ref={containerRef} className="relative w-full min-h-[140vh] bg-manova-bg text-manova-text overflow-hidden select-none">

      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between items-center py-6 px-4 md:px-8">
        
        {/* Background Grid & Radial Glow */}
        <div className="absolute inset-0 bg-interior-grid bg-radial-luxe pointer-events-none" />

        {/* Top Header HUD */}
        <div className="relative z-10 w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-manova-border/60 pb-4 backdrop-blur-md bg-manova-bg/40 px-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-manova-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-manova-primary"></span>
            </span>
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-manova-primary font-bold">MANOVA SPATIAL DECONSTRUCTION ENGINE</h2>
              <p className="text-[11px] text-manova-muted font-mono">SCROLL DOWN TO DECONSTRUCT ROOM | SCROLL UP TO RE-ASSEMBLE</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                autoRotate
                  ? 'border-manova-primary text-manova-primary bg-manova-primary/10'
                  : 'border-manova-border text-manova-muted hover:text-white'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              {autoRotate ? 'AMBIENT MOTION ON' : 'PAUSED'}
            </button>

            <button
              onClick={() => {
                setManualOverride(!manualOverride);
                if (!manualOverride) setManualSlider(0.75);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                manualOverride
                  ? 'border-manova-gold text-manova-gold bg-manova-gold/10'
                  : 'border-manova-border text-manova-muted hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {manualOverride ? 'MANUAL SLIDER' : 'SCROLL REACTIVE'}
            </button>
          </div>
        </div>

        {/* Central 3D Canvas */}
        <div className="relative z-0 w-full h-[65vh] md:h-[72vh] max-w-6xl my-auto flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing rounded-2xl"
          />

          <div className="absolute top-6 left-4 hidden lg:flex flex-col gap-3">
            <div className="glass-panel p-3.5 rounded-xl border-l-2 border-l-manova-primary max-w-xs">
              <div className="text-[10px] font-mono text-manova-primary">SPATIAL CONCEPT OVERLAY</div>
              <div className="text-sm font-bold text-white mt-0.5">ACOUSTIC & FURNITURE EXPANSION</div>
              <div className="text-xs text-manova-muted font-mono mt-1">Material Palette: Italian Velvet & Marble</div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl border-l-2 border-l-manova-gold max-w-xs">
              <div className="text-[10px] font-mono text-manova-gold">ARCHITECTURAL LIGHTING</div>
              <div className="text-sm font-bold text-white mt-0.5">2700K DALI Dimmable Warm Arrays</div>
            </div>
          </div>

          <div className="absolute bottom-8 right-4 hidden lg:flex flex-col gap-3 text-right">
            <div className="glass-panel p-3.5 rounded-xl border-r-2 border-r-manova-secondary max-w-xs">
              <div className="text-[10px] font-mono text-manova-secondary">DECONSTRUCTION FACTOR</div>
              <div className="text-lg font-mono font-bold text-manova-primary">
                {Math.round(effectiveProgress * 100)}% SPATIAL DISPERSION
              </div>
            </div>
          </div>
        </div>

        {/* Manual Slider */}
        {manualOverride && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-20 w-full max-w-md glass-panel p-3 rounded-xl border border-manova-gold/40 flex items-center gap-4 mb-4"
          >
            <span className="text-xs font-mono text-manova-gold font-bold whitespace-nowrap">DISPERSION FACTOR:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={manualSlider}
              onChange={(e) => setManualSlider(parseFloat(e.target.value))}
              className="w-full accent-manova-gold cursor-pointer"
            />
            <span className="text-xs font-mono text-white w-10 text-right">{Math.round(manualSlider * 100)}%</span>
          </motion.div>
        )}

        {/* Bottom Scroll Indicator */}
        <div className="relative z-10 w-full max-w-7xl flex justify-between items-end px-2">
          <div className="text-xs font-mono text-manova-muted flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-manova-primary animate-bounce" />
            <span>KEEP SCROLLING TO EXPLORE INTERIOR DESIGN PORTFOLIO & ESTIMATES</span>
          </div>

          {onExploreClick && (
            <button
              onClick={onExploreClick}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-manova-primary to-manova-secondary text-manova-bg font-bold text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-manova-primary/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              BOOK SPATIAL CONSULTATION
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
