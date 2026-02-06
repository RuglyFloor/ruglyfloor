import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Eraser, Type, Square, Circle, Undo, Redo, Trash2, Save, AlertCircle, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

export default function PaintApp({ onSaveImage, availableColors = [], initialImage = null, rugSize = '4x6' }) {
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(availableColors[0]?.hex || '#000000');
  const [brushSize, setBrushSize] = useState(15);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [selectedFont, setSelectedFont] = useState('Allerta Stencil');
  const [fontSize, setFontSize] = useState(40);
  const [textAlign, setTextAlign] = useState('left');
  const [maxWidth, setMaxWidth] = useState(600);
  const [uploading, setUploading] = useState(false);
  const [savedImageUrl, setSavedImageUrl] = useState(null);

  // Calculate canvas dimensions based on rug size
  const getCanvasDimensions = () => {
    const [width, height] = rugSize.split('x').map(Number);
    const maxWidth = 800;
    const aspectRatio = height / width;
    const canvasWidth = maxWidth;
    const canvasHeight = maxWidth * aspectRatio;
    return { width: canvasWidth, height: canvasHeight };
  };

  const canvasDims = getCanvasDimensions();

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
      
      if (initialImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = initialImage;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveToHistory();
        };
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
    }
  }, [initialImage]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      const newHistory = history.slice(0, historyStep + 1);
      setHistory([...newHistory, dataUrl]);
      setHistoryStep(newHistory.length);
    }
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

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * scaleX;
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * scaleY;
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
  };

  const addText = () => {
    if (!textInput.trim()) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.font = `bold ${fontSize}px "${selectedFont}"`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    
    const lines = textInput.split('\n');
    const lineHeight = fontSize * 1.2;
    let currentY = textPosition.y;
    
    lines.forEach(line => {
      if (maxWidth && line.length > 0) {
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
    saveToHistory();
  };

  const drawShape = (e, shapeType) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = ((e.clientX || e.touches?.[0]?.clientX) - rect.left) * scaleX;
    const y = ((e.clientY || e.touches?.[0]?.clientY) - rect.top) * scaleY;
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const saveDrawingToCloud = async () => {
    const canvas = canvasRef.current;
    setUploading(true);
    
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'design-painting.png', { type: 'image/png' });
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSavedImageUrl(file_url);
      
      if (onSaveImage) {
        onSaveImage(file_url);
      }
      
      alert('✅ Your design has been saved! You can continue editing or proceed to the next step.');
    } catch (error) {
      alert('Failed to save drawing: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'my-rug-design.png';
    link.href = canvas.toDataURL();
    link.click();
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
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white text-center">
        <AlertCircle size={20} className="inline mr-2" />
        <span className="font-bold">PRO TIP:</span> Use your iPad or tablet for the best painting experience!
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Drawing Tools</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={tool === 'pen' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('pen')}
                >
                  <Pencil size={16} />
                  Pen
                </Button>
                <Button
                  variant={tool === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('eraser')}
                >
                  <Eraser size={16} />
                  Eraser
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
                  variant={tool === 'rectangle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('rectangle')}
                >
                  <Square size={16} />
                  Rectangle
                </Button>
                <Button
                  variant={tool === 'circle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTool('circle')}
                >
                  <Circle size={16} />
                  Circle
                </Button>
              </div>
            </div>

            {availableColors.length > 0 && (
              <div>
                <Label className="mb-2 block">Paint Colors</Label>
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
            )}

            <div>
              <Label className="mb-2 block">Brush Thickness: {brushSize}px</Label>
              <Slider
                value={[brushSize]}
                onValueChange={(val) => setBrushSize(val[0])}
                min={2}
                max={60}
                step={2}
              />
            </div>

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
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <Trash2 size={16} />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={downloadImage}>
                <Download size={16} />
                Download
              </Button>
              <Button 
                size="sm" 
                onClick={saveDrawingToCloud}
                disabled={uploading}
                className="ml-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold"
              >
                <Save size={16} />
                {uploading ? 'Saving...' : savedImageUrl ? 'Update Design' : 'Save Design'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative bg-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden" style={{ 
        backgroundImage: 'repeating-linear-gradient(45deg, #f9fafb 0px, #f9fafb 10px, #e5e7eb 10px, #e5e7eb 20px)',
        backgroundSize: '20px 20px'
      }}>
        <canvas
          ref={canvasRef}
          width={canvasDims.width}
          height={canvasDims.height}
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
              placeholder="Type your text here..."
              className="mb-3 min-h-[120px] text-base"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  addText();
                }
              }}
            />
            <div className="text-xs text-gray-500 mb-3">
              Tip: Press Ctrl+Enter to add text
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addText} className="flex-1">Add Text</Button>
              <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>

      {savedImageUrl && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 text-center border-2 border-green-300">
          <p className="text-lg text-gray-800 font-bold mb-2">
            ✅ Your design has been saved!
          </p>
          <p className="text-sm text-gray-600">
            {onSaveImage ? 'You can continue editing or proceed to the next step.' : 'Your design is ready to use.'}
          </p>
        </div>
      )}

      {!savedImageUrl && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 text-center border-2 border-yellow-300">
          <p className="text-lg text-gray-800 font-bold mb-2">
            💡 When you're done, click "Save Design" above
          </p>
          <p className="text-sm text-gray-600">
            Your design will be uploaded and ready to use
          </p>
        </div>
      )}
    </div>
  );
}