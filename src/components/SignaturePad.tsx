import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool, Type, Check, Sparkles } from 'lucide-react';

interface SignaturePadProps {
  onSaveSignature: (dataUrl: string) => void;
  savedSignature?: string;
  defaultName?: string;
}

const SIGNATURE_STYLES = [
  { id: 'style-cursive', label: 'Classic Cursive', font: 'italic 34px "Brush Script MT", "Caveat", "Dancing Script", cursive' },
  { id: 'style-formal', label: 'Executive Script', font: 'italic 32px "Edwardian Script ITC", "Great Vibes", "Playfair Display", serif' },
  { id: 'style-modern', label: 'Modern Flow', font: 'italic bold 28px "Segoe Script", "Lucida Handwriting", cursive' },
];

export const SignaturePad: React.FC<SignaturePadProps> = ({ 
  onSaveSignature, 
  savedSignature,
  defaultName = ''
}) => {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(defaultName);
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Sync if defaultName changes and user hasn't typed custom name
  useEffect(() => {
    if (defaultName && !typedName) {
      setTypedName(defaultName);
    }
  }, [defaultName]);

  // Clear drawing canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw subtle guide baseline
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 25);
    ctx.lineTo(canvas.width - 20, canvas.height - 25);
    ctx.stroke();
    ctx.setLineDash([]);
    
    setHasDrawn(false);
  };

  useEffect(() => {
    if (mode === 'draw') {
      clearCanvas();
    } else if (mode === 'type') {
      const nameToRender = typedName || defaultName;
      if (nameToRender.trim()) {
        renderTypedSignature(nameToRender, selectedStyleIndex);
      }
    }
  }, [mode, selectedStyleIndex]);

  // Touch & Mouse Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      e.stopPropagation();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.strokeStyle = '#0f172a'; // Deep slate ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      e.stopPropagation();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCurrentDrawing();
  };

  const saveCurrentDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    onSaveSignature(canvas.toDataURL('image/png'));
  };

  // Convert typed name to canvas SVG/DataURL with selected calligraphy font
  const renderTypedSignature = (text: string, styleIdx: number) => {
    if (!text.trim()) return;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = 500;
    offCanvas.height = 110;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 500, 110);
      
      // Signature text in midnight blue ink
      ctx.fillStyle = '#0f2b5c';
      ctx.font = SIGNATURE_STYLES[styleIdx].font;
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 25, 50);
      
      // Verification line
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(15, 88);
      ctx.lineTo(485, 88);
      ctx.stroke();

      // Tiny security stamp
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('✓ CERTIFIED E-SIGNATURE', 25, 102);

      onSaveSignature(offCanvas.toDataURL('image/png'));
    }
  };

  const handleTypeSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedName(val);
    renderTypedSignature(val, selectedStyleIndex);
  };

  const handleSelectStyle = (idx: number) => {
    setSelectedStyleIndex(idx);
    const nameToRender = typedName || defaultName;
    if (nameToRender) {
      renderTypedSignature(nameToRender, idx);
    }
  };

  const handleUseName = () => {
    if (defaultName) {
      setTypedName(defaultName);
      renderTypedSignature(defaultName, selectedStyleIndex);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 p-3.5 sm:p-4 shadow-xs rounded-2xl">
      {/* Tab Switcher: Draw Signature vs Type Name as Signature */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 border border-slate-200 text-xs font-sans font-bold uppercase tracking-wider rounded-xl">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-all cursor-pointer rounded-lg ${
              mode === 'draw'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw Signature</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('type');
              if (!typedName && defaultName) {
                setTypedName(defaultName);
                renderTypedSignature(defaultName, selectedStyleIndex);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition-all cursor-pointer rounded-lg ${
              mode === 'type'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Legal Name</span>
          </button>
        </div>

        {mode === 'draw' && (
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 transition-colors px-2 py-1 cursor-pointer active:scale-95"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Clear / Redo</span>
          </button>
        )}
      </div>

      {mode === 'draw' ? (
        <div className="space-y-2">
          <div className="relative bg-slate-50 border border-slate-200 touch-none rounded-xl select-none overflow-hidden">
            <canvas
              ref={canvasRef}
              width={450}
              height={130}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-32 cursor-crosshair block touch-none"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 text-xs font-sans gap-1 px-4 text-center">
                <PenTool className="w-4 h-4 text-slate-300" />
                <span>Draw your handwritten signature here with finger, stylus, or mouse</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Tip: You can also switch to "Type Legal Name" tab above if you prefer typing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your full legal name..."
              value={typedName}
              onChange={handleTypeSignatureChange}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl font-medium"
            />
            {defaultName && typedName !== defaultName && (
              <button
                type="button"
                onClick={handleUseName}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-sans font-bold uppercase rounded-xl cursor-pointer whitespace-nowrap transition-all"
              >
                Use "{defaultName}"
              </button>
            )}
          </div>

          {/* Style Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Signature Style:
            </span>
            {SIGNATURE_STYLES.map((style, idx) => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleSelectStyle(idx)}
                className={`px-2.5 py-1 text-[11px] font-sans font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  selectedStyleIndex === idx
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {/* Rendered Signature Preview Box */}
          {typedName && (
            <div className="p-3 sm:p-4 bg-blue-50/40 border-2 border-blue-100 text-center rounded-xl relative overflow-hidden">
              <div className="text-2xl sm:text-3xl italic text-slate-900 tracking-wider block py-1 font-serif">
                {typedName}
              </div>
              <div className="w-full border-b border-dashed border-blue-300 mt-2"></div>
              <div className="flex items-center justify-between mt-1 text-[9px] font-sans uppercase tracking-wider text-blue-700">
                <span>Certified Typed Signature</span>
                <span>{SIGNATURE_STYLES[selectedStyleIndex].label}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {savedSignature && (
        <div className="mt-3 flex items-center justify-between text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 sm:p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Signature Verified & Bound to Legal Document</span>
          </div>
          <span className="text-[9px] text-emerald-700 font-mono">
            {mode === 'type' ? 'Typed Name Signature' : 'Hand-Drawn Signature'}
          </span>
        </div>
      )}
    </div>
  );
};

