import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import AdminProtected from '../components/AdminProtected';

export default function AdminDocuments() {
  const [searchTerm, setSearchTerm] = useState('');
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
    }
  });

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
            <h1 className="text-3xl font-bold mb-2">Documents</h1>
            <p className="text-gray-600">Generate and manage certificates of authenticity</p>
          </div>

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
        </div>
      </div>
    </AdminProtected>
  );
}