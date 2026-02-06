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
import { Search, Package, ArrowLeft, Save, ExternalLink } from 'lucide-react';
import AdminProtected from '../components/AdminProtected';

function AdminFixMyRugOrdersContent() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['fix-my-rug-orders'],
    queryFn: () => base44.entities.FixMyRugOrder.list('-created_date')
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const statusHistory = [...(selectedOrder.status_history || [])];
      
      if (data.status !== selectedOrder.status) {
        statusHistory.push({
          status: data.status,
          timestamp: new Date().toISOString(),
          note: `Status updated to ${data.status}`
        });
      }

      await base44.entities.FixMyRugOrder.update(selectedOrder.id, {
        ...data,
        status_history: statusHistory
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['fix-my-rug-orders']);
      setEditing(false);
      setSelectedOrder(null);
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      pending_payment: { label: 'Pending Payment', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' },
      awaiting_shipment: { label: 'Awaiting Shipment', className: 'bg-orange-100 text-orange-800' },
      received: { label: 'Received at Studio', className: 'bg-blue-100 text-blue-800' },
      in_service: { label: 'In Service', className: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completed', className: 'bg-teal-100 text-teal-800' },
      shipped_back: { label: 'Shipped Back', className: 'bg-indigo-100 text-indigo-800' },
      delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' }
    };
    const { label, className } = config[status] || { label: status, className: 'bg-gray-100' };
    return <Badge className={className}>{label}</Badge>;
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setFormData({
      status: order.status,
      tracking_to_studio: order.tracking_to_studio || '',
      tracking_from_studio: order.tracking_from_studio || '',
      notes: order.notes || ''
    });
    setEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (selectedOrder) {
    return (
      <div className="min-h-screen py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" size="sm" onClick={() => {
            setSelectedOrder(null);
            setEditing(false);
          }} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedOrder.order_number}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Created: {new Date(selectedOrder.created_date).toLocaleString()}
                    </p>
                  </div>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer & Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Name:</strong> {selectedOrder.customer_name}</div>
                <div><strong>Email:</strong> {selectedOrder.customer_email}</div>
                <div><strong>Phone:</strong> {selectedOrder.customer_phone}</div>
                <div>
                  <strong>Return Address:</strong>
                  <div className="ml-4 text-gray-600">
                    {selectedOrder.shipping_address?.street}<br/>
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.zip}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rug Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Size:</strong> {selectedOrder.rug_size}</div>
                  <div><strong>Material:</strong> {selectedOrder.rug_material || 'Not specified'}</div>
                  <div><strong>Price:</strong> ${(selectedOrder.price / 100).toFixed(2)}</div>
                </div>
                <div>
                  <strong>Issues:</strong>
                  <div className="flex gap-2 mt-1">
                    {selectedOrder.issue_type?.map(issue => (
                      <Badge key={issue} variant="outline">{issue}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Services Requested:</strong>
                  <div className="flex gap-2 mt-1">
                    {selectedOrder.service_requested?.map(service => (
                      <Badge key={service} className="bg-blue-100 text-blue-800">{service}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Description:</strong>
                  <p className="text-gray-600 mt-1">{selectedOrder.issue_description}</p>
                </div>
                {selectedOrder.rug_photos?.length > 0 && (
                  <div>
                    <strong>Photos:</strong>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedOrder.rug_photos.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="Rug" className="w-full h-32 object-cover rounded hover:opacity-75" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
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
                        <SelectItem value="awaiting_shipment">Awaiting Shipment</SelectItem>
                        <SelectItem value="received">Received at Studio</SelectItem>
                        <SelectItem value="in_service">In Service</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="shipped_back">Shipped Back</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Customer Tracking (to studio)</Label>
                    <Input
                      value={formData.tracking_to_studio}
                      onChange={(e) => setFormData({...formData, tracking_to_studio: e.target.value})}
                      disabled={!editing}
                      placeholder="Customer's tracking number"
                    />
                  </div>

                  <div>
                    <Label>Return Tracking (from studio)</Label>
                    <Input
                      value={formData.tracking_from_studio}
                      onChange={(e) => setFormData({...formData, tracking_from_studio: e.target.value})}
                      disabled={!editing}
                      placeholder="Return shipment tracking"
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
                        Save
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Fix My Rug Orders</h1>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="awaiting_shipment">Awaiting Shipment</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="in_service">In Service</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="shipped_back">Shipped Back</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p>No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleEdit(order)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{order.order_number}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>{order.customer_name} • {order.customer_email}</div>
                        <div>Size: {order.rug_size} • ${(order.price / 100).toFixed(2)}</div>
                        <div>Services: {order.service_requested?.join(', ')}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
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

export default function AdminFixMyRugOrders() {
  return (
    <AdminProtected>
      <AdminFixMyRugOrdersContent />
    </AdminProtected>
  );
}