import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Package, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import AdminProtected from '../components/AdminProtected';

function AdminOrderDetailContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      return orders[0];
    },
    enabled: !!orderId
  });

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    tracking_number: '',
    tracking_url: '',
    notes: ''
  });

  React.useEffect(() => {
    if (order) {
      setFormData({
        status: order.status,
        tracking_number: order.tracking_number || '',
        tracking_url: order.tracking_url || '',
        notes: order.notes || ''
      });
    }
  }, [order]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const statusHistory = [...(order.status_history || [])];
      
      // Add status change to history if status changed
      if (data.status !== order.status) {
        statusHistory.push({
          status: data.status,
          timestamp: new Date().toISOString(),
          note: `Status updated to ${data.status}`
        });
      }

      await base44.entities.Order.update(orderId, {
        ...data,
        status_history: statusHistory
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderId]);
      setEditing(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation: Cannot move to in_production unless paid
    if (formData.status === 'in_production' && order.status === 'pending_payment') {
      alert('Cannot move to production. Order must be paid first.');
      return;
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="min-h-screen py-12 px-6 bg-gray-50">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Order not found</p>
          <Button className="mt-4" onClick={() => navigate(createPageUrl('AdminOrders'))}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const config = {
      pending_payment: { label: 'Pending Payment', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      in_production: { label: 'In Production', className: 'bg-blue-100 text-blue-800' },
      shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
      refunded: { label: 'Refunded', className: 'bg-red-100 text-red-800' }
    };
    const { label, className } = config[status] || { label: status, className: 'bg-gray-100' };
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl('AdminOrders'))} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>

        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{order.order_number}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Created: {new Date(order.created_date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(order.status)}
                  {order.status === 'pending_payment' && (
                    <div className="text-sm text-orange-600 font-semibold mt-2">
                      ⚠️ Awaiting Payment
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Name:</strong> {order.customer_name || 'N/A'}</div>
              <div><strong>Email:</strong> {order.customer_email}</div>
              {order.customer_phone && <div><strong>Phone:</strong> {order.customer_phone}</div>}
              {order.shipping_address && (
                <div>
                  <strong>Shipping Address:</strong>
                  <div className="ml-4 text-gray-600">
                    {order.shipping_address.street}<br/>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          {(order.payment_intent_id || order.checkout_session_id) && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {order.amount_paid && (
                  <div><strong>Amount Paid:</strong> ${(order.amount_paid / 100).toFixed(2)} {order.currency?.toUpperCase()}</div>
                )}
                {order.payment_timestamp && (
                  <div><strong>Payment Time:</strong> {new Date(order.payment_timestamp).toLocaleString()}</div>
                )}
                {order.payment_intent_id && (
                  <div className="text-xs text-gray-500">Payment Intent: {order.payment_intent_id}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border rounded-lg">
                    {item.preview_url && (
                      <img src={item.preview_url} alt={item.name} className="w-24 h-24 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        {item.size && <div>Size: {item.size}</div>}
                        {item.base_color && <div>Base: {item.base_color}</div>}
                        {item.paint_color && <div>Paint: {item.paint_color}</div>}
                        {item.design_instructions && (
                          <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                            <strong>Instructions:</strong> {item.design_instructions}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-semibold">
                      ${(item.price / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="text-right text-xl font-bold pt-4 border-t">
                  Total: ${(order.total_amount / 100).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Update Form */}
          <Card>
            <CardHeader>
              <CardTitle>Update Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({...formData, status: v})}
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_payment">Pending Payment</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="in_production" disabled={order.status === 'pending_payment'}>
                        In Production {order.status === 'pending_payment' && '(Requires payment first)'}
                      </SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {order.status === 'pending_payment' && formData.status === 'in_production' && (
                    <p className="text-xs text-red-600 mt-1">⚠️ Cannot move to production until payment is confirmed</p>
                  )}
                </div>

                <div>
                  <Label>Tracking Number</Label>
                  <Input
                    value={formData.tracking_number}
                    onChange={(e) => setFormData({...formData, tracking_number: e.target.value})}
                    disabled={!editing}
                    placeholder="UPS/USPS tracking #"
                  />
                </div>

                <div>
                  <Label>Tracking URL</Label>
                  <Input
                    value={formData.tracking_url}
                    onChange={(e) => setFormData({...formData, tracking_url: e.target.value})}
                    disabled={!editing}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    disabled={!editing}
                    rows={3}
                  />
                </div>

                {!editing ? (
                  <Button type="button" onClick={() => setEditing(true)}>Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setEditing(false);
                      setFormData({
                        status: order.status,
                        tracking_number: order.tracking_number || '',
                        tracking_url: order.tracking_url || '',
                        notes: order.notes || ''
                      });
                    }}>
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Status History */}
          {order.status_history && order.status_history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.status_history.map((entry, idx) => (
                    <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded text-sm">
                      <div>
                        <div className="font-semibold">{entry.status}</div>
                        {entry.note && <div className="text-gray-600 text-xs">{entry.note}</div>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderDetail() {
  return (
    <AdminProtected>
      <AdminOrderDetailContent />
    </AdminProtected>
  );
}