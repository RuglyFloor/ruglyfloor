import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Check, AlertCircle, Clock } from 'lucide-react';
import AdminProtected from '../components/AdminProtected';

const IMAGE_STATUS_CONFIG = {
  pending: { label: 'Awaiting Upload', icon: Clock, color: 'bg-gray-100 text-gray-700', dotColor: 'bg-gray-400' },
  uploaded: { label: 'Uploaded', icon: Check, color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
  processing: { label: 'Processing', icon: Clock, color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-500' },
  completed: { label: 'Completed', icon: Check, color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  failed: { label: 'Failed', icon: AlertCircle, color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' }
};

export default function AdminOrderDetail() {
  return (
    <AdminProtected>
      <AdminOrderDetailContent />
    </AdminProtected>
  );
}

function AdminOrderDetailContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [newImageStatus, setNewImageStatus] = useState('');

  const orderId = new URLSearchParams(window.location.search).get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => base44.entities.Order.list(),
    select: (orders) => orders.find(o => o.id === orderId)
  });

  const updateImageStatusMutation = useMutation({
    mutationFn: ({ itemIndex, status }) => {
      const items = [...order.items];
      items[itemIndex].image_processing_status = status;
      return base44.entities.Order.update(orderId, { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', orderId] });
      setNewImageStatus('');
    }
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!order) return <div className="p-8">Order not found</div>;

  const currentItem = order.items[selectedItemIndex];
  const StatusIcon = IMAGE_STATUS_CONFIG[currentItem?.image_processing_status]?.icon || Clock;

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Summary & Item Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order #{order.order_number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="text-gray-600">Customer Number</p>
                  <p className="font-mono font-bold text-blue-600">{order.customer_number || 'N/A'}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Customer</p>
                  <p className="font-semibold">{order.customer_name}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Email</p>
                  <p className="font-semibold">{order.customer_email}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Phone</p>
                  <p className="font-semibold">{order.customer_phone || 'Not provided'}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Address</p>
                  <p className="font-semibold">
                    {order.shipping_address?.street}<br/>
                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">Items in Order</p>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedItemIndex(idx)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition ${
                          selectedItemIndex === idx
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.size}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Card */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Time on Site</p>
                  <p className="font-semibold">
                    {order.time_on_site 
                      ? `${Math.floor(order.time_on_site / 60)}m ${order.time_on_site % 60}s`
                      : 'Not tracked'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Source</p>
                  <p className="font-semibold break-all">{order.referrer_source || 'Direct'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 pb-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Serial Number</p>
                      <p className="font-mono text-lg font-bold text-blue-600">{currentItem?.serial_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">UPC</p>
                      <p className="font-mono font-semibold">{currentItem?.upc || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Size</p>
                    <p className="font-semibold">{currentItem?.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Base Color</p>
                    <p className="font-semibold">{currentItem?.base_color || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Paint Color</p>
                    <p className="font-semibold">{currentItem?.paint_color || 'Not specified'}</p>
                  </div>
                  {currentItem?.second_paint_color && (
                    <div>
                      <p className="text-gray-600">2nd Paint Color</p>
                      <p className="font-semibold">{currentItem.second_paint_color}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Number of Colors</p>
                    <p className="font-semibold">{currentItem?.num_colors || 2}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-semibold">${currentItem?.price}</p>
                  </div>
                </div>
                {currentItem?.design_instructions && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-gray-600 text-sm mb-1">Special Instructions</p>
                    <p className="font-medium">{currentItem.design_instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Processing Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Image Processing</span>
                  <Badge className={IMAGE_STATUS_CONFIG[currentItem?.image_processing_status]?.color}>
                    {IMAGE_STATUS_CONFIG[currentItem?.image_processing_status]?.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Update */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Update Image Status</label>
                    <Select value={newImageStatus} onValueChange={setNewImageStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Awaiting Upload</SelectItem>
                        <SelectItem value="uploaded">Uploaded</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => updateImageStatusMutation.mutate({ 
                        itemIndex: selectedItemIndex, 
                        status: newImageStatus 
                      })}
                      disabled={!newImageStatus}
                      className="w-full"
                    >
                      Update Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 gap-4">
              {/* Original Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    Original Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentItem?.original_upload_url ? (
                    <img 
                      src={currentItem.original_upload_url} 
                      alt="Original" 
                      className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No upload yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Processed 2-Tone */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    Processed Version (2-Tone)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentItem?.processed_image_url ? (
                    <img 
                      src={currentItem.processed_image_url} 
                      alt="Processed" 
                      className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Pending processing</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    AI Preview (On Rug)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentItem?.ai_preview_url ? (
                    <img 
                      src={currentItem.ai_preview_url} 
                      alt="AI Preview" 
                      className="w-full h-64 object-cover rounded-lg border border-gray-300"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Pending generation</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}