import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, DollarSign, Loader2 } from 'lucide-react';
import AdminProtected from '../components/AdminProtected';
import { toast } from 'sonner';

export default function AdminPricing() {
  const queryClient = useQueryClient();
  const [editedPricing, setEditedPricing] = useState({});

  // Default pricing structure
  const defaultCruglyPricing = {
    quality_tiers: [
      { label: 'Budget Friendly', priceMultiplier: 0.7, materialDetail: 'Good quality polyester fiber' },
      { label: 'Good Rug', priceMultiplier: 1.0, materialDetail: 'Premium blend' },
      { label: 'High-End', priceMultiplier: 1.5, materialDetail: 'Luxury wool blend' }
    ],
    sizes: [
      { label: 'Tiny (2x3)', basePrice: 79, stepFee: 30 },
      { label: 'Small (4x6)', basePrice: 200, stepFee: 30 },
      { label: 'Medium (5x7)', basePrice: 300, stepFee: 50 },
      { label: 'Large (8x10)', basePrice: 400, stepFee: 90 },
      { label: 'Huge (9x11)', basePrice: 500, stepFee: 130 },
      { label: 'Round (4ft)', basePrice: 250, stepFee: 40 }
    ],
    color_fees: {
      one_color: 0,
      two_colors: 50,
      three_colors: 100
    },
    upgrades: {
      three_d_effect: 100,
      rush_order_multiplier: 1.5
    }
  };

  const { data: pricingConfigs = [], isLoading } = useQuery({
    queryKey: ['pricing-configs'],
    queryFn: () => base44.entities.PricingConfig.list(),
    initialData: []
  });

  const savePricingMutation = useMutation({
    mutationFn: async ({ configName, pricingData }) => {
      const existing = pricingConfigs.find(c => c.config_name === configName);
      const user = await base44.auth.me();
      
      if (existing) {
        return base44.entities.PricingConfig.update(existing.id, {
          pricing_data: pricingData,
          last_updated_by: user.email
        });
      } else {
        return base44.entities.PricingConfig.create({
          config_name: configName,
          pricing_data: pricingData,
          last_updated_by: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-configs'] });
      toast.success('Pricing updated successfully');
    },
    onError: () => {
      toast.error('Failed to update pricing');
    }
  });

  const cruglyConfig = pricingConfigs.find(c => c.config_name === 'crugly_pricing');
  const currentCruglyPricing = cruglyConfig?.pricing_data || defaultCruglyPricing;

  const updateValue = (path, value) => {
    const keys = path.split('.');
    setEditedPricing(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = parseFloat(value) || value;
      return updated;
    });
  };

  const getValue = (path) => {
    const keys = path.split('.');
    let current = editedPricing;
    
    for (const key of keys) {
      if (current?.[key] === undefined) {
        // Fallback to current pricing
        current = currentCruglyPricing;
        for (const k of keys) {
          current = current?.[k];
          if (current === undefined) return '';
        }
        return current;
      }
      current = current[key];
    }
    
    return current ?? '';
  };

  const handleSave = () => {
    const merged = JSON.parse(JSON.stringify(currentCruglyPricing));
    
    // Merge edited values
    const merge = (target, source) => {
      Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
    };
    
    merge(merged, editedPricing);
    savePricingMutation.mutate({ configName: 'crugly_pricing', pricingData: merged });
    setEditedPricing({});
  };

  // Calculate all price combinations
  const calculatePricingMatrix = () => {
    const matrix = [];
    currentCruglyPricing.quality_tiers?.forEach(quality => {
      currentCruglyPricing.sizes?.forEach(size => {
        [1, 2, 3].forEach(numColors => {
          const basePrice = size.basePrice * quality.priceMultiplier;
          const colorFee = numColors === 1 ? 0 : numColors === 2 ? currentCruglyPricing.color_fees.two_colors : currentCruglyPricing.color_fees.three_colors;
          const total = basePrice + colorFee;
          
          matrix.push({
            quality: quality.label,
            size: size.label,
            colors: numColors,
            basePrice,
            colorFee,
            total,
            with3D: total + currentCruglyPricing.upgrades.three_d_effect,
            withRush: total * currentCruglyPricing.upgrades.rush_order_multiplier
          });
        });
      });
    });
    return matrix;
  };

  const pricingMatrix = calculatePricingMatrix();

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Pricing Management</h1>
              <p className="text-gray-600">Configure pricing for custom and original rugs</p>
            </div>
            <Button onClick={handleSave} disabled={savePricingMutation.isPending || Object.keys(editedPricing).length === 0}>
              {savePricingMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save Changes</>
              )}
            </Button>
          </div>

          <Tabs defaultValue="crugly" className="space-y-6">
            <TabsList>
              <TabsTrigger value="crugly">Custom Rugs (Crugly)</TabsTrigger>
              <TabsTrigger value="originals">Original Ruglys</TabsTrigger>
              <TabsTrigger value="matrix">Pricing Matrix</TabsTrigger>
            </TabsList>

            {/* Crugly Pricing Tab */}
            <TabsContent value="crugly" className="space-y-6">
              {/* Quality Tiers */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentCruglyPricing.quality_tiers?.map((tier, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                        <div>
                          <label className="text-sm font-medium">{tier.label}</label>
                          <p className="text-xs text-gray-500">{tier.materialDetail}</p>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Price Multiplier</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={getValue(`quality_tiers.${idx}.priceMultiplier`) || tier.priceMultiplier}
                            onChange={(e) => updateValue(`quality_tiers.${idx}.priceMultiplier`, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          {(tier.priceMultiplier * 100).toFixed(0)}% of base price
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Size Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Size Base Prices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentCruglyPricing.sizes?.map((size, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                        <div>
                          <label className="text-sm font-medium">{size.label}</label>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Base Price</label>
                          <div className="flex items-center mt-1">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <Input
                              type="number"
                              value={getValue(`sizes.${idx}.basePrice`) || size.basePrice}
                              onChange={(e) => updateValue(`sizes.${idx}.basePrice`, e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Step Fee</label>
                          <div className="flex items-center mt-1">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <Input
                              type="number"
                              value={getValue(`sizes.${idx}.stepFee`) || size.stepFee}
                              onChange={(e) => updateValue(`sizes.${idx}.stepFee`, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Color Fees */}
              <Card>
                <CardHeader>
                  <CardTitle>Color Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">1 Color</label>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={getValue('color_fees.one_color') ?? currentCruglyPricing.color_fees?.one_color ?? 0}
                          onChange={(e) => updateValue('color_fees.one_color', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">2 Colors</label>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={getValue('color_fees.two_colors') ?? currentCruglyPricing.color_fees?.two_colors ?? 50}
                          onChange={(e) => updateValue('color_fees.two_colors', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">3+ Colors</label>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={getValue('color_fees.three_colors') ?? currentCruglyPricing.color_fees?.three_colors ?? 100}
                          onChange={(e) => updateValue('color_fees.three_colors', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrades */}
              <Card>
                <CardHeader>
                  <CardTitle>Upgrades & Add-ons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">3-D Effect (Flat Fee)</label>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          value={getValue('upgrades.three_d_effect') ?? currentCruglyPricing.upgrades?.three_d_effect ?? 100}
                          onChange={(e) => updateValue('upgrades.three_d_effect', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">Rush Order Multiplier</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={getValue('upgrades.rush_order_multiplier') ?? currentCruglyPricing.upgrades?.rush_order_multiplier ?? 1.5}
                        onChange={(e) => updateValue('upgrades.rush_order_multiplier', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Example: 1.5 = 150% of base price</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Original Ruglys Tab */}
            <TabsContent value="originals">
              <Card>
                <CardHeader>
                  <CardTitle>Original Rugly Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Manage individual product pricing in the <a href="/AdminProducts" className="text-blue-600 hover:underline">Products page</a>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Matrix Tab */}
            <TabsContent value="matrix">
              <Card>
                <CardHeader>
                  <CardTitle>All Pricing Combinations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Quality</th>
                          <th className="text-left p-2">Size</th>
                          <th className="text-center p-2">Colors</th>
                          <th className="text-right p-2">Base Price</th>
                          <th className="text-right p-2">Color Fee</th>
                          <th className="text-right p-2 font-bold">Total</th>
                          <th className="text-right p-2">+ 3D</th>
                          <th className="text-right p-2">Rush (Total)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricingMatrix.map((row, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2">{row.quality}</td>
                            <td className="p-2">{row.size}</td>
                            <td className="text-center p-2">{row.colors}</td>
                            <td className="text-right p-2">${row.basePrice.toFixed(2)}</td>
                            <td className="text-right p-2">${row.colorFee.toFixed(2)}</td>
                            <td className="text-right p-2 font-bold">${row.total.toFixed(2)}</td>
                            <td className="text-right p-2 text-gray-600">${row.with3D.toFixed(2)}</td>
                            <td className="text-right p-2 text-gray-600">${row.withRush.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminProtected>
  );
}