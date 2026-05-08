import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, ExternalLink } from 'lucide-react';

export default function QuoteView() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const quoteId = urlParams.get('id');

  useEffect(() => {
    if (!quoteId) {
      setError('No quote ID provided.');
      setLoading(false);
      return;
    }
    base44.entities.DesignQuote.get(quoteId)
      .then(data => {
        setQuote(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Quote not found or has expired.');
        setLoading(false);
      });
  }, [quoteId]);

  const handlePayNow = () => {
    if (!quote?.stripe_payment_link) return;
    // Check if in iframe
    if (window.self !== window.top) {
      alert('Checkout is only available from the published site. Please visit ruglyfloor.com to complete your payment.');
      return;
    }
    window.location.href = quote.stripe_payment_link;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Quote Not Found</h1>
          <p className="text-gray-500">{error || 'This quote link may have expired.'}</p>
        </div>
      </div>
    );
  }

  const isPaid = quote.status === 'paid' || quote.status === 'accepted';
  const hasPayLink = !!quote.stripe_payment_link;

  let description = `${quote.tier_label} Custom Rug`;
  if (quote.design_type === 'squares' && quote.squares_grid_data) {
    const g = quote.squares_grid_data;
    description = `Custom Squares — ${g.cols}×${g.rows} tiles (${g.totalSqFt} sq ft)`;
  } else if (quote.size_label) {
    description = `${quote.tier_label} Custom Rug — ${quote.size_label}`;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      {/* Logo */}
      <img
        src="https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/938135f33_RUGLYMASTERLOGOsmall.png"
        alt="Rugly"
        className="h-14 mb-8"
      />

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 text-center" style={{ backgroundColor: '#343634' }}>
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Your Custom Design Quote</p>
          <h1 className="text-white text-4xl font-black" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            {isPaid ? '✓ Paid — Thank You!' : 'Ready to Order'}
          </h1>
        </div>

        <div className="px-8 py-8 space-y-6">
          {/* Preview image */}
          {(quote.ai_preview_url || quote.image_url) && (
            <img
              src={quote.ai_preview_url || quote.image_url}
              alt="Your Design"
              className="w-full rounded-2xl border border-gray-200 object-cover"
              style={{ maxHeight: 300 }}
            />
          )}

          {/* Design details */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="text-lg font-black text-gray-800">{description}</div>
            {quote.base_color_name && <div><span className="font-semibold">Base Color:</span> {quote.base_color_name}</div>}
            {quote.paint_color_name && <div><span className="font-semibold">Paint Color:</span> {quote.paint_color_name}</div>}
            {quote.second_paint_color_name && <div><span className="font-semibold">2nd Paint Color:</span> {quote.second_paint_color_name}</div>}
            {quote.design_instructions && (
              <div><span className="font-semibold">Your Notes:</span> {quote.design_instructions}</div>
            )}
          </div>

          {/* Admin notes */}
          {quote.admin_notes && (
            <div className="bg-blue-50 rounded-xl px-4 py-3 text-sm text-blue-800 border border-blue-100">
              <span className="font-semibold">Note from our team:</span> {quote.admin_notes}
            </div>
          )}

          {/* Price */}
          {quote.quoted_price > 0 && (
            <div className="text-center rounded-2xl py-6" style={{ backgroundColor: '#343634' }}>
              <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Quote</div>
              <div className="text-white font-black text-5xl" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                ${quote.quoted_price.toFixed(2)}
              </div>
            </div>
          )}

          {/* CTA */}
          {isPaid ? (
            <div className="flex items-center justify-center gap-3 bg-green-50 rounded-2xl py-5 border border-green-200">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="font-bold text-green-800 text-lg">Payment Received — We're on it!</span>
            </div>
          ) : hasPayLink ? (
            <button
              onClick={handlePayNow}
              className="w-full py-5 rounded-2xl font-black text-white text-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#f04624', fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              💳 Pay Now — ${quote.quoted_price?.toFixed(2)}
            </button>
          ) : (
            <div className="text-center text-gray-400 text-sm py-4">
              Your quote is being finalized. You'll receive a payment link soon.
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            Secure checkout powered by Stripe · Questions?{' '}
            <a href="mailto:info@ruglyfloor.com" className="text-blue-500 underline">info@ruglyfloor.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}