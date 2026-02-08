import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Eraser, Type, Image as ImageIcon, Undo, Redo, Trash2, Download, Move, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RugVisualizerPro({ rugImage, rugName, onClose }) {
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(15);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [selectedFont, setSelectedFont] = useState('Allerta Stencil');
  const [fontSize, setFontSize] = useState(40);
  
  // Image layer management
  const [imageLayer, setImageLayer] = useState(null);
  const [draggedImage, setDraggedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const PAINT_COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Yellow', hex: '#FCD34D' },
    { name: 'Green', hex: '#10B981' },
  ];

  const STENCIL_FONTS = [
    'Allerta Stencil',
    'Big Shoulders Stencil Display',
    'Saira Stencil One',
    'Black Ops One',
    'Wallpoet'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && rugImage) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = rugImage;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveToHistory();
      };
    }
  }, [rugImage]);

  // Redraw everything
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Draw base rug image
    if (rugImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = rugImage;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Draw image layer if exists
        if (imageLayer) {
          ctx.drawImage(
            imageLayer.img,
            imageLayer.x,
            imageLayer.y,
            imageLayer.width,
            imageLayer.height
          );
        }
      };
    }
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      const newHistory = history.slice(0, historyStep + 1);
      setHistory([...newHistory, dataUrl]);
      setHistoryStep(newHistory.length);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const maxWidth = canvas.width * 0.5;
        const maxHeight = canvas.height * 0.5;
        
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        setImageLayer({
          img,
          x: (canvas.width - width) / 2,
          y: (canvas.height - height) / 2,
          width,
          height,
          originalWidth: width,
          originalHeight: height
        });

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        saveToHistory();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * scaleX;
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * scaleY;

    if (tool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
      return;
    }

    if (tool === 'move' && imageLayer) {
      // Check if clicking on image
      if (x >= imageLayer.x && x <= imageLayer.x + imageLayer.width &&
          y >= imageLayer.y && y <= imageLayer.y + imageLayer.height) {
        setIsDragging(true);
        setDragStart({ x: x - imageLayer.x, y: y - imageLayer.y });
        return;
      }
    }

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * scaleX;
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * scaleY;

    if (isDragging && imageLayer) {
      const newLayer = {
        ...imageLayer,
        x: x - dragStart.x,
        y: y - dragStart.y
      };
      setImageLayer(newLayer);
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw rug
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = rugImage;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw image layer
      ctx.drawImage(newLayer.img, newLayer.x, newLayer.y, newLayer.width, newLayer.height);
      return;
    }

    if (!isDrawing) return;
    
    const ctx = canvas.getContext('2d');

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
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
      saveToHistory();
    }
    if (isDragging) {
      setIsDragging(false);
      saveToHistory();
    }
  };

  const addText = () => {
    if (!textInput.trim()) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.font = `bold ${fontSize}px "${selectedFont}"`;
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    setTextInput('');
    setShowTextInput(false);
    saveToHistory();
  };

  const resizeImage = (delta) => {
    if (!imageLayer) return;
    
    const scaleFactor = 1 + (delta * 0.1);
    const newWidth = imageLayer.width * scaleFactor;
    const newHeight = imageLayer.height * scaleFactor;
    
    setImageLayer({
      ...imageLayer,
      width: newWidth,
      height: newHeight
    });

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Redraw rug
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rugImage;
    ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw resized image
    ctx.drawImage(imageLayer.img, imageLayer.x, imageLayer.y, newWidth, newHeight);
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

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${rugName}-custom-design.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            Visualize Your Design - {rugName}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Tools</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={tool === 'pen' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool('pen')}
                    >
                      <Pencil size={16} />
                      Draw
                    </Button>
                    <Button
                      variant={tool === 'eraser' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool('eraser')}
                    >
                      <Eraser size={16} />
                      Erase
                    </Button>
                    <Button
                      variant={tool === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool('text')}
                    >
                      <Type size={16} />
                      Text
                    </Button>
                    <Button
                      variant={tool === 'move' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool('move')}
                      disabled={!imageLayer}
                    >
                      <Move size={16} />
                      Move Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon size={16} />
                      Add Image
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Paint Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {PAINT_COLORS.map((colorObj) => (
                        <button
                          key={colorObj.hex}
                          onClick={() => setColor(colorObj.hex)}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            color === colorObj.hex
                              ? 'border-blue-600 scale-105'
                              : 'border-gray-200'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full shadow border-2 border-white"
                            style={{ backgroundColor: colorObj.hex }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Brush Size: {brushSize}px</Label>
                    <Slider
                      value={[brushSize]}
                      onValueChange={(val) => setBrushSize(val[0])}
                      min={2}
                      max={60}
                      step={2}
                    />
                  </div>
                </div>

                {tool === 'text' && (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                    <div>
                      <Label className="mb-2 block text-sm">Font</Label>
                      <Select value={selectedFont} onValueChange={setSelectedFont}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STENCIL_FONTS.map(font => (
                            <SelectItem key={font} value={font}>
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
                  </div>
                )}

                {imageLayer && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Label className="mb-2 block">Image Controls</Label>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => resizeImage(-1)}>Shrink</Button>
                      <Button size="sm" onClick={() => resizeImage(1)}>Enlarge</Button>
                      <Button size="sm" variant="destructive" onClick={() => setImageLayer(null)}>Remove</Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={undo} disabled={historyStep <= 0}>
                    <Undo size={16} />
                    Undo
                  </Button>
                  <Button variant="outline" size="sm" onClick={redo} disabled={historyStep >= history.length - 1}>
                    <Redo size={16} />
                    Redo
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadImage}>
                    <Download size={16} />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="relative bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={1000}
              height={750}
              className="w-full touch-none cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {showTextInput && (
              <div 
                className="absolute bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-500 z-50"
                style={{ 
                  left: Math.min(textPosition.x, 600), 
                  top: Math.min(textPosition.y, 400),
                  minWidth: '320px'
                }}
              >
                <Label className="mb-2 block font-semibold">Enter Text</Label>
                <Textarea
                  ref={textareaRef}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your text..."
                  className="mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addText}>Add Text</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}