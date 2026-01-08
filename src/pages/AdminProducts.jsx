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
import { Package, Plus, Edit, Trash2, Upload } from 'lucide-react';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    images: [],
    size: '5x7',
    category: 'original',
    in_stock: true
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    enabled: user?.role === 'admin'
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
      image_url: '',
      images: [],
      size: '5x7',
      category: 'original',
      in_stock: true
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.image_url) {
      alert('Please upload an image first');
      return;
    }

    setGeneratingAI(true);
    try {
      // Generate product info using AI
      const productInfo = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this rug image and provide comprehensive product information. Extract or infer:
        1. A catchy product name (concise, descriptive)
        2. A compelling sales description (2-3 sentences highlighting unique features, style, and appeal)
        3. Suggested price in USD (based on size, complexity, and market value for custom hand-painted rugs)
        4. Dominant colors and design style
        
        Be professional and sales-oriented. Make it sound premium and artistic.`,
        file_urls: [formData.image_url],
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

      // Generate marketing images
      const [livingRoomImage, measurementImage] = await Promise.all([
        // Contemporary living room setting
        base44.integrations.Core.GenerateImage({
          prompt: `Create a photorealistic interior design mockup showing this rug placed in a modern, contemporary living room with natural lighting. The room should have minimalist furniture, neutral walls, hardwood floors, and the rug should be the focal point. Make it look like a professional interior design photo.`,
          existing_image_urls: [formData.image_url]
        }),
        // Measurement overlay
        base44.integrations.Core.GenerateImage({
          prompt: `Create a clean product image of this rug on a white background with clear measurement annotations. Show the dimensions (${formData.size}) marked with professional arrows and labels. Make it look like a technical product specification sheet with measurements clearly visible.`,
          existing_image_urls: [formData.image_url]
        })
      ]);

      // Update form with AI-generated data
      setFormData(prev => ({
        ...prev,
        name: productInfo.name,
        description: `${productInfo.description}\n\nStyle: ${productInfo.style}\nColors: ${productInfo.colors}`,
        price: productInfo.suggested_price.toString(),
        images: [livingRoomImage.url, measurementImage.url]
      }));

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
    const data = {
      ...formData,
      price: parseFloat(formData.price)
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      images: product.images || [],
      size: product.size || '5x7',
      category: product.category || 'original',
      in_stock: product.in_stock !== undefined ? product.in_stock : true
    });
  };

  const handleToggleStock = async (product) => {
    await updateProductMutation.mutateAsync({
      id: product.id,
      data: { in_stock: !product.in_stock }
    });
  };

  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p>This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

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
                    <Select value={formData.size} onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4x6">4x6</SelectItem>
                        <SelectItem value="5x7">5x7</SelectItem>
                        <SelectItem value="6x9">6x9</SelectItem>
                        <SelectItem value="9x12">9x12</SelectItem>
                        <SelectItem value="5ft Round">5ft Round</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Main Image</Label>
                  <div className="flex gap-4 items-center mb-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload').click()}
                      disabled={uploading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover rounded" />
                    )}
                  </div>
                  
                  {formData.image_url && (
                    <Button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={generatingAI}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
                    >
                      {generatingAI ? (
                        <>⏳ Generating AI Content...</>
                      ) : (
                        <>✨ Auto-Fill with AI (Description, Price, Marketing Images)</>
                      )}
                    </Button>
                  )}
                  
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-sm text-gray-600">AI-Generated Marketing Images</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt={`Generated ${idx + 1}`} className="w-full h-32 object-cover rounded border" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <span className="text-white text-xs">
                                {idx === 0 ? 'Living Room' : 'Measurements'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
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