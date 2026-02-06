import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import AdminProtected from '../components/AdminProtected';

function AdminCatalogContent() {
  const queryClient = useQueryClient();
  const [editingListing, setEditingListing] = useState(null);
  const [showListingForm, setShowListingForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showVariantForm, setShowVariantForm] = useState(null);

  const { data: listings = [] } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => base44.entities.Catalog.list()
  });

  const { data: allVariants = [] } = useQuery({
    queryKey: ['catalog-variants'],
    queryFn: () => base44.entities.CatalogVariant.list()
  });

  const createListingMutation = useMutation({
    mutationFn: (data) => base44.entities.Catalog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['catalog']);
      setShowListingForm(false);
      setEditingListing(null);
    }
  });

  const updateListingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Catalog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['catalog']);
      setEditingListing(null);
    }
  });

  const deleteListingMutation = useMutation({
    mutationFn: (id) => base44.entities.Catalog.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['catalog'])
  });

  const createVariantMutation = useMutation({
    mutationFn: (data) => base44.entities.CatalogVariant.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['catalog-variants']);
      setShowVariantForm(null);
      setEditingVariant(null);
    }
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CatalogVariant.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['catalog-variants']);
      setEditingVariant(null);
    }
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (id) => base44.entities.CatalogVariant.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['catalog-variants'])
  });

  const ListingForm = ({ listing, onClose }) => {
    const [formData, setFormData] = useState(listing || {
      vendor: 'Amazon',
      listing_name: '',
      listing_url: '',
      active: true,
      last_updated: new Date().toISOString()
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (listing) {
        updateListingMutation.mutate({ id: listing.id, data: formData });
      } else {
        createListingMutation.mutate(formData);
      }
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{listing ? 'Edit Listing' : 'New Listing'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Vendor</Label>
              <Select value={formData.vendor} onValueChange={(v) => setFormData({...formData, vendor: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amazon">Amazon</SelectItem>
                  <SelectItem value="Costco">Costco</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Listing Name</Label>
              <Input
                required
                value={formData.listing_name}
                onChange={(e) => setFormData({...formData, listing_name: e.target.value})}
                placeholder="e.g., nuLOOM Moroccan Blythe Area Rug"
              />
            </div>
            <div>
              <Label>Listing URL</Label>
              <Input
                value={formData.listing_url}
                onChange={(e) => setFormData({...formData, listing_url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(v) => setFormData({...formData, active: v})}
              />
              <Label>Active</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  const VariantForm = ({ variant, catalogId, onClose }) => {
    const [formData, setFormData] = useState(variant || {
      catalog_id: catalogId,
      size: '5x7',
      size_label: 'L',
      color: '',
      supplier_price: 0,
      in_stock: true
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (variant) {
        updateVariantMutation.mutate({ id: variant.id, data: formData });
      } else {
        createVariantMutation.mutate(formData);
      }
    };

    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Size</Label>
                <Select value={formData.size} onValueChange={(v) => setFormData({...formData, size: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2x3">2x3</SelectItem>
                    <SelectItem value="3x5">3x5</SelectItem>
                    <SelectItem value="4x6">4x6</SelectItem>
                    <SelectItem value="5x7">5x7</SelectItem>
                    <SelectItem value="7x9">7x9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Label</Label>
                <Select value={formData.size_label} onValueChange={(v) => setFormData({...formData, size_label: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T">T (Tiny)</SelectItem>
                    <SelectItem value="S">S (Small)</SelectItem>
                    <SelectItem value="M">M (Medium)</SelectItem>
                    <SelectItem value="L">L (Large)</SelectItem>
                    <SelectItem value="H">H (Huge)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <Input
                required
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                placeholder="e.g., Ivory, Gray"
              />
            </div>
            <div>
              <Label>Supplier Price ($)</Label>
              <Input
                required
                type="number"
                step="0.01"
                value={formData.supplier_price}
                onChange={(e) => setFormData({...formData, supplier_price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.in_stock}
                onCheckedChange={(v) => setFormData({...formData, in_stock: v})}
              />
              <Label>In Stock</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save</Button>
              <Button type="button" size="sm" variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Base Rug Catalog</h1>
          <Button onClick={() => setShowListingForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </Button>
        </div>

        {showListingForm && (
          <ListingForm onClose={() => setShowListingForm(false)} />
        )}

        {editingListing && (
          <ListingForm
            listing={editingListing}
            onClose={() => setEditingListing(null)}
          />
        )}

        <div className="space-y-6">
          {listings.map(listing => {
            const variants = allVariants.filter(v => v.catalog_id === listing.id);
            
            return (
              <Card key={listing.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {listing.listing_name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {listing.vendor} • {listing.active ? 'Active' : 'Inactive'}
                      </p>
                      {listing.listing_url && (
                        <a
                          href={listing.listing_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View on {listing.vendor}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingListing(listing)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Delete this listing and all variants?')) {
                            deleteListingMutation.mutate(listing.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowVariantForm(listing.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Variant
                    </Button>
                  </div>

                  {showVariantForm === listing.id && (
                    <VariantForm
                      catalogId={listing.id}
                      onClose={() => setShowVariantForm(null)}
                    />
                  )}

                  {variants.length === 0 ? (
                    <p className="text-sm text-gray-500">No variants yet</p>
                  ) : (
                    <div className="space-y-2">
                      {variants.map(variant => (
                        <div
                          key={variant.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {variant.size} ({variant.size_label}) • {variant.color}
                            </div>
                            <div className="text-sm text-gray-600">
                              ${variant.supplier_price} • {variant.in_stock ? 'In Stock' : 'Out of Stock'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingVariant(variant)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm('Delete this variant?')) {
                                  deleteVariantMutation.mutate(variant.id);
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {editingVariant && editingVariant.catalog_id === listing.id && (
                    <div className="mt-4">
                      <VariantForm
                        variant={editingVariant}
                        catalogId={listing.id}
                        onClose={() => setEditingVariant(null)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {listings.length === 0 && !showListingForm && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No catalog listings yet. Add your first listing to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCatalog() {
  return (
    <AdminProtected>
      <AdminCatalogContent />
    </AdminProtected>
  );
}