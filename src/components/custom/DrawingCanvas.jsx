import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Pencil, Eraser, Type, Square, Circle, Undo, Trash2, Save } from 'lucide-react';

export default function DrawingCanvas({ onSaveDrawing }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // pen, eraser, text, rectangle, circle
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(15);
  const [history, setHistory] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setHistory(prev => [...prev.slice(-19), dataUrl]);
    }
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    if (tool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
      return;
    }

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const addText = () => {
    if (!textInput.trim()) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.font = `bold ${brushSize * 5}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    setTextInput('');
    setShowTextInput(false);
    saveToHistory();
  };

  const drawShape = (e, shapeType) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    const ctx = canvas.getContext('2d');

    const size = brushSize * 8;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (shapeType === 'rectangle') {
      ctx.strokeRect(x - size/2, y - size/2, size, size);
    } else if (shapeType === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, size/2, 0, 2 * Math.PI);
      ctx.stroke();
    }

    saveToHistory();
  };

  const undo = () => {
    if (history.length <= 1) return;
    
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = newHistory[newHistory.length - 1];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'drawing.png', { type: 'image/png' });
      onSaveDrawing(file);
    });
  };

  const handleCanvasClick = (e) => {
    if (tool === 'rectangle') {
      drawShape(e, 'rectangle');
    } else if (tool === 'circle') {
      drawShape(e, 'circle');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Tools */}
            <div>
              <Label className="mb-2 block">Drawing Tools</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={tool === 'pen' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('pen')}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Pen
                </Button>
                <Button
                  variant={tool === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('eraser')}
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Eraser
                </Button>
                <Button
                  variant={tool === 'text' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('text')}
                >
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </Button>
                <Button
                  variant={tool === 'rectangle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('rectangle')}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Rectangle
                </Button>
                <Button
                  variant={tool === 'circle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('circle')}
                >
                  <Circle className="w-4 h-4 mr-2" />
                  Circle
                </Button>
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <Label className="mb-2 block">Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <div className="flex gap-2">
                  {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <Label className="mb-2 block">Thickness: {brushSize}px (Stencil-Friendly)</Label>
              <Slider
                value={[brushSize]}
                onValueChange={(val) => setBrushSize(val[0])}
                min={8}
                max={40}
                step={2}
              />
              <p className="text-xs text-gray-500 mt-1">Thicker lines work better for stencils</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={history.length <= 1}>
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button size="sm" onClick={saveDrawing} className="ml-auto bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Drawing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <div className="relative bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onClick={handleCanvasClick}
        />

        {/* Text Input Overlay */}
        {showTextInput && (
          <div 
            className="absolute bg-white p-3 rounded-lg shadow-lg border-2 border-blue-500"
            style={{ left: textPosition.x, top: textPosition.y }}
          >
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text..."
              className="mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addText}>Add</Button>
              <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 text-center">
        Draw your design using the tools above. Works great with touch screens and Apple Pencil!
      </p>
    </div>
  );
}