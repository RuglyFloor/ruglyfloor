import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, FileText, TrendingUp, LogOut, ShoppingBag } from 'lucide-react';
import { createPageUrl } from '../utils';

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

  const adminSections = [
    {
      title: 'Orders',
      icon: ShoppingBag,
      description: 'Manage and track customer orders',
      page: 'AdminOrders',
      color: 'bg-blue-500'
    },
    {
      title: 'Products',
      icon: Package,
      description: 'Manage product inventory',
      page: 'AdminProducts',
      color: 'bg-purple-500'
    },
    {
      title: 'Content',
      icon: FileText,
      description: 'Manage blog posts and content',
      page: 'ContentManager',
      color: 'bg-green-500'
    },
    {
      title: 'SEO',
      icon: TrendingUp,
      description: 'Optimize search engine visibility',
      page: 'AdminSEO',
      color: 'bg-orange-500'
    },
    {
      title: 'Dashboard',
      icon: TrendingUp,
      description: 'View analytics and metrics',
      page: 'AdminDashboard',
      color: 'bg-indigo-500'
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
                    <CardTitle>{section.title}</CardTitle>
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