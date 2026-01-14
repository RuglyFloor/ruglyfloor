import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pencil, Eraser, Type, Square, Circle, Undo, Redo, Trash2, Upload, 
  Image as ImageIcon, Layers, Eye, EyeOff, Plus, ZoomIn, ZoomOut, Move 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import SEOHead from '../components/seo/SEOHead';

const SIZES = [
  { id: 'tiny', label: 'Tiny', value: 'tiny', price: 79, measurement: '2x3' },
  { id: 'sm', label: 'Small', value: 'small', price: 200, measurement: '4x6' },
  { id: 'md', label: 'Medium', value: 'medium', price: 300, measurement: '5x7' },
  { id: 'lg', label: 'Large', value: 'large', price: 400, measurement: '8x10' },
  { id: 'hg', label: 'Huge', value: 'huge', price: 500, measurement: '9x11' },
  { id: 'rd', label: '3.14', value: '4ft round', price: 250, measurement: '4 foot round' }
];

const BASE_COLORS = [
  { name: 'Yellow', hex: '#f4d03f' },
  { name: 'Pink', hex: '#f8c9d4' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Burnt Orange', hex: '#cc5500' },
  { name: 'Grey', hex: '#9ca3af' },
  { name: 'Green', hex: '#86cb92' },
  { name: 'Tan', hex: '#d2b48c' },
  { name: 'Khaki', hex: '#c3b091' }
];

const PAINT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Red', hex: '#dc143c' },
  { name: 'Blue', hex: '#2e5090' },
  { name: 'Green', hex: '#00a651' },
  { name: 'Yellow', hex: '#ffd700' },
  { name: 'Purple', hex: '#5b3a70' },
  { name: 'Orange', hex: '#ff4500' }
];

const STENCIL_FONTS = [
  'Allerta Stencil',
  'Big Shoulders Stencil Display',
  'Saira Stencil One',
  'Black Ops One',
  'Wallpoet'
];

