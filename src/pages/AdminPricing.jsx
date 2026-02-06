import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, DollarSign } from 'lucide-react';
import AdminProtected from '../components/AdminProtected';

function AdminPricingContent() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: configs = [] } = useQuery({
    queryKey: ['pricing-config'],
    queryFn: () => base44.entities.PricingConfig.list()
  });

  // Initialize default pricing if not exists
  React.useEffect(() => {
    const initPricing = async () => {
      if (configs.length === 0) {
        const user = await base44.auth.me();
        await base44.entities.PricingConfig.create({
          config_name: 'shade_fees',
          pricing_data: {
            base_fee: 15,
            per_step_fee: 5,
            description: 'Shade fee: $15 base + $5 per size step (T→S→M→L→H)'
          },
          last_updated_by: user.email
        });
        await base44.entities.PricingConfig.create({
          config_name: 'quality_multipliers',
          pricing_data: {
            budget: 0.7,
            good: 1.0,
            highend: 2.5,
            catalog_markup: 1.10
          },
          last_updated_by: user.email
        });
        await base44.entities.PricingConfig.create({
          config_name: 'lx_customization',
          pricing_data: {
            base_fee: 100,
            per_step_fee: 50,
            description: 'Rugly LX length customization: $100 base + $50 per size step'
          },
          last_updated_by: user.email
        });
        queryClient.invalidateQueries(['pricing-config']);
      }
    };
    initPricing();
  }, [configs, queryClient]);

  const [formData, setFormData] = useState({
    shade_base: 15,
    shade_step: 5,
    lx_base: 100,
    lx_step: 50,
    catalog_markup: 1.10,
    budget_multiplier: 0.7,
    good_multiplier: 1.0,
    highend_multiplier: 2.5
  });

  React.useEffect(() => {
    if (configs.length > 0) {
      const shadeConfig = configs.find(c => c.config_name === 'shade_fees');
      const qualityConfig = configs.find(c => c.config_name === 'quality_multipliers');
      const lxConfig = configs.find(c => c.config_name === 'lx_customization');

      setFormData({
        shade_base: shadeConfig?.pricing_data?.base_fee || 15,
        shade_step: shadeConfig?.pricing_data?.per_step_fee || 5,
        lx_base: lxConfig?.pricing_data?.base_fee || 100,
        lx_step: lxConfig?.pricing_data?.per_step_fee || 50,
        catalog_markup: qualityConfig?.pricing_data?.catalog_markup || 1.10,
        budget_multiplier: qualityConfig?.pricing_data?.budget || 0.7,
        good_multiplier: qualityConfig?.pricing_data?.good || 1.0,
        highend_multiplier: qualityConfig?.pricing_data?.highend || 2.5
      });
    }
  }, [configs]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      const shadeConfig = configs.find(c => c.config_name === 'shade_fees');
      const qualityConfig = configs.find(c => c.config_name === 'quality_multipliers');
      const lxConfig = configs.find(c => c.config_name === 'lx_customization');

      await base44.entities.PricingConfig.update(shadeConfig.id, {
        pricing_data: {
          base_fee: data.shade_base,
          per_step_fee: data.shade_step,
          description: 'Shade fee: $' + data.shade_base + ' base + $' + data.shade_step + ' per size step'
        },
        last_updated_by: user.email
      });

      await base44.entities.PricingConfig.update(qualityConfig.id, {
        pricing_data: {
          budget: data.budget_multiplier,
          good: data.good_multiplier,
          highend: data.highend_multiplier,
          catalog_markup: data.catalog_markup
        },
        last_updated_by: user.email
      });

      await base44.entities.PricingConfig.update(lxConfig.id, {
        pricing_data: {
          base_fee: data.lx_base,
          per_step_fee: data.lx_step,
          description: 'Rugly LX: $' + data.lx_base + ' base + $' + data.lx_step + ' per step'
        },
        last_updated_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pricing-config']);
      setEditing(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const getSizeStepExample = (baseColor = '$40', step = 0) => {
    const base = 15;
    const perStep = 5;
    return `$${base + (step * perStep)}`;
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Pricing Configuration</h1>
          <Button onClick={() => setEditing(!editing)} variant={editing ? 'outline' : 'default'}>
            {editing ? 'Cancel' : 'Edit Pricing'}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Catalog Markup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Catalog Markup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Catalog Price Multiplier</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.catalog_markup}
                    onChange={(e) => setFormData({...formData, catalog_markup: parseFloat(e.target.value)})}
                    disabled={!editing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Customer pays: Catalog Price × {formData.catalog_markup} (Currently: 10% markup)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Tier Multipliers */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Tier Multipliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Crugly (Budget)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.budget_multiplier}
                    onChange={(e) => setFormData({...formData, budget_multiplier: parseFloat(e.target.value)})}
                    disabled={!editing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: $79 base × {formData.budget_multiplier} = ${Math.round(79 * formData.budget_multiplier)}
                  </p>
                </div>
                <div>
                  <Label>Rugly (Standard)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.good_multiplier}
                    onChange={(e) => setFormData({...formData, good_multiplier: parseFloat(e.target.value)})}
                    disabled={!editing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: $79 base × {formData.good_multiplier} = ${Math.round(79 * formData.good_multiplier)}
                  </p>
                </div>
                <div>
                  <Label>Rugly Lux (Premium)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.highend_multiplier}
                    onChange={(e) => setFormData({...formData, highend_multiplier: parseFloat(e.target.value)})}
                    disabled={!editing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: $79 base × {formData.highend_multiplier} = ${Math.round(79 * formData.highend_multiplier)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shade Fees */}
          <Card>
            <CardHeader>
              <CardTitle>Shade/Second Color Fees</CardTitle>
              <p className="text-sm text-gray-600">Second color fee = same as shade fee</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Base Fee</Label>
                  <Input
                    type="number"
                    step="1"
                    value={formData.shade_base}
                    onChange={(e) => setFormData({...formData, shade_base: parseInt(e.target.value)})}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Per Size Step Fee</Label>
                  <Input
                    type="number"
                    step="1"
                    value={formData.shade_step}
                    onChange={(e) => setFormData({...formData, shade_step: parseInt(e.target.value)})}
                    disabled={!editing}
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold mb-2">Size Ladder Examples:</div>
                  <div className="grid grid-cols-5 gap-2 text-xs">
                    <div>
                      <div className="font-bold">T (2×3)</div>
                      <div>${formData.shade_base}</div>
                    </div>
                    <div>
                      <div className="font-bold">S (3×5)</div>
                      <div>${formData.shade_base + formData.shade_step}</div>
                    </div>
                    <div>
                      <div className="font-bold">M (4×6)</div>
                      <div>${formData.shade_base + (formData.shade_step * 2)}</div>
                    </div>
                    <div>
                      <div className="font-bold">L (5×7)</div>
                      <div>${formData.shade_base + (formData.shade_step * 3)}</div>
                    </div>
                    <div>
                      <div className="font-bold">H (7×9)</div>
                      <div>${formData.shade_base + (formData.shade_step * 4)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LX Customization */}
          <Card>
            <CardHeader>
              <CardTitle>Rugly LX Length Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Base Fee</Label>
                  <Input
                    type="number"
                    step="1"
                    value={formData.lx_base}
                    onChange={(e) => setFormData({...formData, lx_base: parseInt(e.target.value)})}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>Per Size Step Fee</Label>
                  <Input
                    type="number"
                    step="1"
                    value={formData.lx_step}
                    onChange={(e) => setFormData({...formData, lx_step: parseInt(e.target.value)})}
                    disabled={!editing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: Custom 7×9 (step 4) = ${formData.lx_base} + (${formData.lx_step} × 4) = ${formData.lx_base + (formData.lx_step * 4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {editing && (
            <div className="flex gap-3">
              <Button type="submit" disabled={updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function AdminPricing() {
  return (
    <AdminProtected>
      <AdminPricingContent />
    </AdminProtected>
  );
}