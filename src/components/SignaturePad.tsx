import React, { useRef, useState, useEffect } from 'react';
import { Eraser, PenTool, Type, Check } from 'lucide-react';

interface SignaturePadProps {
  onSaveSignature: (dataUrl: string) => void;
  savedSignature?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSaveSignature, savedSignature }) => {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Clear drawing canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw guide baseline
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
    clearCanvas();
  }, [mode]);

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

  // Convert typed name to canvas SVG/DataURL
  const handleTypeSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedName(val);
    
    if (!val.trim()) return;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = 450;
    offCanvas.height = 100;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 450, 100);
      ctx.fillStyle = '#0f172a';
      ctx.font = `italic 36px cursive`;
      ctx.fillText(val, 20, 60);
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(10, 80);
      ctx.lineTo(440, 80);
      ctx.stroke();

      onSaveSignature(offCanvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-3.5 sm:p-4 shadow-xs rounded-2xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200 text-xs font-sans font-bold uppercase tracking-wider rounded-xl">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1 px-3 py-1.5 transition-all cursor-pointer rounded-lg ${
              mode === 'draw'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Draw
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`flex items-center gap-1 px-3 py-1.5 transition-all cursor-pointer rounded-lg ${
              mode === 'type'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Type
          </button>
        </div>

        {mode === 'draw' && (
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1 text-[11px] font-sans font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 transition-colors px-2 py-1 cursor-pointer active:scale-95"
          >
            <Eraser className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {mode === 'draw' ? (
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-serif italic">
              Draw electronic signature here using finger or mouse
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Type your full legal name..."
            value={typedName}
            onChange={handleTypeSignatureChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-600 rounded-xl font-serif italic"
          />
          {typedName && (
            <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 text-center rounded-xl">
              <span className="text-2xl sm:text-3xl italic font-serif text-slate-900 tracking-wider block">
                {typedName}
              </span>
              <div className="w-full border-b border-dashed border-slate-300 mt-2"></div>
              <p className="text-[10px] font-sans uppercase tracking-[0.15em] text-slate-400 mt-1">Validated Electronic Signature</p>
            </div>
          )}
        </div>
      )}

      {savedSignature && (
        <div className="mt-3 flex items-center gap-2 text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          Signature captured & bound to document
        </div>
      )}
    </div>
  );
};