export default function UnifiedDesignArea() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const uploadedImageRef = useRef(null);
  const textareaRef = useRef(null);

  // Configuration
  const [size, setSize] = useState('');
  const [baseColor, setBaseColor] = useState('');
  const [paintColors, setPaintColors] = useState([PAINT_COLORS[0].hex]);

  // Canvas State
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [brushSize, setBrushSize] = useState(15);
  const [opacity, setOpacity] = useState(1);
  const [currentColor, setCurrentColor] = useState(PAINT_COLORS[0].hex);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);

  // Image Upload State
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 100, y: 100 });
  const [imageSize, setImageSize] = useState({ width: 200, height: 200 });
  const [processingImage, setProcessingImage] = useState(false);
  const [imageThreshold, setImageThreshold] = useState(128);
  const [imageBrightness, setImageBrightness] = useState(100);

  // Text State
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState('');
  const [selectedFont, setSelectedFont] = useState('Allerta Stencil');
  const [fontSize, setFontSize] = useState(40);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, []);

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
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

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
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen') {
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
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
    ctx.fillStyle = currentColor;
    ctx.fillText(textInput, textPosition.x, textPosition.y);

    setTextInput('');
    setShowTextInput(false);
    saveToHistory();
  };

  const drawShape = (e, shapeType) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const ctx = canvas.getContext('2d');
    const size = brushSize * 8;

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;

    if (shapeType === 'rectangle') {
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);
    } else if (shapeType === 'circle') {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
      ctx.stroke();
    }

    saveToHistory();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessingImage(true);
    try {
      // Upload to get URL
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setUploadedImage(img);
        setImageSize({ width: img.width / 2, height: img.height / 2 });
        
        // Apply 2-color conversion immediately
        convertImageToTwoTone(img);
      };
      img.src = file_url;
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setProcessingImage(false);
    }
  };

  const convertImageToTwoTone = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Draw image on canvas at position
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);

    // Get image data
    const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Apply brightness
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * (imageBrightness / 100));
      data[i + 1] = Math.min(255, data[i + 1] * (imageBrightness / 100));
      data[i + 2] = Math.min(255, data[i + 2] * (imageBrightness / 100));
    }

    // Convert to grayscale and apply threshold
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

      if (gray < imageThreshold) {
        // Apply paint color
        const rgb = hexToRgb(paintColors[0]);
        data[i] = rgb.r;
        data[i + 1] = rgb.g;
        data[i + 2] = rgb.b;
      } else {
        // Make transparent
        data[i + 3] = 0;
      }
    }

    tempCtx.putImageData(imageData, 0, 0);

    // Draw processed image onto main canvas
    ctx.drawImage(
      tempCanvas,
      imagePosition.x,
      imagePosition.y,
      imageSize.width,
      imageSize.height
    );

    saveToHistory();
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const handleUseDesign = async () => {
    if (!size || !baseColor) {
      alert('Please select a size and base color first');
      return;
    }

    const canvas = canvasRef.current;
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'design.png', { type: 'image/png' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const selectedSize = SIZES.find(s => s.value === size);
      const cartItem = {
        type: 'custom',
        size: selectedSize.label,
        baseColor: baseColor,
        paintColor: PAINT_COLORS.find(c => c.hex === paintColors[0])?.name || 'Custom',
        imageUrl: file_url,
        previewUrl: file_url,
        numColors: paintColors.length,
        price: selectedSize.price,
        name: `Custom Rug - ${selectedSize.label}`
      };

      const cart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
      cart.push(cartItem);
      localStorage.setItem('rugly_cart', JSON.stringify(cart));

      navigate(createPageUrl('Cart'));
    });
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <SEOHead
        title="Rugly Unified Design Area | Create Custom Hand-Painted Rugs"
        description="Design custom hand-painted rugs with our unified design tool. Upload images, draw, add text and shapes. Perfect Mother's Day gifts, Father's Day gifts, unique gifts for hard to buy for people."
        keywords={['custom rugs', 'mothers day gifts', 'fathers day gifts', 'unique gifts', 'personalized rugs', 'hand painted rugs', 'custom floor art']}
        url="/unified-design-area"
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Rugly Unified Design Area</h1>
        <p className="text-center text-gray-600 mb-8">Create your perfect custom rug design in one place</p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Configuration */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Size Selection */}
              <div>
                <Label className="mb-3 block font-bold text-lg">1. Select Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSize(s.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        size === s.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold">{s.label}</div>
                      <div className="text-xs text-gray-600">{s.measurement}</div>
                      <div className="text-sm font-bold text-blue-600">${s.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Color */}
              <div>
                <Label className="mb-3 block font-bold text-lg">2. Base Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {BASE_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setBaseColor(color.name)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 ${
                        baseColor === color.name ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded border-2 border-white shadow"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs text-center">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paint Colors */}
              <div>
                <Label className="mb-3 block font-bold text-lg">3. Paint Colors</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PAINT_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => {
                        if (paintColors.includes(color.hex)) {
                          setPaintColors(paintColors.filter(c => c !== color.hex));
                        } else {
                          setPaintColors([...paintColors, color.hex]);
                        }
                        setCurrentColor(color.hex);
                      }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 ${
                        paintColors.includes(color.hex) ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              {size && baseColor && (
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    ${SIZES.find(s => s.value === size)?.price}
                  </div>
                  <div className="text-sm text-gray-600">Ready to design!</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Center - Canvas */}
          <div className="lg:col-span-2 space-y-4">
            {/* Toolbar */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Tools */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={tool === 'pen' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool('pen')}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Draw
                    </Button>
                    <Button
                      variant={tool === 'eraser' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool('eraser')}
                    >
                      <Eraser className="w-4 h-4 mr-2" />
                      Erase
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
                      Box
                    </Button>
                    <Button
                      variant={tool === 'circle' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool('circle')}
                    >
                      <Circle className="w-4 h-4 mr-2" />
                      Circle
                    </Button>
                    
                    {/* Image Upload */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <div className={`inline-flex items-center justify-center rounded-md text-sm font-medium px-3 py-2 border-2 ${
                        uploadedImage ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </div>
                    </label>
                  </div>

                  {/* Brush & Opacity */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1 block">Thickness: {brushSize}px</Label>
                      <Slider
                        value={[brushSize]}
                        onValueChange={(val) => setBrushSize(val[0])}
                        min={2}
                        max={60}
                        step={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Opacity: {Math.round(opacity * 100)}%</Label>
                      <Slider
                        value={[opacity * 100]}
                        onValueChange={(val) => setOpacity(val[0] / 100)}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>

                  {/* Image Controls */}
                  {uploadedImage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                      <Label className="text-xs font-bold block">Image Controls</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs mb-1 block">Contrast: {imageThreshold}</Label>
                          <Slider
                            value={[imageThreshold]}
                            onValueChange={(val) => {
                              setImageThreshold(val[0]);
                              if (uploadedImage) convertImageToTwoTone(uploadedImage);
                            }}
                            min={0}
                            max={255}
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block">Brightness: {imageBrightness}%</Label>
                          <Slider
                            value={[imageBrightness]}
                            onValueChange={(val) => {
                              setImageBrightness(val[0]);
                              if (uploadedImage) convertImageToTwoTone(uploadedImage);
                            }}
                            min={50}
                            max={150}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={undo}>
                      <Undo className="w-4 h-4 mr-1" />
                      Undo
                    </Button>
                    <Button variant="outline" size="sm" onClick={redo}>
                      <Redo className="w-4 h-4 mr-1" />
                      Redo
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearCanvas}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Canvas Area */}
            <Card>
              <CardContent className="p-4">
                <div
                  className="relative rounded-lg overflow-hidden"
                  style={{ backgroundColor: BASE_COLORS.find(c => c.name === baseColor)?.hex || '#ffffff' }}
                >
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
                    onClick={(e) => {
                      if (tool === 'rectangle' || tool === 'circle') {
                        drawShape(e, tool);
                      }
                    }}
                  />

                  {/* Text Input Overlay */}
                  {showTextInput && (
                    <div
                      className="absolute bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500"
                      style={{
                        left: Math.min(textPosition.x, 600),
                        top: Math.min(textPosition.y, 400)
                      }}
                    >
                      <Label className="mb-2 block font-semibold text-sm">Add Text</Label>
                      <Textarea
                        ref={textareaRef}
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type your text..."
                        className="mb-2 min-h-[80px]"
                        autoFocus
                      />
                      <Select value={selectedFont} onValueChange={setSelectedFont}>
                        <SelectTrigger className="mb-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STENCIL_FONTS.map(font => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mb-2">
                        <Label className="text-xs">Size: {fontSize}px</Label>
                        <Slider
                          value={[fontSize]}
                          onValueChange={(val) => setFontSize(val[0])}
                          min={20}
                          max={120}
                          step={5}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addText} className="flex-1">Add</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowTextInput(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Use Design Button */}
            <Button
              onClick={handleUseDesign}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl py-8"
              disabled={!size || !baseColor}
            >
              Use This Design & Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}