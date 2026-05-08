import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AdminProtected from '@/components/AdminProtected';
import { CheckCircle2, Clock, XCircle, DollarSign, ChevronDown, ChevronUp, Mail, ExternalLink, Grid, Loader2, CreditCard, Plus, X } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', icon: Clock },
  quoted: { label: 'Quoted', color: '#4075ff', icon: DollarSign },
  accepted: { label: 'Accepted', color: '#24f0a0', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: '#f04624', icon: XCircle },
  paid: { label: 'Paid', color: '#10b981', icon: CheckCircle2 },
};

function QuoteCard({ quote, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState(quote.quoted_price || '');
  const [adminNotes, setAdminNotes] = useState(quote.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [processingCutouts, setProcessingCutouts] = useState(false);
  const [cutoutResult, setCutoutResult] = useState(null);

  const cfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const isSquares = quote.design_type === 'squares';

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

  const handleSendQuoteWithPayment = async () => {
    if (!quotedPrice || parseFloat(quotedPrice) <= 0) {
      alert('Set a quoted price first.');
      return;
    }
    setSendingQuote(true);
    // First save the price and notes
    await base44.entities.DesignQuote.update(quote.id, {
      quoted_price: parseFloat(quotedPrice),
      admin_notes: adminNotes,
    });
    try {
      const res = await base44.functions.invoke('sendQuoteWithPayment', { quote_id: quote.id });
      if (res.data?.success) {
        alert(`✅ Quote sent to ${quote.customer_email} with Stripe Pay Now link!`);
        onUpdate();
      } else {
        alert('Error: ' + (res.data?.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to send quote: ' + err.message);
    }
    setSendingQuote(false);
  };

  const handleProcessCutouts = async () => {
    setProcessingCutouts(true);
    setCutoutResult(null);
    try {
      const res = await base44.functions.invoke('processSquaresCutouts', { quote_id: quote.id });
      if (res.data?.success) {
        setCutoutResult(res.data);
        onUpdate();
      } else {
        alert('Error: ' + (res.data?.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to process cutouts: ' + err.message);
    }
    setProcessingCutouts(false);
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
            <div className="text-xs text-gray-500">
              {quote.customer_email} · {quote.tier_label}
              {isSquares ? ' (Squares)' : quote.size_label ? ` · ${quote.size_label}` : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>
            {cfg.label}
          </span>
          {quote.quoted_price > 0 && <span className="text-sm font-black text-gray-700">${quote.quoted_price}</span>}
          {quote.estimated_price > 0 && !quote.quoted_price && <span className="text-sm font-black text-gray-400">~${quote.estimated_price}</span>}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 py-4 space-y-4 border-t border-gray-100">
          {/* Design preview */}
          <div className="flex gap-4">
            {(quote.ai_preview_url || quote.image_url) && (
              <img
                src={quote.ai_preview_url || quote.image_url}
                alt="Design"
                className="w-28 h-28 object-cover rounded-xl border border-gray-200 flex-shrink-0"
              />
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
              {quote.stripe_payment_link && (
                <a href={quote.stripe_payment_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <CreditCard className="w-3 h-3" /> View Payment Link
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
              <label className="text-xs font-bold text-gray-500 block mb-1">Admin Notes (included in email)</label>
              <input
                type="text"
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="e.g. Colors may vary slightly..."
                className="w-full border-2 rounded-xl px-3 py-2 text-sm focus:outline-none border-gray-200"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-bold px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Notes & Price'}
            </button>

            {/* Primary CTA: Send Quote with Stripe Pay Now */}
            <button
              onClick={handleSendQuoteWithPayment}
              disabled={sendingQuote || !quotedPrice}
              className="text-sm font-bold px-5 py-2 rounded-xl text-white flex items-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#f04624' }}
            >
              {sendingQuote ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {sendingQuote ? 'Sending...' : 'Send Quote + Pay Link'}
            </button>

            {quote.status !== 'accepted' && quote.status !== 'paid' && (
              <button
                onClick={() => handleStatus('accepted')}
                className="text-sm font-bold px-4 py-2 rounded-xl font-bold"
                style={{ backgroundColor: '#24f0a0', color: '#343634' }}
              >
                Mark Accepted
              </button>
            )}
            {quote.status !== 'rejected' && (
              <button
                onClick={() => handleStatus('rejected')}
                className="text-sm font-bold px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: '#6b7280' }}
              >
                Mark Rejected
              </button>
            )}
          </div>

          {/* Squares Cutout Processing */}
          {isSquares && (
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-gray-700">Tile Cutout Processing</div>
                  <div className="text-xs text-gray-400">
                    Generates per-tile crop coordinates (24″×24″ each) for production.
                    {quote.cutouts_processed_at && (
                      <span className="text-green-600 ml-2">✓ Last processed {new Date(quote.cutouts_processed_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleProcessCutouts}
                  disabled={processingCutouts}
                  className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl text-white flex-shrink-0"
                  style={{ backgroundColor: '#4075ff' }}
                >
                  {processingCutouts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Grid className="w-4 h-4" />}
                  {processingCutouts ? 'Processing...' : 'Process Cutouts'}
                </button>
              </div>

              {/* Cutout result summary */}
              {cutoutResult && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                  <div className="font-bold text-gray-800">✓ {cutoutResult.painted_tiles} painted tiles mapped across {cutoutResult.total_tiles} total</div>
                  <div>Source image: {cutoutResult.source_image_dimensions?.width}×{cutoutResult.source_image_dimensions?.height}px</div>
                  <div>Each tile: {cutoutResult.tile_pixel_size?.width}×{cutoutResult.tile_pixel_size?.height}px = 24″×24″</div>
                  {cutoutResult.color_breakdown && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(cutoutResult.color_breakdown).map(([color, count]) => (
                        <span key={color} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200">
                          <span className="w-3 h-3 rounded-full inline-block border border-gray-300" style={{ backgroundColor: color }} />
                          {count} tiles
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Show existing cutouts */}
              {!cutoutResult && quote.tile_cutouts?.length > 0 && (
                <div className="text-xs text-gray-500">
                  {quote.tile_cutouts.length} tile positions stored · {quote.tile_cutouts.filter(t => t.is_painted).length} painted
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TIER_OPTIONS = ['Crugly', 'Rugly', 'Rugly LX', 'Squares'];
const SIZE_OPTIONS = ["2' × 3'", "3' × 5'", "4' × 6'", "5' × 7'", "6' × 9'", "9' × 12'", 'Custom'];

function NewQuoteModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    design_type: 'rug',
    tier_id: 'crugly',
    tier_label: 'Crugly',
    size_label: '',
    base_color_name: '',
    paint_color_name: '',
    design_instructions: '',
    quoted_price: '',
    admin_notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTierChange = (label) => {
    const id = label.toLowerCase().replace(' ', '_');
    set('tier_label', label);
    set('tier_id', id);
    set('design_type', label === 'Squares' ? 'squares' : 'rug');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_email) return alert('Name and email are required.');
    setSaving(true);
    await base44.entities.DesignQuote.create({
      ...form,
      quoted_price: form.quoted_price ? parseFloat(form.quoted_price) : undefined,
      status: form.quoted_price ? 'quoted' : 'pending',
    });
    onCreated();
    onClose();
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-black" style={{ color: '#343634' }}>New Quote</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Customer Info */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Customer Name *</label>
              <input value={form.customer_name} onChange={e => set('customer_name', e.target.value)} required
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="Jane Smith" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Email *</label>
                <input type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} required
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="jane@email.com" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Phone</label>
                <input value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="(555) 000-0000" />
              </div>
            </div>
          </div>

          {/* Tier */}
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2">Quality Tier</label>
            <div className="flex flex-wrap gap-2">
              {TIER_OPTIONS.map(t => (
                <button type="button" key={t} onClick={() => handleTierChange(t)}
                  className="px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all"
                  style={{
                    borderColor: form.tier_label === t ? '#343634' : '#e5e7eb',
                    backgroundColor: form.tier_label === t ? '#343634' : '#fff',
                    color: form.tier_label === t ? '#fff' : '#343634',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Size (not for Squares) */}
          {form.design_type !== 'squares' && (
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map(s => (
                  <button type="button" key={s} onClick={() => set('size_label', s)}
                    className="px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all"
                    style={{
                      borderColor: form.size_label === s ? '#343634' : '#e5e7eb',
                      backgroundColor: form.size_label === s ? '#343634' : '#fff',
                      color: form.size_label === s ? '#fff' : '#343634',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Base Color</label>
              <input value={form.base_color_name} onChange={e => set('base_color_name', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="e.g. White, Navy" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Paint Color</label>
              <input value={form.paint_color_name} onChange={e => set('paint_color_name', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="e.g. Black, Red" />
            </div>
          </div>

          {/* Design Notes */}
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Design Instructions</label>
            <textarea value={form.design_instructions} onChange={e => set('design_instructions', e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
              rows={2} placeholder="Customer's design notes..." />
          </div>

          {/* Pricing & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Quoted Price ($)</label>
              <input type="number" value={form.quoted_price} onChange={e => set('quoted_price', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="e.g. 349" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Admin Notes</label>
              <input value={form.admin_notes} onChange={e => set('admin_notes', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="Internal notes..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: '#343634' }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Creating...' : 'Create Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showNewQuote, setShowNewQuote] = useState(false);

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
    paid: quotes.filter(q => q.status === 'paid').length,
    rejected: quotes.filter(q => q.status === 'rejected').length,
  };

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-4xl font-black" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#343634' }}>Design Quotes</h1>
            <button
              onClick={() => setShowNewQuote(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-black text-white text-sm flex-shrink-0"
              style={{ backgroundColor: '#f04624', fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              <Plus className="w-4 h-4" /> New Quote
            </button>
          </div>
          <p className="text-gray-500 mb-6">Review, price, and send quotes with Stripe payment links to customers.</p>
          {showNewQuote && <NewQuoteModal onClose={() => setShowNewQuote(false)} onCreated={load} />}

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'pending', 'quoted', 'paid', 'accepted', 'rejected'].map(s => (
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