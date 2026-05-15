import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const EXAMPLES = [
  { original: 200, after10: 180, final: 160 },
  { original: 250, after10: 225, final: 205 },
  { original: 300, after10: 270, final: 250 },
];

export default function CampPromo() {
  const [copied, setCopied] = useState(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function copyCode(code, idx) {
    navigator.clipboard.writeText(code);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'hello@ruglyfloor.com',
        subject: '🏕️ New Camp Promo Lead!',
        body: `Someone at the campsite wants to stay in touch!\n\nEmail: ${email}\n\nThey're interested in a custom rug. Follow up soon! 🌈`,
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 flex flex-col items-center justify-start px-4 py-10">

      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🌈🏕️✨</div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Hey Gorgeous!</h1>
        <p className="text-lg text-gray-600 mt-2 font-medium">You deserve a rug as fabulous as you are.</p>
        <p className="text-sm text-gray-500 mt-1">Custom hand-painted rugs · Made in Michigan · ruglyfloor.com</p>
      </div>

      <div className="w-full max-w-sm mb-6 bg-white rounded-2xl border-2 border-purple-200 p-5 shadow-sm">
        <p className="text-center font-black text-gray-900 text-lg mb-4">🎉 Stack BOTH Codes!</p>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-7 h-7 rounded-full bg-pink-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
          <div className="flex-1">
            <div className="font-bold text-gray-800">Apply <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-lg font-black tracking-widest">CAMP10</span></div>
            <div className="text-xs text-gray-500 mt-0.5">10% off your entire order</div>
          </div>
          <button onClick={() => copyCode('CAMP10', 0)} className="text-xs text-pink-600 font-semibold">{copied === 0 ? '✓' : 'Copy'}</button>
        </div>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-purple-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
          <div className="flex-1">
            <div className="font-bold text-gray-800">Apply <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg font-black tracking-widest">CAMP20</span></div>
            <div className="text-xs text-gray-500 mt-0.5">Extra $20 off orders $200+</div>
          </div>
          <button onClick={() => copyCode('CAMP20', 1)} className="text-xs text-purple-600 font-semibold">{copied === 1 ? '✓' : 'Copy'}</button>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Savings Examples</p>
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
              <span className="text-gray-400 line-through">${ex.original}</span>
              <span className="text-xs text-gray-400">→ 10% off →</span>
              <span className="text-gray-500">${ex.after10}</span>
              <span className="text-xs text-gray-400">→ $20 off →</span>
              <span className="font-black text-green-600">${ex.final}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm mb-6 bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-sm text-center">
        <a href="https://ruglyfloor.com/CustomBuilder" className="block w-full text-center bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-black text-base py-3 rounded-xl shadow hover:shadow-lg transition-all">
          Design My Rug ✨
        </a>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-8">
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">💌</div>
            <p className="font-bold text-gray-800">You're on the list!</p>
            <p className="text-sm text-gray-500 mt-1">Ryan will reach out soon. Go be fabulous 🌈</p>
          </div>
        ) : (
          <>
            <p className="font-bold text-gray-800 text-sm mb-1">Not ready to order yet?</p>
            <p className="text-xs text-gray-500 mb-3">Drop your email and we'll send the deal to you.</p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              <button type="submit" disabled={submitting} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-50">{submitting ? '...' : 'Send'}</button>
            </form>
          </>
        )}
      </div>

      <div className="text-center text-xs text-gray-400 space-y-1">
        <p>🏕️ Valid through May 29, 2026</p>
        <p>Made with love in Michigan 🤍</p>
      </div>
    </div>
  );
}