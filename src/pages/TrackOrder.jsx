import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, Paintbrush, Truck, CheckCircle, ExternalLink, Search } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  pending: { label: 'Payment Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800', progress: 0 },
  rug_ordered: { label: 'Order Confirmed', icon: Package, color: 'bg-blue-100 text-blue-800', progress: 25 },
  in_production: { label: 'In Production', icon: Clock, color: 'bg-purple-100 text-purple-800', progress: 50 },
  painting: { label: 'Hand Painting', icon: Paintbrush, color: 'bg-indigo-100 text-indigo-800', progress: 75 },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-green-100 text-green-800', progress: 90 },
  completed: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-200 text-green-900', progress: 100 },
  cancelled: { label: 'Cancelled', icon: Clock, color: 'bg-red-100 text-red-800', progress: 0 }
};

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const orderFromUrl = searchParams.get('order');
  const [orderNumber, setOrderNumber] = useState(orderFromUrl || '');
  const [searchAttempted, setSearchAttempted] = useState(!!orderFromUrl);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['track-order', orderNumber],
    queryFn: () => base44.entities.Order.filter({ order_number: orderNumber }),
    enabled: searchAttempted && !!orderNumber,
  });

  const order = orders?.[0];
  const statusConfig = STATUS_CONFIG[order?.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchAttempted(true);
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order number to see real-time updates</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter order number (e.g., ORD-12345)"
                className="text-lg"
              />
              <Button type="submit" disabled={!orderNumber || isLoading}>
                <Search className="w-4 h-4 mr-2" />
                Track
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching for your order...</p>
            </CardContent>
          </Card>
        )}

        {searchAttempted && !isLoading && !order && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="text-gray-600">
                We couldn't find an order with that number. Please check and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {order && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Order #{order.order_number}</CardTitle>
                    <p className="text-gray-500 mt-1">
                      Placed on {format(new Date(order.created_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">{statusConfig.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${statusConfig.progress}%` }}
                    />
                  </div>
                </div>

                {/* Timeline */}
                {order.status_history && order.status_history.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Status History</h3>
                    <div className="space-y-3">
                      {order.status_history.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium">{STATUS_CONFIG[item.status]?.label || item.status}</div>
                            <div className="text-sm text-gray-600">
                              {format(new Date(item.timestamp), 'MMM d, yyyy h:mm a')}
                            </div>
                            {item.note && (
                              <div className="text-sm text-gray-700 mt-1">{item.note}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimated Completion */}
                {order.estimated_completion && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-blue-900">
                      📅 Estimated Completion: {format(new Date(order.estimated_completion), 'MMMM d, yyyy')}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Custom Cruglys typically take 30 days to complete
                    </p>
                  </div>
                )}

                {/* Tracking Info */}
                {order.tracking_number && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="font-semibold text-green-900 mb-2">📦 Shipping Information</p>
                    <p className="text-sm text-green-800">
                      Tracking Number: <span className="font-mono font-bold">{order.tracking_number}</span>
                    </p>
                    {order.tracking_url && (
                      <a 
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-semibold mt-2"
                      >
                        Track Package
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                        {item.preview_url && (
                          <img 
                            src={item.preview_url} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                          {item.base_color && (
                            <p className="text-sm text-gray-600">Base Color: {item.base_color}</p>
                          )}
                        </div>
                        <div className="font-bold text-blue-600">${item.price}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-blue-600">${order.total_amount}</span>
                </div>

                {order.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-900">Notes:</p>
                    <p className="text-sm text-yellow-800 mt-1">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">
                  Questions about your order?
                </p>
                <div className="text-sm space-y-1">
                  <p>📧 orders@ruglyfloor.com</p>
                  <p>📞 (517) 777-8474</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}