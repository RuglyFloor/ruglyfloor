import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Loader2, CheckCircle, AlertCircle, Mail, Send } from 'lucide-react';
import AdminProtected from '../components/AdminProtected';
import { toast } from 'sonner';

export default function AdminDocuments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [emailType, setEmailType] = useState('confirmation');
  const [customMessage, setCustomMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders-documents'],
    queryFn: () => base44.entities.Order.list('-created_date')
  });

  const generateCertificateMutation = useMutation({
    mutationFn: async (orderId) => {
      const response = await base44.functions.invoke('generateCertificate', { order_id: orderId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders-documents'] });
      toast.success('Certificate generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate certificate');
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ orderId, type, message }) => {
      if (type === 'confirmation') {
        const response = await base44.functions.invoke('sendOrderConfirmation', { order_id: orderId });
        return response.data;
      } else if (type === 'status') {
        const response = await base44.functions.invoke('sendStatusUpdate', { 
          order_id: orderId,
          custom_message: message 
        });
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success('Email sent successfully');
      setSelectedOrder(null);
      setCustomMessage('');
    },
    onError: () => {
      toast.error('Failed to send email');
    }
  });

  const emailTemplates = [
    {
      type: 'confirmation',
      name: 'Order Confirmation',
      description: 'Sent when order is placed and payment is received'
    },
    {
      type: 'status',
      name: 'Status Update',
      description: 'Send custom status updates to customers'
    },
    {
      type: 'shipping',
      name: 'Shipping Notification',
      description: 'Notify customer when order ships with tracking'
    },
    {
      type: 'completed',
      name: 'Order Completed',
      description: 'Sent when order is delivered'
    }
  ];

  const filteredOrders = orders.filter(order => 
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Documents & Communications</h1>
            <p className="text-gray-600">Generate certificates and send customer emails</p>
          </div>

          <Tabs defaultValue="certificates" className="mb-6">
            <TabsList>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="emails">Email Templates</TabsTrigger>
            </TabsList>

            {/* Certificates Tab */}
            <TabsContent value="certificates">

              {/* Search */}
              <div className="mb-6">
                <Input
                  placeholder="Search by customer name, email, or order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {order.customer_name || 'No Name'}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              Order: {order.order_number || order.id?.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.customer_email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.certificate_url ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <a 
                                  href={order.certificate_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </Button>
                                </a>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => generateCertificateMutation.mutate(order.id)}
                                disabled={generateCertificateMutation.isPending}
                              >
                                {generateCertificateMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Generate Certificate
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Items:</span>
                            <div className="font-semibold">
                              {order.items?.map((item, idx) => (
                                <div key={idx}>
                                  {item.size} {item.qualityLabel || 'Rug'}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Total:</span>
                            <div className="font-semibold">${order.total_amount}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <div className="font-semibold">
                              {new Date(order.created_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No orders found</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Email Templates Tab */}
            <TabsContent value="emails">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {emailTemplates.map((template) => (
                  <Card key={template.type}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEmailType(template.type);
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Send Email Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Send Customer Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Order</label>
                    <select 
                      className="w-full border rounded-md p-2"
                      value={selectedOrder?.id || ''}
                      onChange={(e) => {
                        const order = orders.find(o => o.id === e.target.value);
                        setSelectedOrder(order);
                      }}
                    >
                      <option value="">Choose an order...</option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          {order.customer_name} - {order.order_number || order.id?.slice(0, 8)} - {order.customer_email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedOrder && (
                    <>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email Type</label>
                        <select 
                          className="w-full border rounded-md p-2"
                          value={emailType}
                          onChange={(e) => setEmailType(e.target.value)}
                        >
                          {emailTemplates.map((template) => (
                            <option key={template.type} value={template.type}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {emailType === 'status' && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">Custom Message</label>
                          <Textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Add a personal message for the customer..."
                            rows={4}
                          />
                        </div>
                      )}

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Email Preview</h4>
                        <p className="text-sm text-gray-600">To: {selectedOrder.customer_email}</p>
                        <p className="text-sm text-gray-600">Subject: {
                          emailType === 'confirmation' ? 'Order Confirmation' :
                          emailType === 'status' ? 'Order Status Update' :
                          emailType === 'shipping' ? 'Your Order Has Shipped' :
                          'Order Completed'
                        }</p>
                      </div>

                      <Button
                        onClick={() => sendEmailMutation.mutate({
                          orderId: selectedOrder.id,
                          type: emailType,
                          message: customMessage
                        })}
                        disabled={sendEmailMutation.isPending}
                        className="w-full"
                      >
                        {sendEmailMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Email
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminProtected>
  );
}