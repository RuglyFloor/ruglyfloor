import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminProtected from '@/components/AdminProtected';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, DollarSign, ChevronDown, ChevronUp, Mail, ExternalLink } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', icon: Clock },
  quoted: { label: 'Quoted', color: '#4075ff', icon: DollarSign },
  accepted: { label: 'Accepted', color: '#24f0a0', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: '#f04624', icon: XCircle },
};

function QuoteCard({ quote, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState(quote.quoted_price || '');
  const [adminNotes, setAdminNotes] = useState(quote.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const cfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DesignQuote.update(quote.id, {
      quoted_price: parseFloat(quotedPrice) || 0,
      admin_notes: adminNotes,
    });
    onUpdate();
    setSaving(false);
  };

  const handleStatus = async (status) => {
    await base44.entities.DesignQuote.update(quote.id, { status });
    onUpdate();
  };

  const handleSendQuote = async () => {
    if (!quotedPrice) return alert('Set a quoted price first.');
    setSendingEmail(true);
    await base44.entities.DesignQuote.update(quote.id, {
      status: 'quoted',
      quoted_price: parseFloat(quotedPrice),
      quote_sent_at: new Date().toISOString(),
    });
    await base44.integrations.Core.SendEmail({
      to: quote.customer_email,
      from_name: 'Rugly Floor',
      subject: `Your Custom Rugly Quote — $${quotedPrice}`,
      body: `
Hi ${quote.customer_name},

Great news — we've reviewed your custom ${quote.tier_label} design and we're ready to bring it to life!

Your Quote: $${quotedPrice}
${quote.size_label ? `Size: ${quote.size_label}` : ''}
${quote.design_instructions ? `Your notes: "${quote.design_instructions}"` : ''}

${adminNotes ? `From our team: ${adminNotes}` : ''}

Ready to move forward? Reply to this email or visit ruglyfloor.com to place your order.

— The Rugly Team
      `.trim(),
    });
    onUpdate();
    setSendingEmail(false);
    alert('Quote email sent!');
  };

  return (
    <div className="bg-white rounded-2xl border-2 overflow-hidden" style={{ borderColor: `${cfg.color}40` }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
        style={{ backgroundColor: `${cfg.color}08` }}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" style={{ color: cfg.color }} />
          <div>
            <div className="font-black text-base" style={{ color: '#343634' }}>{quote.customer_name}</div>
            <div className="text-xs text-gray-500">{quote.customer_email} · {quote.tier_label} {quote.design_type === 'squares' ? '(Squares)' : quote.size_label ? `· ${quote.size_label}` : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
          {quote.estimated_price > 0 && <span className="text-sm font-black text-gray-600">~${quote.estimated_price}</span>}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 py-4 space-y-4 border-t border-gray-100">
          {/* Design preview */}
          <div className="flex gap-4">
            {quote.ai_preview_url && (
              <img src={quote.ai_preview_url} alt="AI Preview" className="w-28 h-28 object-cover rounded-xl border border-gray-200 flex-shrink-0" />
            )}
            {!quote.ai_preview_url && quote.image_url && (
              <img src={quote.image_url} alt="Upload" className="w-28 h-28 object-cover rounded-xl border border-gray-200 flex-shrink-0" />
            )}
            <div className="space-y-1 text-sm text-gray-600">
              {quote.base_color_name && <div><span className="font-semibold">Base:</span> {quote.base_color_name}</div>}
              {quote.paint_color_name && <div><span className="font-semibold">Paint:</span> {quote.paint_color_name}</div>}
              {quote.second_paint_color_name && <div><span className="font-semibold">2nd Paint:</span> {quote.second_paint_color_name}</div>}
              {quote.customer_phone && <div><span className="font-semibold">Phone:</span> {quote.customer_phone}</div>}
              {quote.design_instructions && <div><span className="font-semibold">Instructions:</span> {quote.design_instructions}</div>}
              {quote.squares_grid_data && (
                <div><span className="font-semibold">Grid:</span> {quote.squares_grid_data.cols}×{quote.squares_grid_data.rows} tiles · {quote.squares_grid_data.totalSqFt} sq ft</div>
              )}
              {quote.image_url && (
                <a href={quote.image_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 text-xs">
                  <ExternalLink className="w-3 h-3" /> View Upload
                </a>
              )}
            </div>
          </div>

          {/* Admin controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Quoted Price ($)</label>
              <input
                type="number"
                value={quotedPrice}
                onChange={e => setQuotedPrice(e.target.value)}
                placeholder="e.g. 349"
                className="w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none border-gray-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Admin Notes</label>
              <input
                type="text"
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Internal notes..."
                className="w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none border-gray-200"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={handleSave} disabled={saving} className="text-sm font-bold px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
              {saving ? 'Saving...' : 'Save Notes & Price'}
            </button>
            <button
              onClick={handleSendQuote}
              disabled={sendingEmail}
              className="text-sm font-bold px-4 py-2 rounded-xl text-white flex items-center gap-1 transition-colors"
              style={{ backgroundColor: '#4075ff' }}
            >
              <Mail className="w-4 h-4" /> {sendingEmail ? 'Sending...' : 'Send Quote Email'}
            </button>
            {quote.status !== 'accepted' && (
              <button onClick={() => handleStatus('accepted')} className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: '#24f0a0', color: '#343634' }}>
                Mark Accepted
              </button>
            )}
            {quote.status !== 'rejected' && (
              <button onClick={() => handleStatus('rejected')} className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: '#f04624' }}>
                Mark Rejected
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.DesignQuote.list('-created_date', 100);
    setQuotes(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? quotes : quotes.filter(q => q.status === filter);
  const counts = {
    all: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    quoted: quotes.filter(q => q.status === 'quoted').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
  };

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black mb-1" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#343634' }}>Design Quotes</h1>
          <p className="text-gray-500 mb-6">Review, price, and send quotes to customers.</p>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'pending', 'quoted', 'accepted', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-4 py-2 rounded-xl font-bold text-sm capitalize transition-all"
                style={{
                  backgroundColor: filter === s ? '#343634' : '#fff',
                  color: filter === s ? '#fff' : '#343634',
                  border: '2px solid #e5e7eb',
                }}
              >
                {s} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-20">No {filter !== 'all' ? filter : ''} quotes yet.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(q => <QuoteCard key={q.id} quote={q} onUpdate={load} />)}
            </div>
          )}
        </div>
      </div>
    </AdminProtected>
  );
}