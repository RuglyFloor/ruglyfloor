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
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
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
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    all_images: [],
    size: '5x7',
    category: 'original',
    in_stock: true,
    backing: '',
    warranty: '',
    shipping_info: '',
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
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditingProduct(null);
      resetForm();
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
      category: 'original',
      in_stock: true,
      backing: '',
      warranty: '',
      shipping_info: '',
      care_instructions: ''
    });
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

      // Generate product info using AI
      const productInfo = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this rug image and provide comprehensive product information. Extract or infer:
        1. A catchy product name (concise, descriptive)
        2. A compelling sales description (2-3 sentences highlighting unique features, style, and appeal)
        3. Suggested price in USD (based on size, complexity, and market value for custom hand-painted rugs)
        4. Dominant colors and design style
        
        ${aiSuggestion ? `Additional context from user: ${aiSuggestion}` : ''}
        
        Be professional and sales-oriented. Make it sound premium and artistic.`,
        file_urls: [mainImage],
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            suggested_price: { type: "number" },
            colors: { type: "string" },
            style: { type: "string" }
          }
        }
      });

      // Determine room type based on rug size
      const size = formData.size.toLowerCase();
      let roomType = 'living room';
      let roomDescription = 'modern, contemporary living room with natural lighting. The room should have minimalist furniture, neutral walls, hardwood floors';
      
      // Check if it's a small rug (under 5 feet in any dimension)
      if (size.includes('3x') || size.includes('4x') || size.includes('2x') || size.includes('x3') || size.includes('x4') || size.includes('x2')) {
        const smallSpaces = ['home office', 'hallway', 'entryway', 'closet'];
        roomType = smallSpaces[Math.floor(Math.random() * smallSpaces.length)];
        
        if (roomType === 'home office') {
          roomDescription = 'bright home office with a desk, chair, and shelving. Modern workspace with natural light and minimalist decor';
        } else if (roomType === 'hallway') {
          roomDescription = 'elegant hallway with clean walls and good lighting. Simple, inviting entryway corridor';
        } else if (roomType === 'entryway') {
          roomDescription = 'welcoming entryway with a console table and mirror. Bright foyer with natural light';
        } else {
          roomDescription = 'organized closet space or dressing area. Clean, well-lit room with simple furnishings';
        }
      }

      // Generate marketing images with custom suggestions
      const [roomImage, measurementImage] = await Promise.all([
        base44.integrations.Core.GenerateImage({
          prompt: `Create a photorealistic interior design mockup showing this rug placed in a ${roomDescription}. The rug should be the focal point. Make it look like a professional interior design photo. ${aiSuggestion ? `Additional styling: ${aiSuggestion}` : ''}`,
          existing_image_urls: [mainImage]
        }),
        base44.integrations.Core.GenerateImage({
          prompt: `Create a clean product image of this rug on a white background with clear measurement annotations. Show the exact dimensions (${formData.size}) marked with professional arrows and labels on all sides. Make it look like a technical product specification sheet with measurements clearly visible for width and length.`,
          existing_image_urls: [mainImage]
        })
      ]);

      // Add AI-generated images to all_images
      const newImages = [
        {
          id: `ai-${Date.now()}-1`,
          url: roomImage.url,
          original_url: roomImage.url,
          selected: true,
          order: formData.all_images.length,
          source: 'ai'
        },
        {
          id: `ai-${Date.now()}-2`,
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
        description: `${productInfo.description}\n\nStyle: ${productInfo.style}\nColors: ${productInfo.colors}`,
        price: productInfo.suggested_price.toString(),
        all_images: [...prev.all_images, ...newImages]
      }));

      setAiSuggestion('');
      alert('✨ AI generation complete! Review and adjust as needed.');
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate AI content. Please try again.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedImages = formData.all_images.filter(img => img.selected);
    if (selectedImages.length === 0) {
      alert('Please select at least one image to display');
      return;
    }
    
    // Set backward compatibility fields
    const mainImage = selectedImages[0];
    const additionalImages = selectedImages.slice(1).map(img => img.url);
    
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      image_url: mainImage.url,
      images: additionalImages
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
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
    
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price != null ? product.price.toString() : '',
      all_images: allImages,
      size: product.size || '5x7',
      category: product.category || 'original',
      in_stock: product.in_stock !== undefined ? product.in_stock : true,
      backing: product.backing || '',
      warranty: product.warranty || '',
      shipping_info: product.shipping_info || '',
      care_instructions: product.care_instructions || ''
    });
  };

  const handleToggleStock = async (product) => {
    await updateProductMutation.mutateAsync({
      id: product.id,
      data: { in_stock: !product.in_stock }
    });
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Product Management</h1>
            <p className="text-gray-600">Manage your original Rugly inventory</p>
          </div>
          <Dialog open={isAddingProduct || editingProduct !== null} onOpenChange={(open) => {
            if (!open) {
              setIsAddingProduct(false);
              setEditingProduct(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsAddingProduct(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label>Size *</Label>
                    <Input
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                      placeholder="e.g., 8x10, 5ft Round, 3x5"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Product Images</Label>
                  <ImageManager
                    images={formData.all_images}
                    onChange={(images) => setFormData(prev => ({ ...prev, all_images: images }))}
                    onGenerateAI={generatingAI ? null : handleAIGenerate}
                  />
                  {formData.all_images.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <Label className="text-sm text-gray-600">AI Suggestions (Optional)</Label>
                      <Textarea
                        value={aiSuggestion}
                        onChange={(e) => setAiSuggestion(e.target.value)}
                        placeholder="e.g., 'Make it look cozy and warm with autumn colors' or 'Place in a modern minimalist space'"
                        rows={2}
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500">💡 Add styling suggestions for AI-generated room photos and product details</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Backing *</Label>
                    <Input
                      value={formData.backing}
                      onChange={(e) => setFormData(prev => ({ ...prev, backing: e.target.value }))}
                      placeholder="e.g., Non-slip rubber"
                      required
                    />
                  </div>
                  <div>
                    <Label>Warranty *</Label>
                    <Input
                      value={formData.warranty}
                      onChange={(e) => setFormData(prev => ({ ...prev, warranty: e.target.value }))}
                      placeholder="e.g., 24-hour damage guarantee"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Shipping Info *</Label>
                    <Input
                      value={formData.shipping_info}
                      onChange={(e) => setFormData(prev => ({ ...prev, shipping_info: e.target.value }))}
                      placeholder="e.g., $59 flat rate (3-5 days)"
                      required
                    />
                  </div>
                  <div>
                    <Label>Care Instructions *</Label>
                    <Input
                      value={formData.care_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, care_instructions: e.target.value }))}
                      placeholder="e.g., Machine washable, air dry"
                      required
                    />
                  </div>
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
                  <Button type="submit" className="flex-1">
                    {editingProduct ? 'Update Product' : 'Create Product'}
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
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                    <span className="text-sm text-gray-500">{product.size}</span>
                  </div>
                  <div className="flex gap-2">
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