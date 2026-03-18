import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Download, RotateCcw, Pencil, Eraser, MessageSquare, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIPreviewPanel({ formData, onMarkupSave }) {
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [drawMode, setDrawMode] = useState(false);
  const [eraserMode, setEraserMode] = useState(false);
  const [markupNote, setMarkupNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (previewUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctxRef.current = ctx;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = previewUrl;
    }
  }, [previewUrl]);

  const buildPrompt = () => {
    const { preferredSize, preferredColors, numColors, description, budgetRange, inspirationImages } = formData;
    return `A professional flat-lay product photo of a custom hand-painted area rug. 
    Size: ${preferredSize || 'medium area rug'}. 
    Color palette: ${preferredColors || 'vibrant mixed colors'}. 
    Complexity: ${numColors || '3-4'} colors. 
    Design concept: ${description || 'abstract artistic pattern'}. 
    Budget tier: ${budgetRange || 'mid-range'}. 
    Style: artistic, bold, one-of-a-kind painted rug on a clean white studio floor. 
    Photo quality, top-down view, high detail texture visible, gallery presentation.`;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const prompt = buildPrompt();
      const existingUrls = formData.inspirationImages?.length > 0 ? formData.inspirationImages.slice(0, 2) : undefined;
      const result = await base44.integrations.Core.GenerateImage({
        prompt,
        existing_image_urls: existingUrls
      });
      setPreviewUrl(result.url);
      onMarkupSave?.(result.url, notes);
    } catch (err) {
      alert('Failed to generate preview. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e) => {
    if (!drawMode && !eraserMode) return;
    const { x, y } = getPos(e);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (eraserMode) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#f04624';
      ctx.lineWidth = 3;
    }
    ctx.lineCap = 'round';
    setDrawing(true);
  };

  const draw = (e) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    const ctx = ctxRef.current;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const handleAddNote = () => {
    if (markupNote.trim()) {
      const newNotes = [...notes, markupNote.trim()];
      setNotes(newNotes);
      setMarkupNote('');
      onMarkupSave?.(previewUrl, newNotes);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'rugly-commission-preview.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <div className="text-center">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="px-8 py-6 text-lg font-bold rounded-2xl"
          style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-red))', color: 'white', border: 'none' }}
        >
          {generating ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Your Rug Preview...</>
          ) : (
            <><Wand2 className="w-5 h-5 mr-2" /> {previewUrl ? 'Regenerate Preview' : 'Generate AI Preview'}</>
          )}
        </Button>
        <p className="text-xs text-gray-500 mt-2">Uses your size, colors & description to generate a sample</p>
      </div>

      {previewUrl && (
        <div className="space-y-3">
          {/* Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-700">Markup Tools:</span>
            <button
              type="button"
              onClick={() => { setDrawMode(!drawMode); setEraserMode(false); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${drawMode ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600'}`}
            >
              <Pencil className="w-4 h-4" /> Draw
            </button>
            <button
              type="button"
              onClick={() => { setEraserMode(!eraserMode); setDrawMode(false); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${eraserMode ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}
            >
              <Eraser className="w-4 h-4" /> Erase
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition-all"
            >
              <Download className="w-4 h-4" /> Save Image
            </button>
          </div>

          {/* Canvas */}
          <div className="relative rounded-2xl overflow-hidden border-4 border-dashed" style={{ borderColor: 'var(--brand-blue)' }}>
            {(drawMode || eraserMode) && (
              <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {drawMode ? '✏️ Drawing mode — click and drag' : '🧹 Erase mode'}
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full"
              style={{ cursor: drawMode ? 'crosshair' : eraserMode ? 'cell' : 'default', touchAction: 'none' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>

          {/* Designer Notes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-gray-700">Design Notes</span>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={markupNote}
                onChange={(e) => setMarkupNote(e.target.value)}
                placeholder="e.g. 'Make the center medallion larger' or 'Use darker navy here'"
                className="text-sm h-16 resize-none"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
              />
              <Button type="button" onClick={handleAddNote} size="icon" className="h-16 w-12 shrink-0">
                <Check className="w-4 h-4" />
              </Button>
            </div>
            {notes.length > 0 && (
              <ul className="space-y-1">
                {notes.map((n, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <span className="text-yellow-600 font-bold">#{i + 1}</span>
                    <span className="text-gray-700">{n}</span>
                    <button type="button" className="ml-auto text-gray-400 hover:text-red-500 text-xs" onClick={() => {
                      const updated = notes.filter((_, idx) => idx !== i);
                      setNotes(updated);
                      onMarkupSave?.(previewUrl, updated);
                    }}>✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}