import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Upload, X, Check, Calendar, Clock, Phone, Mail, User, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SIZES = ['2×3', '3×5', '4×6', '5×7', '6×9', '8×10', '9×12', 'Custom'];
const BUDGETS = ['Under $300', '$300–$600', '$600–$1,200', '$1,200–$2,500', '$2,500+', 'Flexible'];
const DURATIONS = [
  { value: '15min', label: '15 Minutes', desc: 'Quick check-in — best if you already have a Visualizer design' },
  { value: '30min', label: '30 Minutes', desc: 'Full design consultation — ideal for new commissions' },
];

// Generate next 14 days of available slots (9am–5pm, weekdays only, every 30min)
function generateSlots() {
  const slots = [];
  const now = new Date();
  for (let d = 1; d <= 14; d++) {
    const date = new Date(now);
    date.setDate(now.getDate() + d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const daySlots = [];
    for (let h = 9; h <= 16; h++) {
      for (let m = 0; m < 60; m += 30) {
        const slotDate = new Date(date);
        slotDate.setHours(h, m, 0, 0);
        daySlots.push({
          iso: slotDate.toISOString(),
          label: slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        });
      }
    }
    slots.push({ dateStr, date: date.toISOString(), slots: daySlots });
  }
  return slots;
}

export default function BookConsultation() {
  // Read pre-fill from URL params (passed from Visualizer)
  const params = new URLSearchParams(window.location.search);
  const initPreviewUrl = params.get('preview_url') || '';
  const initShareUrl = params.get('share_url') || '';
  const initDescription = params.get('description') || '';
  const initSize = params.get('size') || '';
  const source = params.get('source') || 'direct';

  const [step, setStep] = useState(1); // 1=details, 2=time, 3=confirm, 4=done
  const [darkMode] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('30min');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferred_size: initSize,
    color_style_notes: '',
    idea_description: initDescription,
    budget_range: '',
    visualizer_preview_url: initPreviewUrl,
    visualizer_share_url: initShareUrl,
    visualizer_description: initDescription,
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const bg = darkMode ? '#0f0f0f' : '#f8f6f2';
  const surface = darkMode ? '#1a1a1a' : '#ffffff';
  const text = darkMode ? '#f0ede8' : '#1a1a1a';
  const muted = darkMode ? '#888' : '#666';
  const accent = '#f04624';
  const border = darkMode ? '#2a2a2a' : '#e0e0e0';

  const inputStyle = {
    background: darkMode ? '#111' : '#f9f9f9',
    border: `1px solid ${border}`,
    color: text, borderRadius: 10, padding: '12px 14px',
    fontSize: '0.95rem', fontFamily: 'Roboto, sans-serif', width: '100%', outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle = { color: muted, fontSize: '0.68rem', letterSpacing: '0.12em', fontFamily: 'Barlow Condensed, sans-serif', display: 'block', marginBottom: 6 };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedPhotos(p => [...p, file_url]);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.Consultation.create({
      name: form.name,
      email: form.email,
      phone: form.phone,
      preferred_time: selectedSlot.iso,
      duration: selectedDuration,
      room_photos: uploadedPhotos,
      preferred_size: form.preferred_size,
      color_style_notes: form.color_style_notes,
      idea_description: form.idea_description,
      budget_range: form.budget_range,
      visualizer_preview_url: form.visualizer_preview_url,
      visualizer_share_url: form.visualizer_share_url,
      visualizer_description: form.visualizer_description,
      source,
      status: 'booked',
      confirmation_sent: false,
    });

    // Send confirmation email via backend
    base44.functions.invoke('sendConsultationConfirmation', {
      name: form.name,
      email: form.email,
      phone: form.phone,
      preferred_time: selectedSlot.iso,
      duration: selectedDuration,
      idea_description: form.idea_description,
      visualizer_share_url: form.visualizer_share_url,
      visualizer_preview_url: form.visualizer_preview_url,
      preferred_size: form.preferred_size,
      budget_range: form.budget_range,
    }).catch(() => {}); // fire-and-forget

    setStep(4);
    setSubmitting(false);
  };

  const slots = generateSlots();
  const step1Valid = form.name.trim() && form.email.includes('@') && form.phone.trim();
  const step2Valid = !!selectedSlot;

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text, fontFamily: 'Barlow Condensed, sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20, background: surface }}>
        <div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.08em', color: accent, lineHeight: 1 }}>RUGLY DESIGN CONSULTATION</div>
          <div style={{ fontSize: '0.72rem', color: muted, letterSpacing: '0.15em', marginTop: 2 }}>BOOK A FREE CALL WITH RYAN HENSLEY</div>
        </div>
        <Link to="/Visualizer" style={{ color: muted, fontSize: '0.8rem', textDecoration: 'none', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.05em' }}>← VISUALIZER</Link>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Progress */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 36, alignItems: 'center', justifyContent: 'center' }}>
            {['Your Details', 'Pick a Time', 'Confirm'].map((label, i) => {
              const idx = i + 1;
              const active = step === idx;
              const done = step > idx;
              return (
                <React.Fragment key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, background: done ? accent : active ? 'rgba(240,70,36,0.15)' : darkMode ? '#222' : '#eee', color: done || active ? (done ? 'white' : accent) : muted, border: `2px solid ${done || active ? accent : border}` }}>
                      {done ? <Check size={14} /> : idx}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: active ? text : muted, letterSpacing: '0.06em', display: window.innerWidth < 480 ? 'none' : 'block' }}>{label}</span>
                  </div>
                  {i < 2 && <div style={{ flex: 1, maxWidth: 40, height: 1, background: step > idx ? accent : border }} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* STEP 1 — Details */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

            {/* Contact */}
            <div style={{ background: surface, borderRadius: 16, padding: 28, border: `1px solid ${border}` }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: 6 }}>Your Info</div>
                <p style={{ color: muted, fontSize: '0.85rem', fontFamily: 'Roboto, sans-serif', lineHeight: 1.6 }}>
                  This quick consultation helps refine your Visualizer design into a real hand-painted Crugly commission.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div><label style={labelStyle}>FULL NAME *</label><input value={form.name} onChange={set('name')} placeholder="Jane Smith" style={inputStyle} /></div>
                <div><label style={labelStyle}>EMAIL *</label><input type="email" value={form.email} onChange={set('email')} placeholder="jane@email.com" style={inputStyle} /></div>
                <div><label style={labelStyle}>PHONE *</label><input type="tel" value={form.phone} onChange={set('phone')} placeholder="(517) 555-0123" style={inputStyle} /></div>
              </div>

              {/* Duration */}
              <div style={{ marginTop: 20 }}>
                <label style={labelStyle}>CALL DURATION</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {DURATIONS.map(d => (
                    <button key={d.value} onClick={() => setSelectedDuration(d.value)}
                      style={{ textAlign: 'left', border: `2px solid ${selectedDuration === d.value ? accent : border}`, background: selectedDuration === d.value ? 'rgba(240,70,36,0.08)' : 'transparent', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', color: text }}>
                      <div style={{ fontWeight: 900, fontSize: '0.95rem', color: selectedDuration === d.value ? accent : text }}>{d.label}</div>
                      <div style={{ fontSize: '0.78rem', color: muted, marginTop: 3, fontFamily: 'Roboto, sans-serif' }}>{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Design Details */}
            <div style={{ background: surface, borderRadius: 16, padding: 28, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: 4 }}>Design Details</div>

              {/* Visualizer link pre-fill */}
              {form.visualizer_preview_url && (
                <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${border}` }}>
                  <img src={form.visualizer_preview_url} alt="Your Visualizer design" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '8px 12px', background: darkMode ? '#111' : '#f5f5f5', fontSize: '0.72rem', color: muted, fontFamily: 'Roboto, sans-serif' }}>
                    ✓ Visualizer design linked
                  </div>
                </div>
              )}

              <div>
                <label style={labelStyle}>DESCRIBE YOUR IDEA</label>
                <textarea value={form.idea_description} onChange={set('idea_description')} placeholder="Tell Ryan about your design vision, theme, room style..." style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
              </div>

              <div>
                <label style={labelStyle}>PREFERRED SIZE</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {SIZES.map(s => (
                    <button key={s} onClick={() => setVal('preferred_size', s)}
                      style={{ border: `1.5px solid ${form.preferred_size === s ? accent : border}`, background: form.preferred_size === s ? 'rgba(240,70,36,0.1)' : 'transparent', color: form.preferred_size === s ? accent : muted, borderRadius: 8, padding: '7px 4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>COLOR / STYLE NOTES</label>
                <input value={form.color_style_notes} onChange={set('color_style_notes')} placeholder="e.g. Blues & greens, boho, minimalist..." style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>BUDGET RANGE (OPTIONAL)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {BUDGETS.map(b => (
                    <button key={b} onClick={() => setVal('budget_range', b)}
                      style={{ border: `1.5px solid ${form.budget_range === b ? accent : border}`, background: form.budget_range === b ? 'rgba(240,70,36,0.1)' : 'transparent', color: form.budget_range === b ? accent : muted, borderRadius: 8, padding: '7px 4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label style={labelStyle}>ROOM / FLOOR PHOTOS (OPTIONAL)</label>
                <button onClick={() => fileRef.current.click()} disabled={uploading}
                  style={{ width: '100%', border: `2px dashed ${border}`, borderRadius: 10, padding: '14px 0', background: 'transparent', color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.82rem', fontFamily: 'inherit' }}>
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'Uploading…' : 'Upload room photos (multiple OK)'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                {uploadedPhotos.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {uploadedPhotos.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                        <button onClick={() => setUploadedPhotos(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -4, right: -4, background: accent, border: 'none', borderRadius: '50%', color: 'white', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div style={{ gridColumn: '1 / -1' }}>
              <button onClick={() => step1Valid && setStep(2)} disabled={!step1Valid}
                style={{ width: '100%', background: step1Valid ? accent : (darkMode ? '#333' : '#ccc'), color: 'white', border: 'none', borderRadius: 12, padding: '18px 0', fontSize: '1.2rem', fontWeight: 900, cursor: step1Valid ? 'pointer' : 'not-allowed', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Calendar size={20} /> PICK YOUR TIME SLOT <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Time Picker */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
              <ArrowLeft size={16} /> BACK
            </button>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: 6 }}>Choose a Time</div>
            <p style={{ color: muted, fontFamily: 'Roboto, sans-serif', fontSize: '0.9rem', marginBottom: 24 }}>
              All times are Eastern Time (ET). Ryan will send a Zoom link after booking.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {slots.map(day => (
                <div key={day.date} style={{ background: surface, borderRadius: 14, padding: 20, border: `1px solid ${border}` }}>
                  <div style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.06em', marginBottom: 12, color: text }}>{day.dateStr}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {day.slots.map(slot => {
                      const isSelected = selectedSlot?.iso === slot.iso;
                      return (
                        <button key={slot.iso} onClick={() => setSelectedSlot({ iso: slot.iso, label: `${day.dateStr} at ${slot.label}` })}
                          style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${isSelected ? accent : border}`, background: isSelected ? 'rgba(240,70,36,0.12)' : 'transparent', color: isSelected ? accent : muted, fontWeight: isSelected ? 900 : 400, cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em', transition: 'all 0.12s' }}>
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => step2Valid && setStep(3)} disabled={!step2Valid}
              style={{ width: '100%', marginTop: 28, background: step2Valid ? accent : (darkMode ? '#333' : '#ccc'), color: 'white', border: 'none', borderRadius: 12, padding: '18px 0', fontSize: '1.2rem', fontWeight: 900, cursor: step2Valid ? 'pointer' : 'not-allowed', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              REVIEW BOOKING <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 3 — Confirm */}
        {step === 3 && (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <button onClick={() => setStep(2)} style={{ background: 'transparent', border: 'none', color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
              <ArrowLeft size={16} /> BACK
            </button>

            <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: 20 }}>Confirm Your Booking</div>

            <div style={{ background: surface, borderRadius: 16, padding: 24, border: `1px solid ${border}`, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Row icon={<User size={16} />} label="Name" value={form.name} muted={muted} text={text} />
                <Row icon={<Mail size={16} />} label="Email" value={form.email} muted={muted} text={text} />
                <Row icon={<Phone size={16} />} label="Phone" value={form.phone} muted={muted} text={text} />
                <Row icon={<Clock size={16} />} label="Time" value={selectedSlot?.label} muted={muted} text={text} accent={accent} />
                <Row icon={<Calendar size={16} />} label="Duration" value={selectedDuration === '30min' ? '30-Minute Design Consultation' : '15-Minute Quick Check-In'} muted={muted} text={text} />
                {form.preferred_size && <Row icon={<span style={{ fontSize: '0.9rem' }}>📐</span>} label="Size" value={form.preferred_size} muted={muted} text={text} />}
                {form.budget_range && <Row icon={<span style={{ fontSize: '0.9rem' }}>💰</span>} label="Budget" value={form.budget_range} muted={muted} text={text} />}
              </div>
            </div>

            {form.visualizer_preview_url && (
              <div style={{ background: surface, borderRadius: 16, overflow: 'hidden', border: `1px solid ${border}`, marginBottom: 16 }}>
                <img src={form.visualizer_preview_url} alt="Design" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '10px 16px', fontSize: '0.78rem', color: muted, fontFamily: 'Roboto, sans-serif' }}>Visualizer design attached to this booking</div>
              </div>
            )}

            {uploadedPhotos.length > 0 && (
              <div style={{ background: surface, borderRadius: 14, padding: 16, border: `1px solid ${border}`, marginBottom: 16 }}>
                <div style={{ color: muted, fontSize: '0.68rem', letterSpacing: '0.1em', marginBottom: 10 }}>ROOM PHOTOS ({uploadedPhotos.length})</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {uploadedPhotos.map((url, i) => <img key={i} src={url} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: `1px solid ${border}` }} />)}
                </div>
              </div>
            )}

            <div style={{ background: 'rgba(240,70,36,0.06)', border: '1px solid rgba(240,70,36,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontSize: '0.85rem', fontFamily: 'Roboto, sans-serif', color: muted, lineHeight: 1.6 }}>
              📧 A confirmation email with a calendar invite will be sent to <strong style={{ color: text }}>{form.email}</strong> after booking.
            </div>

            <button onClick={() => !submitting && handleSubmit()} disabled={submitting}
              style={{ width: '100%', background: submitting ? (darkMode ? '#333' : '#ccc') : accent, color: 'white', border: 'none', borderRadius: 12, padding: '18px 0', fontSize: '1.2rem', fontWeight: 900, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {submitting ? <><Loader2 size={20} className="animate-spin" /> Booking…</> : <><Check size={20} /> CONFIRM BOOKING</>}
            </button>
          </div>
        )}

        {/* STEP 4 — Done */}
        {step === 4 && (
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(240,70,36,0.1)', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={36} color={accent} />
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: 12 }}>You're Booked!</h2>
            <p style={{ color: muted, fontFamily: 'Roboto, sans-serif', fontSize: '1rem', lineHeight: 1.8, marginBottom: 12 }}>
              <strong style={{ color: text }}>{selectedSlot?.label}</strong>
            </p>
            <p style={{ color: muted, fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 32 }}>
              Ryan will confirm your consultation shortly and send a Zoom link. A summary of your design details has been emailed to <strong style={{ color: text }}>{form.email}</strong>.
            </p>

            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ color: muted, fontSize: '0.68rem', letterSpacing: '0.1em', marginBottom: 12 }}>WHAT HAPPENS NEXT</div>
              {['Ryan reviews your design details', 'You\'ll receive a Zoom link by email', 'On your call: discuss vision, finalize specs, get pricing', 'After call: Ryan sends a full commission quote within 24 hrs'].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <span style={{ color: text, fontFamily: 'Roboto, sans-serif', fontSize: '0.88rem', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/Visualizer">
                <button style={{ background: 'transparent', border: `1.5px solid ${border}`, color: text, borderRadius: 10, padding: '12px 24px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.05em' }}>← Back to Visualizer</button>
              </Link>
              <Link to="/Commission">
                <button style={{ background: accent, color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.05em' }}>Full Commission Form →</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, value, muted, text, accent }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ color: muted, flexShrink: 0 }}>{icon}</div>
      <div style={{ color: muted, fontSize: '0.75rem', letterSpacing: '0.08em', fontFamily: 'Barlow Condensed, sans-serif', minWidth: 60 }}>{label}</div>
      <div style={{ color: accent || text, fontWeight: 700, fontFamily: 'Roboto, sans-serif', fontSize: '0.9rem' }}>{value}</div>
    </div>
  );
}