import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, Upload, Loader2, RotateCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

const CANVAS_W = 580;
const CANVAS_H = 420;
const GRID_MARGIN = 36;

const FURNITURE_PALETTE = [
  { type: 'sofa',          label: 'Sofa',          dw: 7,   dh: 3,   color: '#c8b49a' },
  { type: 'armchair',      label: 'Armchair',      dw: 3,   dh: 3,   color: '#c8b49a' },
  { type: 'coffee_table',  label: 'Coffee Table',  dw: 4,   dh: 2,   color: '#8ab88a' },
  { type: 'dining_table',  label: 'Dining Table',  dw: 5,   dh: 3,   color: '#8ab88a' },
  { type: 'queen_bed',     label: 'Queen Bed',     dw: 5,   dh: 6.7, color: '#a898d8' },
  { type: 'king_bed',      label: 'King Bed',      dw: 6.3, dh: 6.7, color: '#a898d8' },
  { type: 'desk',          label: 'Desk',          dw: 5,   dh: 2.5, color: '#90b8c8' },
  { type: 'tv_stand',      label: 'TV Stand',      dw: 5,   dh: 1.5, color: '#888' },
  { type: 'bookshelf',     label: 'Bookshelf',     dw: 3,   dh: 1,   color: '#b8986a' },
  { type: 'door',          label: 'Door',          dw: 3,   dh: 0.5, color: '#d4a84b' },
  { type: 'window',        label: 'Window',        dw: 4,   dh: 0.5, color: '#87CEEB' },
];

const RUG_DIM = {
  '2x3': [2, 3], '3x5': [3, 5], '4x6': [4, 6], '5x7': [5, 7],
  '6x9': [6, 9], '8x10': [8, 10], '9x12': [9, 12], 'Custom': [5, 7],
};

let idCounter = 1;
const uid = () => `item-${idCounter++}`;

