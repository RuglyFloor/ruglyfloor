import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function VisualizerLeadForm({ previewUrl, size, priceEstimate, submitting, darkMode, surface, text, muted, accent, onSubmit, onBack }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const valid = form.name.trim() && form.email.includes('@') && form.phone.trim();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    background: darkMode ? '#111' : '#f9f9f9',
    border: `1px solid ${darkMode ? '#333' : '#ddd'}`,
    color: text,
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: '0.95rem',
    fontFamily: 'Roboto, sans-serif',
    width: '100%',
    outline: 'none',
  };

  const labelStyle = {
    color: muted,
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    fontFamily: 'Barlow Condensed, sans-serif',
    display: 'block',
    marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
        <ArrowLeft size={16} /> BACK TO PREVIEW
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>

        {/* Preview thumbnail */}
        {previewUrl && (
          <div>
            <img src={previewUrl} alt="Your design" style={{ width: '100%', borderRadius: 14, border: `2px solid ${darkMode ? '#2a2a2a' : '#e0e0e0'}` }} />
            <div style={{ marginTop: 14, background: surface, borderRadius: 12, padding: '14px 16px', border: `1px solid ${darkMode ? '#222' : '#eee'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: muted, fontSize: '0.8rem', fontFamily: 'Roboto, sans-serif' }}>Size</span>
                <span style={{ color: text, fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1rem' }}>{size}</span>
              </div>
              {priceEstimate && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: muted, fontSize: '0.8rem', fontFamily: 'Roboto, sans-serif' }}>Starting at</span>
                  <span style={{ color: accent, fontWeight: 900, fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.1rem' }}>${priceEstimate}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <div style={{ background: surface, borderRadius: 16, padding: 28, border: `1px solid ${darkMode ? '#2a2a2a' : '#e0e0e0'}` }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: 6 }}>Send to Ryan</h2>
          <p style={{ color: muted, fontSize: '0.85rem', fontFamily: 'Roboto, sans-serif', marginBottom: 24, lineHeight: 1.6 }}>
            Ryan will review your design and send a custom quote within 24 hours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>FULL NAME *</label>
              <input value={form.name} onChange={set('name')} placeholder="Jane Smith" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>EMAIL *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PHONE *</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="(517) 555-0123" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>ADDITIONAL NOTES</label>
              <textarea value={form.notes} onChange={set('notes')} placeholder="Any extra details, budget range, timeline..." style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
            </div>

            <button
              onClick={() => valid && !submitting && onSubmit(form)}
              disabled={!valid || submitting}
              style={{
                background: (!valid || submitting) ? (darkMode ? '#333' : '#ccc') : accent,
                color: 'white', border: 'none', borderRadius: 10, padding: '14px 0',
                fontSize: '1.15rem', fontWeight: 900, cursor: (!valid || submitting) ? 'not-allowed' : 'pointer',
                fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'background 0.2s'
              }}
            >
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Sending…</> : 'SEND MY DESIGN TO RYAN'}
            </button>

            <p style={{ color: muted, fontSize: '0.72rem', textAlign: 'center', fontFamily: 'Roboto, sans-serif', lineHeight: 1.5 }}>
              No payment required. Ryan will contact you with a quote.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}