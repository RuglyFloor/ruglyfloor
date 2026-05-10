import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { markCartConversion } from '../hooks/useCartAbandonment';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, CheckCircle2, Package, Truck, Home } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { base44 } from '@/api/base44Client';

export default function Success() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');
  const [orderInfo, setOrderInfo] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    // Mark conversion so abandonment hook doesn't fire
    markCartConversion();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    const qid = params.get('quote_id');

    if (sid) {
      setSessionId(sid);
      base44.functions.invoke('getOrderInfoForReview', { session_id: sid })
        .then(res => { if (res.data) setOrderInfo(res.data); })
        .catch(() => {});
    }

    if (qid) {
      setQuoteLoading(true);
      base44.entities.DesignQuote.get(qid)
        .then(data => { setQuote(data); setQuoteLoading(false); })
        .catch(() => setQuoteLoading(false));
    }
  }, []);

  // Inject Google Customer Reviews opt-in once order info is available
  useEffect(() => {
    if (!orderInfo) return;

    // Load the Google platform script
    const script1 = document.createElement('script');
    script1.src = 'https://apis.google.com/js/platform.js?onload=renderOptIn';
    script1.async = true;
    script1.defer = true;
    document.body.appendChild(script1);

    window.renderOptIn = function() {
      window.gapi.load('surveyoptin', function() {
        window.gapi.surveyoptin.render({
          merchant_id: 5730355041,
          order_id: orderInfo.order_id,
          email: orderInfo.email,
          delivery_country: orderInfo.country || 'US',
          estimated_delivery_date: orderInfo.estimated_delivery_date
        });
      });
    };

    return () => {
      document.body.removeChild(script1);
      delete window.renderOptIn;
    };
  }, [orderInfo]);

  // If this was a quote payment, show the same branded quote confirmation
  if (quoteLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (quote) {
    let description = `${quote.tier_label} Custom Rug`;
    if (quote.design_type === 'squares' && quote.squares_grid_data) {
      const g = quote.squares_grid_data;
      description = `Custom Squares — ${g.cols}×${g.rows} tiles (${g.totalSqFt} sq ft)`;
    } else if (quote.size_label) {
      description = `${quote.tier_label} Custom Rug — ${quote.size_label}`;
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <img src="https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/938135f33_RUGLYMASTERLOGOsmall.png" alt="Rugly" className="h-14 mb-8" />
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 text-center" style={{ backgroundColor: '#343634' }}>
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Your Custom Design Quote</p>
            <h1 className="text-white text-4xl font-black" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>✓ Paid — Thank You!</h1>
          </div>
          <div className="px-8 py-8 space-y-6">
            {(quote.ai_preview_url || quote.image_url) && (
              <img src={quote.ai_preview_url || quote.image_url} alt="Your Design" className="w-full rounded-2xl border border-gray-200 object-cover" style={{ maxHeight: 300 }} />
            )}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="text-lg font-black text-gray-800">{description}</div>
              {quote.base_color_name && <div><span className="font-semibold">Base Color:</span> {quote.base_color_name}</div>}
              {quote.paint_color_name && <div><span className="font-semibold">Paint Color:</span> {quote.paint_color_name}</div>}
              {quote.second_paint_color_name && <div><span className="font-semibold">2nd Paint Color:</span> {quote.second_paint_color_name}</div>}
              {quote.design_instructions && <div><span className="font-semibold">Your Notes:</span> {quote.design_instructions}</div>}
            </div>
            {quote.admin_notes && (
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-800 border border-blue-100">
                <span className="font-semibold">Note from our team:</span> {quote.admin_notes}
              </div>
            )}
            {quote.quoted_price > 0 && (
              <div className="text-center rounded-2xl py-6" style={{ backgroundColor: '#343634' }}>
                <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">Amount Paid</div>
                <div className="text-white font-black text-5xl" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>${quote.quoted_price.toFixed(2)}</div>
              </div>
            )}
            <div className="flex items-center justify-center gap-3 bg-green-50 rounded-2xl py-5 border border-green-200">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="font-bold text-green-800 text-lg">Payment Received — We're on it!</span>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-500">Our artists will begin production. We'll email you updates every step of the way.</p>
              <p className="text-xs text-gray-400">
                Questions? <a href="mailto:info@ruglyfloor.com" className="text-blue-500 underline">info@ruglyfloor.com</a> · <a href="tel:5177778474" className="text-blue-500 underline">(517) 777-8474</a>
              </p>
            </div>
            <button onClick={() => navigate('/')} className="w-full py-3 rounded-2xl font-black text-gray-700 border-2 border-gray-200 hover:bg-gray-50 transition-colors" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

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