import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminProtected from '@/components/AdminProtected';
import { Search, Phone, Mail, Download, Eye, X, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const STATUS_CONFIG = {
  booked: { label: 'Booked', bg: '#dbeafe', color: '#1d4ed8' },
  consulted: { label: 'Consulted', bg: '#d1fae5', color: '#065f46' },
  quote_sent: { label: 'Quote Sent', bg: '#fef3c7', color: '#92400e' },
  commission_started: { label: 'Commission Started', bg: '#ede9fe', color: '#5b21b6' },
  closed: { label: 'Closed', bg: '#f3f4f6', color: '#6b7280' },
};

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.booked;
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.05em' }}>{s.label}</span>;
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

function ConsultationCard({ c, onStatusChange, onNotesChange }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(c.admin_notes || '');
  const [zoomLink, setZoomLink] = useState(c.zoom_link || '');

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1.5px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {c.visualizer_preview_url && (
            <img src={c.visualizer_preview_url} alt="Preview" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e5e7eb', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#1a1a1a', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.03em' }}>{c.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: 'Roboto, sans-serif' }}>{c.email}</div>
              </div>
              <StatusBadge status={c.status} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.82rem', color: '#6b7280', fontFamily: 'Roboto, sans-serif', marginBottom: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} />{formatTime(c.preferred_time)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} />{c.duration || '30min'}</span>
              {c.preferred_size && <span>📐 {c.preferred_size}</span>}
              {c.budget_range && <span>💰 {c.budget_range}</span>}
              {c.source && <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.06em', background: '#f3f4f6', padding: '2px 8px', borderRadius: 20, color: '#888' }}>via {c.source}</span>}
            </div>

            {c.idea_description && (
              <p style={{ fontSize: '0.82rem', color: '#555', fontFamily: 'Roboto, sans-serif', fontStyle: 'italic', lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                "{c.idea_description}"
              </p>
            )}
          </div>
        </div>

        {/* Status buttons + actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' }}>
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
            <button key={s} onClick={() => onStatusChange(c.id, s)}
              style={{ padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${c.status === s ? cfg.color : '#e5e7eb'}`, background: c.status === s ? cfg.bg : 'white', color: c.status === s ? cfg.color : '#9ca3af', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', transition: 'all 0.12s' }}>
              {cfg.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {c.phone && <a href={`tel:${c.phone}`}><Button size="sm" variant="outline" className="gap-1 text-xs"><Phone className="w-3 h-3" />Call</Button></a>}
            {c.email && <a href={`mailto:${c.email}?subject=Your Rugly Design Consultation`}><Button size="sm" variant="outline" className="gap-1 text-xs"><Mail className="w-3 h-3" />Email</Button></a>}
            <Button size="sm" variant="ghost" onClick={() => setExpanded(e => !e)}>
              {expanded ? <X className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #f0f0f0', background: '#fafafa', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>

            {/* Left: design details */}
            <div>
              {c.visualizer_preview_url && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'Barlow Condensed, sans-serif' }}>VISUALIZER DESIGN</div>
                  <img src={c.visualizer_preview_url} alt="Preview" style={{ width: '100%', maxWidth: 280, borderRadius: 10, border: '1.5px solid #e5e7eb' }} />
                  {c.visualizer_share_url && (
                    <a href={c.visualizer_share_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: 6, fontSize: '0.75rem', color: '#f04624', fontFamily: 'Roboto, sans-serif' }}>View full design →</a>
                  )}
                </div>
              )}

              {c.room_photos?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'Barlow Condensed, sans-serif' }}>ROOM PHOTOS</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {c.room_photos.map((url, i) => <a key={i} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8 }} /></a>)}
                  </div>
                </div>
              )}

              {c.color_style_notes && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'Barlow Condensed, sans-serif' }}>STYLE NOTES</div>
                  <p style={{ fontSize: '0.85rem', color: '#555', fontFamily: 'Roboto, sans-serif' }}>{c.color_style_notes}</p>
                </div>
              )}
            </div>

            {/* Right: admin tools */}
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'Barlow Condensed, sans-serif' }}>ZOOM LINK</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={zoomLink} onChange={e => setZoomLink(e.target.value)} placeholder="https://zoom.us/j/..." style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: '0.8rem', fontFamily: 'Roboto, sans-serif' }} />
                  <Button size="sm" onClick={() => onNotesChange(c.id, { zoom_link: zoomLink })}>Save</Button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#999', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'Barlow Condensed, sans-serif' }}>PRIVATE NOTES</div>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={() => onNotesChange(c.id, { admin_notes: notes })} placeholder="Add notes about this consultation…" className="text-sm min-h-[100px]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function exportToCSV(consultations) {
  const headers = ['Name', 'Email', 'Phone', 'Time', 'Duration', 'Size', 'Budget', 'Status', 'Source', 'Idea', 'Style Notes', 'Booked Date'];
  const rows = consultations.map(c => [
    c.name, c.email, c.phone, formatTime(c.preferred_time), c.duration,
    c.preferred_size, c.budget_range, c.status, c.source,
    `"${(c.idea_description || '').replace(/"/g, '""')}"`,
    `"${(c.color_style_notes || '').replace(/"/g, '""')}"`,
    new Date(c.created_date).toLocaleDateString()
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'consultations.csv'; a.click();
}

function AdminConsultationsContent() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const qc = useQueryClient();

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => base44.entities.Consultation.list('-created_date', 200)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Consultation.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consultations'] })
  });

  const filtered = consultations.filter(c => {
    const matchSearch = !search || [c.name, c.email, c.phone, c.idea_description].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map(s => [s, consultations.filter(c => c.status === s).length]));

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', padding: '28px 20px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1a1a1a', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em', marginBottom: 4 }}>Design Consultations</h1>
            <p style={{ color: '#888', fontFamily: 'Roboto, sans-serif', fontSize: '0.9rem' }}>All booked calls with Ryan Hensley</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => exportToCSV(filtered)}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
            <div key={s} onClick={() => setFilterStatus(f => f === s ? 'all' : s)}
              style={{ background: 'white', borderRadius: 12, padding: '14px 16px', textAlign: 'center', border: `1.5px solid ${filterStatus === s ? cfg.color : '#e5e7eb'}`, cursor: 'pointer', transition: 'border-color 0.12s' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, fontFamily: 'Barlow Condensed, sans-serif', color: '#1a1a1a' }}>{counts[s] || 0}</div>
              <StatusBadge status={s} />
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, description…" style={{ paddingLeft: 36 }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: '0.85rem', background: 'white', color: '#444', cursor: 'pointer' }}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([s, cfg]) => <option key={s} value={s}>{cfg.label}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#aaa', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>LOADING…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#aaa' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📅</div>
            <div style={{ fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.1rem', letterSpacing: '0.05em' }}>No consultations yet</div>
            <div style={{ fontSize: '0.85rem', marginTop: 6, fontFamily: 'Roboto, sans-serif' }}>Share the booking link to start getting consultations</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(c => (
              <ConsultationCard key={c.id} c={c}
                onStatusChange={(id, status) => updateMutation.mutate({ id, data: { status } })}
                onNotesChange={(id, data) => updateMutation.mutate({ id, data })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminConsultations() {
  return <AdminProtected><AdminConsultationsContent /></AdminProtected>;
}