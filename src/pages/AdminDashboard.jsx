import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Package, ShoppingBag, Clock, CheckCircle, DollarSign, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders-stats'],
    queryFn: () => base44.entities.Order.list(),
    enabled: user?.role === 'admin'
  });

  const { data: products } = useQuery({
    queryKey: ['products-stats'],
    queryFn: () => base44.entities.Product.list(),
    enabled: user?.role === 'admin'
  });

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

  const totalRevenue = orders?.reduce((sum, order) => 
    order.status === 'paid' || order.status === 'in_production' || order.status === 'shipped' ? sum + (order.total_amount || 0) : sum, 0
  ) || 0;

  const pendingOrders = orders?.filter(o => o.status === 'pending_payment').length || 0;
  const completedOrders = orders?.filter(o => o.status === 'shipped').length || 0;
  const availableProducts = products?.filter(p => p.in_stock).length || 0;

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your Rugly business overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">${totalRevenue}</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{completedOrders}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available Ruglys</p>
                  <p className="text-3xl font-bold text-purple-600">{availableProducts}</p>
                </div>
                <Package className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to={createPageUrl('AdminOrders')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                  Manage Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Update order statuses, track production, and notify customers</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('AdminProducts')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-purple-600" />
                  Manage Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Add new original Ruglys, update prices, mark items sold</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-gray-400" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Site configuration and preferences (coming soon)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}