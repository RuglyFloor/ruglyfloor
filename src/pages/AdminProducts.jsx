import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, RefreshCw, Upload } from 'lucide-react';
import AdminProtected from '../components/AdminProtected';
import ImageManager from '../components/admin/ImageManager';

export default function AdminProducts() {
  return (
    <AdminProtected>
      <AdminProductsContent />
    </AdminProtected>
  );
}

function AdminProductsContent() {
  const queryClient = useQueryClient();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [syncingShopify, setSyncingShopify] = useState(null); // product id or 'all'
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiSettings, setAiSettings] = useState({
    roomStyle: 'modern',
    lighting: 'natural',
    colorTone: 'warm',
    roomType: 'auto'
  });
  // Rug type defaults — matches Policies page exactly
  const RUG_TYPE_DEFAULTS = {
    Crugly: {
      shipping_info: 'FREE shipping — No minimum, no catch.',
      care_instructions: 'Machine Washable',
      warranty: 'None',
      return_policy: '30-Day Return Policy'
    },
    Rugly: {
      shipping_info: 'Flat rate shipping based on size',
      care_instructions: 'Shampoo with rug cleaner (wet)',
      warranty: '5-Year Warranty',
      return_policy: '5-Year Warranty'
    },
    Ruglux: {
      shipping_info: 'Flat rate — $15 for Tiny, +$15 per size up',
      care_instructions: 'Dry clean or professional rug cleaning only',
      warranty: 'Lifetime Warranty',
      return_policy: 'Lifetime Warranty'
    },
    Square: {
      shipping_info: 'FREE shipping — Always.',
      care_instructions: 'Can be mopped or hosed down',
      warranty: 'None',
      return_policy: '90-Day Return Policy'
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    all_images: [],
    size: '5x7',
    size_height_ft: '',
    size_length_ft: '',
    category: 'original',
    rug_type: '',
    in_stock: true,
    backing: '',
    warranty: '',
    shipping_info: '',
    return_policy: '',
    care_instructions: ''
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date')
  });

  const createProductMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsAddingProduct(false);
      resetForm();
      alert('✅ Product created successfully!');
    },
    onError: (error) => {
      alert('❌ Failed to create product: ' + (error?.message || JSON.stringify(error)));
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditingProduct(null);
      resetForm();
      alert('✅ Product updated successfully!');
    },
    onError: (error) => {
      alert('❌ Failed to update product: ' + (error?.message || JSON.stringify(error)));
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      all_images: [],
      size: '5x7',
      size_height_ft: '',
      size_length_ft: '',
      category: 'original',
      rug_type: '',
      in_stock: true,
      backing: '',
      warranty: '',
      shipping_info: '',
      return_policy: '',
      care_instructions: ''
    });
  };

  const handleRugTypeChange = (rugType) => {
    const defaults = RUG_TYPE_DEFAULTS[rugType] || {};
    setFormData(prev => ({
      ...prev,
      rug_type: rugType,
      shipping_info: defaults.shipping_info || prev.shipping_info,
      care_instructions: defaults.care_instructions || prev.care_instructions,
      warranty: defaults.warranty || prev.warranty,
      return_policy: defaults.return_policy || prev.return_policy,
    }));
  };

  const handleAIGenerate = async () => {
    const selectedImages = formData.all_images.filter(img => img.selected);
    if (selectedImages.length === 0) {
      alert('Please upload at least one image first');
      return;
    }

    setGeneratingAI(true);
    try {
      const mainImage = selectedImages[0].url;
      // Use explicit height/length fields if provided, otherwise fall back to parsing size string
      // Height = top-to-bottom (vertical), Length = left-to-right (horizontal)
      const heightFt = parseFloat(formData.size_height_ft) || 5;
      const lengthFt = parseFloat(formData.size_length_ft) || 7;
      const heightIn = Math.round(heightFt * 12);
      const lengthIn = Math.round(lengthFt * 12);

      // Determine room type: use user override or auto-select by size
      const { roomStyle, lighting, colorTone, roomType: roomTypeSetting } = aiSettings;

      const LIGHTING_MAP = {
        natural: 'soft natural daylight streaming through large windows, realistic window shadows on the floor',
        golden: 'golden hour afternoon sunlight, warm amber tones, long soft shadows across the floor',
        studio: 'bright even studio lighting, soft shadows, clean and professional',
        moody: 'dim ambient lighting with accent lamps, dramatic shadows, intimate atmosphere'
      };
      const STYLE_MAP = {
        modern: 'clean lines, minimalist furniture, neutral palette, contemporary design',
        bohemian: 'eclectic layered textiles, plants, rattan furniture, warm earthy tones',
        luxury: 'high-end marble accents, velvet furniture, gold fixtures, designer aesthetic',
        rustic: 'reclaimed wood, exposed beams, vintage furniture, cozy farmhouse feel',
        scandinavian: 'white walls, light oak wood, simple clean furniture, hygge atmosphere'
      };
      const TONE_MAP = {
        warm: 'warm tones: honey, cream, soft amber in walls and furniture',
        cool: 'cool tones: soft grey, white, pale blue accents',
        neutral: 'balanced neutral tones: greige walls, natural wood, white trim',
        bold: 'rich bold tones: deep navy or forest green walls, contrast with the rug'
      };

      let autoRoomType = '';
      if (roomTypeSetting !== 'auto') {
        autoRoomType = roomTypeSetting;
      } else if (lengthFt <= 3 || heightFt <= 3) {
        autoRoomType = 'entryway';
      } else if (lengthFt <= 5 || heightFt <= 5) {
        autoRoomType = 'bedroom';
      } else if (lengthFt <= 8 || heightFt <= 8) {
        autoRoomType = 'living room';
      } else {
        autoRoomType = 'open-plan living and dining area';
      }

      const lightingDesc = LIGHTING_MAP[lighting] || LIGHTING_MAP.natural;
      const styleDesc = STYLE_MAP[roomStyle] || STYLE_MAP.modern;
      const toneDesc = TONE_MAP[colorTone] || TONE_MAP.warm;

      const roomContext = `${autoRoomType} with ${styleDesc}. ${toneDesc}. Lighting: ${lightingDesc}.`;

      // Generate product name/description only — NO pricing
      const productInfo = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a copywriter for a premium hand-painted rug brand called Rugly. 
Analyze this rug image and provide:
1. A short, catchy product name (3-5 words, no generic filler like "Beautiful" or "Stunning")
2. A compelling 2-3 sentence sales description that highlights the design, colors, and mood it creates in a space. Sound warm and human, not corporate.
3. The dominant colors visible
4. The design style (e.g., abstract, geometric, floral, portrait, landscape, sports, etc.)

${aiSuggestion ? `Additional context: ${aiSuggestion}` : ''}

DO NOT suggest a price.`,
        file_urls: [mainImage],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            colors: { type: "string" },
            style: { type: "string" }
          }
        }
      });

      // Generate both images in parallel
      const [roomImage, measurementImage] = await Promise.all([

        // ── ROOM IMAGE ──────────────────────────────────────────────────────
        base44.integrations.Core.GenerateImage({
          prompt: `Ultra-photorealistic interior design photograph — shot with a Canon EOS R5, 24mm lens, f/2.8, ISO 400.

SCENE: A real-world ${roomContext}
The rug (${lengthFt} ft wide left-to-right × ${heightFt} ft tall top-to-bottom) is placed flat on the floor as the centerpiece of the room.

RUG FIDELITY — THIS IS THE MOST IMPORTANT RULE:
- Reproduce this specific rug with ABSOLUTE ACCURACY. Every brushstroke, every color, every edge, every detail of the design must be an exact match to the uploaded image.
- Do NOT simplify, stylize, blur, or abstract the rug design. It must be recognizable as the exact same rug.
- The rug's proportions must be EXACT: ${lengthFt} ft wide (left-to-right) × ${heightFt} ft tall (top-to-bottom). Aspect ratio = ${(lengthFt/heightFt).toFixed(2)}:1 width-to-height. Render accordingly — do NOT swap or flip these dimensions.
- Show the rug in natural perspective foreshortening as it would appear on the floor from a standing eye-level view.

PHOTOREALISM REQUIREMENTS:
- The room must look like a real photograph, indistinguishable from a shot taken in an actual furnished room.
- Realistic contact shadows where the rug meets the floor. Subtle light sheen on the rug surface. Slight texture visible in the pile.
- Furniture casts soft shadows onto the rug edges.
- No CGI look, no painterly textures, no soft focus. Tack-sharp on the rug.
- No text, no watermarks, no borders, no labels.
${aiSuggestion ? `ADDITIONAL DIRECTION: ${aiSuggestion}` : ''}`,
          existing_image_urls: [mainImage]
        }),

        // ── MEASUREMENT / SPEC IMAGE ────────────────────────────────────────
        base44.integrations.Core.GenerateImage({
          prompt: `Professional product spec sheet image. Pure white background (#FFFFFF). No grey, no gradient.

THE RUG — CRITICAL ORIENTATION AND FIDELITY RULES:
1. ORIENTATION: Render the rug with EXACT dimensions — ${lengthFt} ft wide (left-to-right, horizontal) × ${heightFt} ft tall (top-to-bottom, vertical). Aspect ratio is ${(lengthFt/heightFt).toFixed(2)}:1 (width:height). Do NOT swap these values. Do NOT auto-rotate to landscape if the rug is taller than wide.
2. DESIGN: Reproduce the rug's colors, patterns, and artwork faithfully. DO NOT repeat, tile, or duplicate any graphic elements. Do NOT render any text or words from the rug design — replace any text in the design with a solid color block matching the surrounding color.
3. POSITION: Rug centered in the image with equal margin on all sides. Viewed flat from directly above (top-down, no perspective tilt). No wrinkles, soft drop shadow.

MEASUREMENT LABELS (only 2 labels, no other text):
- BOTTOM: A thin horizontal double-headed arrow (←→) spanning the full width of the rug, 20px below the rug. Centered text label below the arrow: "${lengthFt}' wide (${lengthIn}")"
- RIGHT SIDE: A thin vertical double-headed arrow (↕) spanning the full height of the rug, 20px to the right. Text label rotated 90° clockwise: "${heightFt}' tall (${heightIn}")"
- Arrow and line color: #333333. Font: Arial 13px #444444.
- Absolutely NO other text anywhere in the image.`,
          existing_image_urls: [mainImage]
        })
      ]);

      const newImages = [
        {
          id: `ai-room-${Date.now()}`,
          url: roomImage.url,
          original_url: roomImage.url,
          selected: true,
          order: formData.all_images.length,
          source: 'ai'
        },
        {
          id: `ai-measure-${Date.now()}`,
          url: measurementImage.url,
          original_url: measurementImage.url,
          selected: true,
          order: formData.all_images.length + 1,
          source: 'ai'
        }
      ];

      setFormData(prev => ({
        ...prev,
        name: productInfo.name,
        description: `${productInfo.description}\n\nStyle: ${productInfo.style} · Colors: ${productInfo.colors}`,
        all_images: [...prev.all_images, ...newImages]
      }));

      setAiSuggestion('');
      alert('✨ AI images generated! Set your price below and review before saving.');
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate AI content. Please try again.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const buildSaveData = (requireAll = true) => {
    const selectedImages = formData.all_images.filter(img => img.selected);
    if (requireAll && selectedImages.length === 0) {
      alert('Please select at least one image to display');
      return null;
    }
    if (requireAll && !formData.rug_type) {
      alert('Please select a Rug Type — this sets shipping, returns, and care instructions.');
      return null;
    }
    if (requireAll && !formData.backing) {
      alert('Please fill in the Backing field.');
      return null;
    }
    const mainImage = selectedImages[0];
    const additionalImages = selectedImages.slice(1).map(img => img.url);
    return {
      ...formData,
      price: parseFloat(formData.price) || 0,
      image_url: mainImage?.url || '',
      images: additionalImages,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = buildSaveData(true);
    if (!data) return;
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter a product name before saving as draft.');
      return;
    }
    const data = buildSaveData(false);
    if (!data) return;
    const draftData = { ...data, in_stock: false };
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: draftData });
    } else {
      createProductMutation.mutate(draftData);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    // Convert old format to new format if needed
    let allImages = product.all_images || [];
    if (allImages.length === 0 && (product.image_url || product.images)) {
      allImages = [];
      if (product.image_url) {
        allImages.push({
          id: 'main',
          url: product.image_url,
          original_url: product.image_url,
          selected: true,
          order: 0,
          source: 'upload'
        });
      }
      if (product.images) {
        product.images.forEach((img, idx) => {
          allImages.push({
            id: `img-${idx}`,
            url: img,
            original_url: img,
            selected: true,
            order: allImages.length,
            source: 'upload'
          });
        });
      }
    }
    
    // Parse existing size string into height/length fields
    const existingSizeMatch = (product.size || '').match(/(\d+\.?\d*)\s*[xX×]\s*(\d+\.?\d*)/);
    const existingHeight = existingSizeMatch ? existingSizeMatch[1] : '';
    const existingLength = existingSizeMatch ? existingSizeMatch[2] : '';

    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price != null ? product.price.toString() : '',
      all_images: allImages,
      size: product.size || '5x7',
      size_height_ft: existingHeight,
      size_length_ft: existingLength,
      category: product.category || 'original',
      rug_type: product.rug_type || '',
      in_stock: product.in_stock !== undefined ? product.in_stock : true,
      backing: product.backing || '',
      warranty: product.warranty || '',
      shipping_info: product.shipping_info || '',
      return_policy: product.return_policy || '',
      care_instructions: product.care_instructions || ''
    });
  };

  const handleToggleStock = async (product) => {
    await updateProductMutation.mutateAsync({
      id: product.id,
      data: { in_stock: !product.in_stock }
    });
  };

  const handleSyncToShopify = async (product) => {
    setSyncingShopify(product.id);
    try {
      const response = await base44.functions.invoke('exportToShopify', { product_id: product.id });
      alert(`✅ "${product.name}" synced to Shopify!\n${response.data.listing_url || ''}`);
    } catch (error) {
      alert('❌ Shopify sync failed: ' + error.message);
    } finally {
      setSyncingShopify(null);
    }
  };

  const handleSyncAllToShopify = async () => {
    if (!products || products.length === 0) return;
    if (!confirm(`Sync all ${products.length} products to Shopify?`)) return;
    setSyncingShopify('all');
    let success = 0, failed = 0;
    for (const product of products) {
      try {
        await base44.functions.invoke('exportToShopify', { product_id: product.id });
        success++;
      } catch {
        failed++;
      }
    }
    setSyncingShopify(null);
    alert(`Shopify sync complete!\n✅ ${success} synced${failed > 0 ? `\n❌ ${failed} failed` : ''}`);
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Product Management</h1>
            <p className="text-gray-600">Manage your original Rugly inventory</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSyncAllToShopify}
              disabled={syncingShopify === 'all'}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncingShopify === 'all' ? 'animate-spin' : ''}`} />
              {syncingShopify === 'all' ? 'Syncing...' : 'Sync All to Shopify'}
            </Button>
            <Dialog open={isAddingProduct || editingProduct !== null}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddingProduct(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                    onClick={() => { setIsAddingProduct(false); setEditingProduct(null); resetForm(); }}
                  >✕</button>
                </DialogTitle>
              </DialogHeader>
              <form className="space-y-4" noValidate onSubmit={(e) => e.preventDefault()}>
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Chicago Skyline"
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your Rugly..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (USD) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="299.99"
                      required
                    />
                  </div>
                  <div>
                    {/* Size is auto-composed from height + length below */}
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Size (feet) *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div>
                      <Label className="text-xs text-gray-500">Height — top to bottom ↕</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="1"
                        value={formData.size_height_ft}
                        onChange={(e) => {
                          const h = e.target.value;
                          const l = formData.size_length_ft;
                          setFormData(prev => ({
                            ...prev,
                            size_height_ft: h,
                            size: h && l ? `${h}x${l}` : prev.size
                          }));
                        }}
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Length — left to right ↔</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="1"
                        value={formData.size_length_ft}
                        onChange={(e) => {
                          const l = e.target.value;
                          const h = formData.size_height_ft;
                          setFormData(prev => ({
                            ...prev,
                            size_length_ft: l,
                            size: h && l ? `${h}x${l}` : prev.size
                          }));
                        }}
                        placeholder="e.g. 7"
                      />
                    </div>
                  </div>
                  {formData.size_height_ft && formData.size_length_ft && (
                    <p className="text-xs text-gray-400 mt-1">
                      Size: {formData.size_height_ft} ft tall × {formData.size_length_ft} ft wide → stored as "{formData.size_height_ft}x{formData.size_length_ft}"
                    </p>
                  )}
                </div>

                <div>
                  <Label>Product Images</Label>
                  <ImageManager
                    images={formData.all_images}
                    onChange={(images) => setFormData(prev => ({ ...prev, all_images: images }))}
                    onGenerateAI={handleAIGenerate}
                    generatingAI={generatingAI}
                  />
                  {formData.all_images.length > 0 && (
                    <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg border">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">🎨 AI Image Settings</p>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Room Type</Label>
                          <Select value={aiSettings.roomType} onValueChange={(v) => setAiSettings(prev => ({ ...prev, roomType: v }))}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto (by size)</SelectItem>
                              <SelectItem value="living room">Living Room</SelectItem>
                              <SelectItem value="bedroom">Bedroom</SelectItem>
                              <SelectItem value="dining room">Dining Room</SelectItem>
                              <SelectItem value="home office">Home Office</SelectItem>
                              <SelectItem value="entryway">Entryway / Foyer</SelectItem>
                              <SelectItem value="open-plan living and dining area">Open Plan</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Room Style</Label>
                          <Select value={aiSettings.roomStyle} onValueChange={(v) => setAiSettings(prev => ({ ...prev, roomStyle: v }))}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="modern">Modern / Minimalist</SelectItem>
                              <SelectItem value="bohemian">Bohemian</SelectItem>
                              <SelectItem value="luxury">Luxury / High-End</SelectItem>
                              <SelectItem value="rustic">Rustic / Farmhouse</SelectItem>
                              <SelectItem value="scandinavian">Scandinavian</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Lighting</Label>
                          <Select value={aiSettings.lighting} onValueChange={(v) => setAiSettings(prev => ({ ...prev, lighting: v }))}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="natural">Natural Daylight</SelectItem>
                              <SelectItem value="golden">Golden Hour</SelectItem>
                              <SelectItem value="studio">Studio / Bright</SelectItem>
                              <SelectItem value="moody">Moody / Ambient</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Color Tone</Label>
                          <Select value={aiSettings.colorTone} onValueChange={(v) => setAiSettings(prev => ({ ...prev, colorTone: v }))}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="warm">Warm</SelectItem>
                              <SelectItem value="cool">Cool</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="bold">Bold / Dramatic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">Additional Styling Notes (Optional)</Label>
                        <Textarea
                          value={aiSuggestion}
                          onChange={(e) => setAiSuggestion(e.target.value)}
                          placeholder="e.g., 'Include a dog lounging on the rug' or 'Show with holiday decor in the background'"
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Rug Type — drives shipping, care, warranty, returns */}
                <div>
                  <Label>Rug Type * <span className="text-xs text-gray-400 font-normal">(sets shipping, returns & care automatically)</span></Label>
                  <Select value={formData.rug_type} onValueChange={handleRugTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rug type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Crugly">Crugly — budget-friendly, free shipping, 2 colors</SelectItem>
                      <SelectItem value="Rugly">Rugly — signature line, flat rate shipping</SelectItem>
                      <SelectItem value="Ruglux">Ruglux — high-end, 3D, unlimited colors</SelectItem>
                      <SelectItem value="Square">Square — modular tiles, free shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.rug_type && (
                  <div className="rounded-lg border p-3 bg-gray-50 space-y-1 text-sm">
                    <p className="font-semibold text-gray-700 mb-2">Auto-filled from Rug Type:</p>
                    <p><span className="font-medium">Shipping:</span> {formData.shipping_info}</p>
                    <p><span className="font-medium">Returns:</span> {formData.return_policy}</p>
                    <p><span className="font-medium">Care:</span> {formData.care_instructions}</p>
                    <p><span className="font-medium">Warranty:</span> {formData.warranty}</p>
                  </div>
                )}

                <div>
                  <Label>Backing *</Label>
                  <Input
                    value={formData.backing}
                    onChange={(e) => setFormData(prev => ({ ...prev, backing: e.target.value }))}
                    placeholder="e.g., Non-slip rubber"
                  />
                </div>

                <div>
                  <Label>In Stock</Label>
                  <Select value={formData.in_stock.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, in_stock: value === 'true' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" className="flex-1" onClick={() => {
                    const data = buildSaveData(true);
                    if (!data) return;
                    if (editingProduct) {
                      updateProductMutation.mutate({ id: editingProduct.id, data });
                    } else {
                      createProductMutation.mutate(data);
                    }
                  }}>
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSaveDraft} className="flex-1 text-gray-600">
                    Save Draft
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>

                </div>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No products yet. Add your first original Rugly!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {products?.map((product) => (
              <Card key={product.id} className={!product.in_stock ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                    {product.image_url || (product.all_images && product.all_images.find(img => img.selected)) ? (
                      <img 
                        src={product.image_url || product.all_images.find(img => img.selected)?.url} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-16 h-16" />
                      </div>
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-bold px-4 py-2 rounded">SOLD OUT</span>
                      </div>
                    )}
                    {product.all_images && product.all_images.filter(img => img.selected).length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {product.all_images.filter(img => img.selected).length} images
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.rug_type && (
                    <span className="inline-block text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white mt-1"
                      style={{
                        backgroundColor: product.rug_type === 'Crugly' ? '#2de89a' :
                          product.rug_type === 'Rugly' ? '#4d7eff' :
                          product.rug_type === 'Ruglux' ? '#3d3d3d' :
                          product.rug_type === 'Square' ? '#e83a1a' : '#888',
                        color: product.rug_type === 'Crugly' ? '#1a1a1a' : '#ffffff'
                      }}
                    >{product.rug_type}</span>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                    <span className="text-sm text-gray-500">{product.size}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="flex-1 gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStock(product)}
                      className="flex-1"
                    >
                      {product.in_stock ? 'Mark Sold' : 'Mark Available'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSyncToShopify(product)}
                      disabled={syncingShopify === product.id}
                      className="gap-1 text-green-700 border-green-300 hover:bg-green-50"
                      title="Sync to Shopify"
                    >
                      {syncingShopify === product.id
                        ? <RefreshCw className="w-3 h-3 animate-spin" />
                        : <Upload className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Delete this product?')) {
                          deleteProductMutation.mutate(product.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}