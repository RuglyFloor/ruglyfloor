import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Eraser, Type, Square, Circle, Undo, Redo, Trash2, Save, AlertCircle, Plus, Eye, EyeOff, Layers } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DrawingCanvas({ onSaveDrawing, onColorCountChange, availableColors = [], size = 'small' }) {
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(availableColors[0]?.hex || '#000000');
  const [brushSize, setBrushSize] = useState(15);
  const [opacity, setOpacity] = useState(1);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [layers, setLayers] = useState([{ id: 1, name: 'Layer 1', visible: true, data: null }]);
  const [activeLayer, setActiveLayer] = useState(1);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [selectedFont, setSelectedFont] = useState('Allerta Stencil');
  const [fontSize, setFontSize] = useState(40);
  const [textAlign, setTextAlign] = useState('left');
  const [maxWidth, setMaxWidth] = useState(600);

  const STENCIL_FONTS = [
    'Allerta Stencil',
    'Big Shoulders Stencil Display',
    'Saira Stencil One',
    'Black Ops One',
    'Wallpoet',
    'Kenia',
    'Plaster',
    'Emblema One',
    'Protest Guerrilla'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [layers, activeLayer]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      const newHistory = history.slice(0, historyStep + 1);
      setHistory([...newHistory, dataUrl]);
      setHistoryStep(newHistory.length);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    layers.forEach(layer => {
      if (layer.visible && layer.data) {
        const img = new Image();
        img.src = layer.data;
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
      }
    });
  };

  const saveLayerData = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setLayers(prev => prev.map(layer => 
        layer.id === activeLayer ? { ...layer, data: dataUrl } : layer
      ));
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
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveLayerData();
      saveToHistory();
    }
  };

  const addText = () => {
    if (!textInput.trim()) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.font = `bold ${fontSize}px "${selectedFont}"`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    
    // Split text into lines and handle wrapping
    const lines = textInput.split('\n');
    const lineHeight = fontSize * 1.2;
    let currentY = textPosition.y;
    
    lines.forEach(line => {
      if (maxWidth && line.length > 0) {
        // Word wrap
        const words = line.split(' ');
        let currentLine = '';
        
        words.forEach((word, i) => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && currentLine) {
            ctx.fillText(currentLine, textPosition.x, currentY);
            currentY += lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
          
          if (i === words.length - 1) {
            ctx.fillText(currentLine, textPosition.x, currentY);
            currentY += lineHeight;
          }
        });
      } else {
        ctx.fillText(line, textPosition.x, currentY);
        currentY += lineHeight;
      }
    });
    
    setTextInput('');
    setShowTextInput(false);
    saveLayerData();
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

    saveLayerData();
    saveToHistory();
  };

  const undo = () => {
    if (historyStep <= 0) return;
    
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = history[newStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = history[newStep];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const addLayer = () => {
    const newId = Math.max(...layers.map(l => l.id)) + 1;
    setLayers([...layers, { id: newId, name: `Layer ${newId}`, visible: true, data: null }]);
    setActiveLayer(newId);
  };

  const deleteLayer = (id) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter(l => l.id !== id));
    if (activeLayer === id) {
      setActiveLayer(layers[0].id);
    }
  };

  const toggleLayerVisibility = (id) => {
    setLayers(layers.map(l => 
      l.id === id ? { ...l, visible: !l.visible } : l
    ));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveLayerData();
    saveToHistory();
  };

  const saveDrawing = async () => {
    const canvas = canvasRef.current;
    
    // Download to user's machine
    const link = document.createElement('a');
    link.download = 'rugly-custom-drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Also save for preview
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
      {/* Pro Tip */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white text-center">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        <span className="font-bold">PRO TIP:</span> Use your iPad or tablet for the best drawing experience!
      </div>

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

            {/* Color Selection - From Step 2 */}
            <div>
              <Label className="mb-2 block">Selected Colors</Label>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map((colorObj) => (
                  <button
                    key={colorObj.hex}
                    onClick={() => setColor(colorObj.hex)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                      color === colorObj.hex
                        ? 'border-blue-600 bg-blue-50 scale-105 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full shadow border-2 border-white"
                      style={{ backgroundColor: colorObj.hex }}
                    />
                    <span className="text-xs">{colorObj.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <Label className="mb-2 block">Thickness: {brushSize}px</Label>
              <Slider
                value={[brushSize]}
                onValueChange={(val) => setBrushSize(val[0])}
                min={2}
                max={60}
                step={2}
              />
              <p className="text-xs text-gray-500 mt-1">Adjust stroke width</p>
            </div>

            {/* Opacity */}
            <div>
              <Label className="mb-2 block">Opacity: {Math.round(opacity * 100)}%</Label>
              <Slider
                value={[opacity * 100]}
                onValueChange={(val) => setOpacity(val[0] / 100)}
                min={10}
                max={100}
                step={5}
              />
              <p className="text-xs text-gray-500 mt-1">Control transparency</p>
            </div>

            {/* Text Settings (for text tool) */}
            {tool === 'text' && (
              <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <Label className="mb-2 block text-sm">Font</Label>
                  <Select value={selectedFont} onValueChange={setSelectedFont}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STENCIL_FONTS.map(font => (
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="mb-2 block text-sm">Font Size: {fontSize}px</Label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(val) => setFontSize(val[0])}
                    min={20}
                    max={120}
                    step={5}
                  />
                </div>

                <div>
                  <Label className="mb-2 block text-sm">Text Alignment</Label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map(align => (
                      <Button
                        key={align}
                        variant={textAlign === align ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTextAlign(align)}
                        className="flex-1 capitalize"
                      >
                        {align}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block text-sm">Max Width: {maxWidth}px</Label>
                  <Slider
                    value={[maxWidth]}
                    onValueChange={(val) => setMaxWidth(val[0])}
                    min={200}
                    max={800}
                    step={50}
                  />
                  <p className="text-xs text-gray-600 mt-1">Text will wrap at this width</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyStep <= 0}>
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyStep >= history.length - 1}>
                <Redo className="w-4 h-4 mr-2" />
                Redo
              </Button>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button size="sm" onClick={saveDrawing} className="ml-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold">
                <Save className="w-4 h-4 mr-2" />
                Use This Design
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layers Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Layers
              </Label>
              <Button size="sm" variant="outline" onClick={addLayer}>
                <Plus className="w-4 h-4 mr-1" />
                Add Layer
              </Button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {layers.map(layer => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-2 p-2 rounded border-2 transition-all ${
                    activeLayer === layer.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleLayerVisibility(layer.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button
                    onClick={() => setActiveLayer(layer.id)}
                    className="flex-1 text-left text-sm font-medium"
                  >
                    {layer.name}
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteLayer(layer.id)}
                    disabled={layers.length <= 1}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <div className="relative bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden" style={{ 
        backgroundImage: 'repeating-linear-gradient(45deg, #f9fafb 0px, #f9fafb 10px, #e5e7eb 10px, #e5e7eb 20px)',
        backgroundSize: '20px 20px'
      }}>
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

        {/* Text Input Overlay - Enhanced for Paragraphs */}
        {showTextInput && (
          <div 
            className="absolute bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-500 z-50"
            style={{ 
              left: Math.min(textPosition.x, window.innerWidth - 350), 
              top: Math.min(textPosition.y, window.innerHeight - 250),
              minWidth: '320px',
              maxWidth: '90vw'
            }}
          >
            <Label className="mb-2 block font-semibold">Enter Your Text</Label>
            <Textarea
              ref={textareaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your text here... Press Enter for new lines."
              className="mb-3 min-h-[120px] text-base"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  addText();
                }
              }}
            />
            <div className="text-xs text-gray-500 mb-3">
              Tip: Press Ctrl+Enter to add text quickly
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addText} className="flex-1">Add Text</Button>
              <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 text-center border-2 border-green-300">
        <p className="text-lg text-gray-800 font-bold mb-2">
          ✅ When you're done, click "Use This Design" above
        </p>
        <p className="text-sm text-gray-600">
          Your drawing will be saved and you can preview it on your rug
        </p>
      </div>
    </div>
  );
}