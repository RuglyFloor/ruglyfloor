import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, FileText, TrendingUp, LogOut, ShoppingBag, Mail, Award, DollarSign } from 'lucide-react';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';

export default function AdminPortal() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (sessionStorage.getItem('rugly_admin_auth') !== 'true') {
      navigate(createPageUrl('AdminLogin'));
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('rugly_admin_auth');
    navigate(createPageUrl('Home'));
  };

  const [orderCount, setOrderCount] = React.useState(0);

  React.useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        const orders = await base44.entities.Order.filter({ payment_status: 'paid' });
        setOrderCount(orders.length);
      } catch (error) {
        console.error('Failed to fetch order count:', error);
      }
    };
    fetchOrderCount();
  }, []);

  const adminSections = [
    {
      title: 'Catalog',
      icon: Package,
      description: 'Manage base rug inventory from suppliers',
      page: 'AdminCatalog',
      color: 'bg-purple-500'
    },
    {
      title: 'Pricing',
      icon: DollarSign,
      description: 'Configure pricing rules and fees',
      page: 'AdminPricing',
      color: 'bg-emerald-500'
    },
    {
      title: 'Orders',
      icon: ShoppingBag,
      description: 'Manage customer orders and fulfillment',
      page: 'AdminOrders',
      color: 'bg-blue-500',
      badge: orderCount
    },
    {
      title: 'Fix My Rug',
      icon: Package,
      description: 'Manage rug repair and restoration orders',
      page: 'AdminFixMyRugOrders',
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Portal</h1>
            <p className="text-gray-600">Manage your Rugly store</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link key={section.page} to={createPageUrl(section.page)}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center`}>
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{section.title}</CardTitle>
                      {section.badge > 0 && (
                        <Badge className="bg-red-600 text-white">{section.badge}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{section.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}