export default function FloorPlanBuilder({ rugSize, onChange }) {
  const [roomW, setRoomW] = useState(16);
  const [roomH, setRoomH] = useState(14);
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roomPhoto, setRoomPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef(null);
  const dragRef = useRef(null);

  const rw = Math.max(4, Math.min(60, roomW));
  const rh = Math.max(4, Math.min(60, roomH));
  const canvasInnerW = CANVAS_W - GRID_MARGIN * 2;
  const canvasInnerH = CANVAS_H - GRID_MARGIN * 2;
  const scale = Math.min(canvasInnerW / rw, canvasInnerH / rh);
  const ox = GRID_MARGIN + (canvasInnerW - rw * scale) / 2;
  const oy = GRID_MARGIN + (canvasInnerH - rh * scale) / 2;

  const toFt = (px) => px / scale;

  // Sync rug dimensions when rugSize changes
  useEffect(() => {
    const [rw_, rh_] = RUG_DIM[rugSize] || [5, 7];
    setItems(prev => {
      const hasRug = prev.find(i => i.isRug);
      if (!hasRug) {
        return [
          {
            id: 'rug',
            isRug: true,
            label: rugSize ? `${rugSize} Rug` : 'Your Rug',
            x: Math.max(0, (roomW - rw_) / 2),
            y: Math.max(0, (roomH - rh_) / 2),
            w: rw_, h: rh_,
          },
          ...prev,
        ];
      }
      return prev.map(i => i.isRug ? { ...i, label: rugSize ? `${rugSize} Rug` : 'Your Rug', w: rw_, h: rh_ } : i);
    });
  }, [rugSize]);

  const addFurniture = (f) => {
    setItems(prev => [...prev, { id: uid(), isRug: false, label: f.label, type: f.type, x: 1, y: 1, w: f.dw, h: f.dh, color: f.color }]);
  };

  const rotate = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, w: i.h, h: i.w } : i));
  };

  const deleteItem = (id) => {
    if (id === 'rug') return;
    setItems(prev => prev.filter(i => i.id !== id));
    setSelected(null);
  };

  const onMouseDownItem = (e, id, mode = 'move') => {
    e.preventDefault();
    e.stopPropagation();
    setSelected(id);
    const rect = containerRef.current.getBoundingClientRect();
    const item = items.find(i => i.id === id);
    dragRef.current = {
      id, mode,
      mx0: e.clientX - rect.left,
      my0: e.clientY - rect.top,
      ix0: item.x, iy0: item.y,
      iw0: item.w, ih0: item.h,
    };
  };

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = toFt(mx - dragRef.current.mx0);
    const dy = toFt(my - dragRef.current.my0);
    const { id, mode, ix0, iy0, iw0, ih0 } = dragRef.current;

    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (mode === 'move') {
        return {
          ...item,
          x: Math.max(0, Math.min(rw - item.w, ix0 + dx)),
          y: Math.max(0, Math.min(rh - item.h, iy0 + dy)),
        };
      } else { // resize
        return {
          ...item,
          w: Math.max(1, iw0 + dx),
          h: Math.max(1, ih0 + dy),
        };
      }
    }));
  }, [rw, rh, scale]);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setRoomPhoto(file_url);
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  // Notify parent
  useEffect(() => {
    if (onChange) onChange({ roomW: rw, roomH: rh, items, roomPhoto });
  }, [rw, rh, items, roomPhoto]);

  const selItem = items.find(i => i.id === selected);

  return (
    <div className="space-y-4">
      {/* Room Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-bold">Room Width (ft)</Label>
          <Input type="number" min={6} max={60} value={roomW}
            onChange={e => setRoomW(Number(e.target.value))} className="mt-1" />
        </div>
        <div>
          <Label className="text-sm font-bold">Room Length (ft)</Label>
          <Input type="number" min={6} max={60} value={roomH}
            onChange={e => setRoomH(Number(e.target.value))} className="mt-1" />
        </div>
      </div>

      {/* Furniture Palette */}
      <div>
        <Label className="text-sm font-bold">Furniture & Elements</Label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {FURNITURE_PALETTE.map(f => (
            <button key={f.type} type="button" onClick={() => addFurniture(f)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border transition-all hover:opacity-80"
              style={{ borderColor: f.color, backgroundColor: f.color + '40', color: 'var(--brand-dark)' }}>
              + {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden select-none"
        style={{ width: CANVAS_W, maxWidth: '100%', height: CANVAS_H, backgroundColor: '#f9fafb', border: '2px solid #e5e7eb', cursor: 'default' }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Room photo background */}
        {roomPhoto && (
          <div style={{
            position: 'absolute',
            left: ox, top: oy,
            width: rw * scale, height: rh * scale,
            backgroundImage: `url(${roomPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.25,
            pointerEvents: 'none',
          }} />
        )}

        {/* SVG grid + room outline + labels */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Grid lines */}
          {Array.from({ length: Math.ceil(rw) + 1 }, (_, i) => (
            <line key={`v${i}`} x1={ox + i * scale} y1={oy} x2={ox + i * scale} y2={oy + rh * scale} stroke="#e5e7eb" strokeWidth="0.8" />
          ))}
          {Array.from({ length: Math.ceil(rh) + 1 }, (_, i) => (
            <line key={`h${i}`} x1={ox} y1={oy + i * scale} x2={ox + rw * scale} y2={oy + i * scale} stroke="#e5e7eb" strokeWidth="0.8" />
          ))}
          {/* Room border */}
          <rect x={ox} y={oy} width={rw * scale} height={rh * scale} fill="none" stroke="var(--brand-dark)" strokeWidth="2.5" rx="0" />
          {/* Dimension labels */}
          <text x={ox + rw * scale / 2} y={oy - 10} textAnchor="middle" fontSize="12" fill="#555" fontWeight="600">{rw} ft</text>
          <text x={ox - 12} y={oy + rh * scale / 2} textAnchor="middle" fontSize="12" fill="#555" fontWeight="600"
            transform={`rotate(-90, ${ox - 12}, ${oy + rh * scale / 2})`}>{rh} ft</text>
          {/* Scale bar */}
          <line x1={ox} y1={oy + rh * scale + 16} x2={ox + scale} y2={oy + rh * scale + 16} stroke="#aaa" strokeWidth="1.5" />
          <line x1={ox} y1={oy + rh * scale + 12} x2={ox} y2={oy + rh * scale + 20} stroke="#aaa" strokeWidth="1.5" />
          <line x1={ox + scale} y1={oy + rh * scale + 12} x2={ox + scale} y2={oy + rh * scale + 20} stroke="#aaa" strokeWidth="1.5" />
          <text x={ox + scale / 2} y={oy + rh * scale + 28} textAnchor="middle" fontSize="10" fill="#999">1 ft</text>
        </svg>

        {/* Items */}
        {items.map(item => {
          const isSel = selected === item.id;
          const px = ox + item.x * scale;
          const py = oy + item.y * scale;
          const pw = item.w * scale;
          const ph = item.h * scale;
          const fontSize = Math.max(8, Math.min(11, pw / (item.label.length * 0.65)));
          return (
            <div key={item.id} style={{ position: 'absolute', left: px, top: py, width: pw, height: ph, zIndex: item.isRug ? 1 : isSel ? 20 : 5 }}>
              {/* Item body */}
              <div
                onMouseDown={(e) => onMouseDownItem(e, item.id, 'move')}
                style={{
                  width: '100%', height: '100%',
                  backgroundColor: item.isRug ? 'rgba(64,117,255,0.18)' : (item.color || '#ccc') + 'aa',
                  border: isSel
                    ? '2px solid var(--brand-blue)'
                    : item.isRug
                      ? '2px dashed var(--brand-blue)'
                      : `1.5px solid ${item.color || '#aaa'}`,
                  borderRadius: item.isRug ? 4 : 3,
                  cursor: 'grab',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}
              >
                <span style={{ fontSize, fontWeight: 700, color: item.isRug ? 'var(--brand-blue)' : '#333', textAlign: 'center', padding: 2, lineHeight: 1.1, pointerEvents: 'none' }}>
                  {item.label}
                </span>
              </div>
              {/* Resize handle (bottom-right) */}
              {isSel && (
                <div
                  onMouseDown={(e) => onMouseDownItem(e, item.id, 'resize')}
                  style={{
                    position: 'absolute', right: -5, bottom: -5,
                    width: 12, height: 12,
                    backgroundColor: 'var(--brand-blue)',
                    borderRadius: 2, cursor: 'se-resize', zIndex: 30,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 border-dashed hover:bg-gray-50 transition-all"
            style={{ borderColor: '#d1d5db', color: '#555' }}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {roomPhoto ? 'Replace Room Photo' : 'Add Room Photo'}
          </div>
        </label>

        {selItem && (
          <>
            <button type="button" onClick={() => rotate(selItem.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border-2 hover:bg-gray-50 transition-all"
              style={{ borderColor: '#d1d5db', color: '#555' }}>
              <RotateCw className="w-3.5 h-3.5" /> Rotate
            </button>
            {!selItem.isRug && (
              <button type="button" onClick={() => deleteItem(selItem.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                style={{ backgroundColor: 'var(--brand-red)', color: 'white', border: 'none' }}>
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </>
        )}

        <span className="ml-auto text-xs text-gray-400">Drag to move · Corner handle to resize · Click to select</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-4 rounded" style={{ backgroundColor: 'rgba(64,117,255,0.18)', border: '2px dashed var(--brand-blue)' }} />
          Your Rug
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-4 rounded" style={{ backgroundColor: '#c8b49a88', border: '1.5px solid #c8b49a' }} />
          Furniture
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-4 rounded" style={{ backgroundColor: '#87CEEB88', border: '1.5px solid #87CEEB' }} />
          Structural
        </div>
      </div>
    </div>
  );
}