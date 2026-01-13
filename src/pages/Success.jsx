import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';

export default function Success() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    if (sid) {
      setSessionId(sid);
    }
  }, []);

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-green-50 to-blue-50">
      <SEOHead
        title="Order Successful - Rugly Floors"
        description="Your custom rug order has been received and confirmed."
        url="/success"
      />

      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-2">Thank you for your purchase.</p>
          <p className="text-gray-500">A confirmation email has been sent to your email address.</p>
        </div>

        {sessionId && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <p className="text-sm text-gray-600 mb-2">Session ID:</p>
            <p className="font-mono text-sm text-gray-400 break-all">{sessionId}</p>
          </div>
        )}

        {/* Order Timeline */}
        <div className="bg-white rounded-lg p-8 border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">What Happens Next?</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Production</h3>
                <p className="text-gray-600 text-sm">Your rug will begin production within 1-2 business days. We'll send you updates along the way.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Hand-Painted</h3>
                <p className="text-gray-600 text-sm">Our artists will carefully hand-paint your custom design. This typically takes 2-3 weeks.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Shipped</h3>
                <p className="text-gray-600 text-sm">Once complete, your rug will be carefully packaged and shipped to you. You'll receive tracking information.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Home className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Delivered</h3>
                <p className="text-gray-600 text-sm">Your beautiful custom rug arrives at your home. Time to enjoy your unique piece of art!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Questions?</h3>
          <p className="text-gray-600 mb-4">Our team is here to help with any questions about your order.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="tel:5177778474">
              <Button variant="outline">Call Us: (517) 777-8474</Button>
            </a>
            <a href="mailto:contact@ruglyfloor.com">
              <Button variant="outline">Email Us</Button>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button 
            onClick={() => navigate(createPageUrl('Home'))}
            variant="outline"
          >
            Back to Home
          </Button>
          <Button 
            onClick={() => navigate(createPageUrl('CustomBuilder'))}
          >
            Design Another Rug
          </Button>
        </div>
      </div>
    </div>
  );
}