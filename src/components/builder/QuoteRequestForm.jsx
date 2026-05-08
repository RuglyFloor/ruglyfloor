import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

export default function QuoteRequestForm({ quoteData, tierColor, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await base44.functions.invoke('requestDesignQuote', {
        ...quoteData,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl p-8 text-center border-4" style={{ borderColor: tierColor, backgroundColor: `${tierColor}10` }}>
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: tierColor }} />
        <div className="text-2xl font-black mb-2" style={{ color: tierColor, fontFamily: 'Barlow Condensed, sans-serif' }}>
          Quote Request Sent!
        </div>
        <p className="text-gray-600">We'll review your design and send you a quote within 1–2 business days.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 border-4" style={{ borderColor: tierColor, backgroundColor: `${tierColor}08` }}>
      <h3 className="text-xl font-black mb-1" style={{ color: tierColor, fontFamily: 'Barlow Condensed, sans-serif' }}>
        Request Your Quote
      </h3>
      <p className="text-sm text-gray-500 mb-4">We'll review your design and get back to you within 1–2 business days.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name *"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none"
          style={{ borderColor: `${tierColor}40` }}
        />
        <input
          type="email"
          placeholder="Email address *"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none"
          style={{ borderColor: `${tierColor}40` }}
        />
        <input
          type="tel"
          placeholder="Phone (optional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none"
          style={{ borderColor: `${tierColor}40` }}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 font-black text-white py-4 rounded-2xl text-xl transition-all"
          style={{ backgroundColor: tierColor, fontFamily: 'Barlow Condensed, sans-serif', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {loading ? 'Sending...' : 'Send Quote Request'}
        </button>
      </form>
    </div>
  );
}