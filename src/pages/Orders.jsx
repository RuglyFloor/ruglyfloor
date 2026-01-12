import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import SEOHead from '../components/seo/SEOHead';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  rug_ordered: 'bg-blue-100 text-blue-800',
  in_production: 'bg-purple-100 text-purple-800',
  painting: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function Orders() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => {
      if (user?.role === 'admin') {
        return base44.entities.Order.list('-created_date');
      }
      return base44.entities.Order.filter({ customer_email: user?.email }, '-created_date');
    },
    enabled: !!user,
    initialData: []
  });

  return (
    <div className="min-h-screen py-12 px-6">
      <SEOHead
        title="Rugly Floor - My Orders"
        description="Track your custom rug orders and view order history."
        url="/orders"
      />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          {user?.role === 'admin' ? 'All Orders' : 'My Orders'}
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-600">Your orders will appear here once you make a purchase</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{order.order_number}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.created_date), 'MMM d, yyyy')}
                      </p>
                      {user?.role === 'admin' && (
                        <p className="text-sm text-gray-600 mt-1">
                          Customer: {order.customer_name} ({order.customer_email})
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={statusColors[order.status]}>
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                      <p className="text-2xl font-bold text-purple-600 mt-2">
                        ${order.total_amount}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                          {item.baseColor && <p className="text-sm text-gray-600">Base: {item.baseColor}</p>}
                        </div>
                        <div className="font-bold">${item.price}</div>
                      </div>
                    ))}
                  </div>
                  
                  {order.shipping_address && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Shipping Address:</p>
                      <p className="text-sm text-blue-800">
                        {order.shipping_address.street}<br />
                        {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                      </p>
                    </div>
                  )}

                  {order.tracking_number && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-semibold text-green-900 mb-1">📦 Tracking Information:</p>
                      <p className="text-sm text-green-800 font-mono">{order.tracking_number}</p>
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

                  <div className="mt-4">
                    <Link 
                      to={`/track?order=${order.order_number}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm inline-flex items-center gap-1"
                    >
                      View Detailed Tracking
                      <ExternalLink className="w-3 h-3" />
                    </Link>
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