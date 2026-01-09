import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Package, Clock, Paintbrush, Truck, CheckCircle, XCircle, Mail } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending Payment', icon: Clock, color: 'text-gray-500' },
  rug_ordered: { label: 'Rug Ordered', icon: Package, color: 'text-blue-600' },
  in_production: { label: 'In Production', icon: Clock, color: 'text-yellow-600' },
  painting: { label: 'Painting', icon: Paintbrush, color: 'text-purple-600' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-green-600' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-green-700' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500' }
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    enabled: user?.role === 'admin'
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, data }) => base44.entities.Order.update(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setEditingOrder(null);
      setNewStatus('');
      setNotes('');
    }
  });

  const sendStatusUpdateEmail = async (order, newStatus, tracking) => {
    const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
    await base44.functions.invoke('sendStatusUpdate', {
      email: order.customer_email,
      orderNumber: order.order_number,
      status: statusLabel,
      customerName: order.customer_name,
      trackingNumber: tracking?.number,
      trackingUrl: tracking?.url
    });
  };

  const handleUpdateStatus = async (order) => {
    if (!newStatus) return;
    
    const updateData = { 
      status: newStatus,
      status_history: [
        ...(order.status_history || []),
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: notes
        }
      ]
    };
    
    if (notes) {
      updateData.notes = notes;
    }
    
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }
    
    if (trackingUrl) {
      updateData.tracking_url = trackingUrl;
    }

    await updateOrderMutation.mutateAsync({ orderId: order.id, data: updateData });
    
    // Send email notification
    try {
      await sendStatusUpdateEmail(order, newStatus, {
        number: trackingNumber,
        url: trackingUrl
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Order Management</h1>
          <p className="text-gray-600">Update order statuses and track production</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orders?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No orders yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders?.map((order) => {
              const StatusIcon = STATUS_CONFIG[order.status]?.icon || Package;
              const isEditing = editingOrder === order.id;

              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">Order #{order.order_number}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <StatusIcon className={`w-5 h-5 ${STATUS_CONFIG[order.status]?.color}`} />
                          <span className={`font-semibold ${STATUS_CONFIG[order.status]?.color}`}>
                            {STATUS_CONFIG[order.status]?.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {new Date(order.created_date).toLocaleDateString()}
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${order.total_amount}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Customer Information
                        </h3>
                        <div className="text-sm space-y-1">
                          <div><strong>Name:</strong> {order.customer_name}</div>
                          <div><strong>Email:</strong> {order.customer_email}</div>
                          {order.customer_phone && (
                            <div><strong>Phone:</strong> {order.customer_phone}</div>
                          )}
                          {order.shipping_address && (
                            <div className="mt-2">
                              <strong>Shipping:</strong><br />
                              {order.shipping_address.street}<br />
                              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold mb-2">Order Items</h3>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-3 text-sm">
                              {item.preview_url && (
                                <img src={item.preview_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
                              )}
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-gray-600">Size: {item.size}</div>
                                {item.base_color && <div className="text-gray-600">Base: {item.base_color}</div>}
                                <div className="text-blue-600 font-semibold">${item.price}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <strong className="text-sm">Notes:</strong>
                        <p className="text-sm text-gray-700 mt-1">{order.notes}</p>
                      </div>
                    )}

                    {/* Status Update Form */}
                    <div className="mt-6 border-t pt-6">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <Label>Update Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select new status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rug_ordered">Rug Ordered</SelectItem>
                                <SelectItem value="in_production">In Production</SelectItem>
                                <SelectItem value="painting">Painting</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {newStatus === 'shipped' && (
                            <>
                              <div>
                                <Label>Tracking Number</Label>
                                <input
                                  type="text"
                                  value={trackingNumber}
                                  onChange={(e) => setTrackingNumber(e.target.value)}
                                  placeholder="1Z999AA10123456784"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div>
                                <Label>Tracking URL</Label>
                                <input
                                  type="url"
                                  value={trackingUrl}
                                  onChange={(e) => setTrackingUrl(e.target.value)}
                                  placeholder="https://www.ups.com/track?..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                              </div>
                            </>
                          )}
                          <div>
                            <Label>Additional Notes (Optional)</Label>
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add any additional information..."
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdateStatus(order)} disabled={!newStatus}>
                              Save & Notify Customer
                            </Button>
                            <Button variant="outline" onClick={() => {
                              setEditingOrder(null);
                              setNewStatus('');
                              setNotes('');
                            }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button onClick={() => {
                          setEditingOrder(order.id);
                          setNewStatus(order.status);
                          setNotes(order.notes || '');
                          setTrackingNumber(order.tracking_number || '');
                          setTrackingUrl(order.tracking_url || '');
                        }}>
                          Update Status
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}