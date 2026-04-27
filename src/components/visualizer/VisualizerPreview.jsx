import React from 'react';
import { Loader2, RefreshCw, ArrowLeft, Send, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VisualizerPreview({
  generating, previewUrl, size, priceEstimate, description, selectedTags,
  darkMode, surface, text, muted, accent,
  onRegenerate, onBack, onSendToRyan
}) {
  const navigate = useNavigate();

  const handleBookConsultation = () => {
    const params = new URLSearchParams();
    if (previewUrl) params.set('preview_url', previewUrl);
    if (description) params.set('description', description);
    if (size) params.set('size', size);
    params.set('source', 'visualizer');
    navigate(`/BookConsultation?${params.toString()}`);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
        <ArrowLeft size={16} /> BACK TO DESCRIBE
      </button>

      <div style={{ background: surface, borderRadius: 20, overflow: 'hidden', border: `1px solid ${darkMode ? '#2a2a2a' : '#e0e0e0'}` }}>
        {/* Preview Image Area */}
        <div style={{ position: 'relative', background: darkMode ? '#111' : '#f0ede8', minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {generating ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Loader2 size={40} color={accent} className="animate-spin" style={{ margin: '0 auto 16px' }} />
              <div style={{ color: muted, fontSize: '1rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>GENERATING PREVIEW…</div>
              <div style={{ color: muted, fontSize: '0.8rem', marginTop: 8, fontFamily: 'Roboto, sans-serif' }}>Ryan's AI is painting your rug</div>
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Rug preview" style={{ width: '100%', maxHeight: 520, objectFit: 'contain', display: 'block' }} />
          ) : null}

          {/* Watermark */}
          {previewUrl && !generating && (
            <div style={{ position: 'absolute', bottom: 12, right: 16, color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>
              RUGLY PREVIEW — NOT FINAL
            </div>
          )}
        </div>

        {/* Details Bar */}
        {!generating && (
          <div style={{ padding: '20px 24px', borderTop: `1px solid ${darkMode ? '#222' : '#eee'}` }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ color: muted, fontSize: '0.68rem', letterSpacing: '0.12em', fontFamily: 'Barlow Condensed, sans-serif' }}>SIZE</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Barlow Condensed, sans-serif', color: accent }}>{size}</div>
              </div>
              {priceEstimate && (
                <div>
                  <div style={{ color: muted, fontSize: '0.68rem', letterSpacing: '0.12em', fontFamily: 'Barlow Condensed, sans-serif' }}>STARTING AT</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Barlow Condensed, sans-serif', color: text }}>${priceEstimate}</div>
                </div>
              )}
              {selectedTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedTags.map(t => (
                    <span key={t} style={{ background: darkMode ? '#222' : '#f0ede8', color: muted, padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.05em' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            {description && (
              <p style={{ color: muted, fontSize: '0.85rem', fontFamily: 'Roboto, sans-serif', lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>
                "{description}"
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={onRegenerate}
                style={{ flex: 1, minWidth: 120, border: `1.5px solid ${darkMode ? '#333' : '#ddd'}`, background: 'transparent', color: text, borderRadius: 10, padding: '12px 0', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'border-color 0.15s' }}
              >
                <RefreshCw size={16} /> REGENERATE
              </button>
              <button
                onClick={onSendToRyan}
                style={{ flex: 2, minWidth: 160, background: accent, color: 'white', border: 'none', borderRadius: 10, padding: '12px 0', fontSize: '1rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s' }}
              >
                <Send size={16} /> SEND TO RYAN
              </button>
              <button
                onClick={handleBookConsultation}
                style={{ flex: 2, minWidth: 180, background: '#0f0f0f', color: 'white', border: `1.5px solid ${darkMode ? '#333' : '#555'}`, borderRadius: 10, padding: '12px 0', fontSize: '1rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s' }}
              >
                <Calendar size={16} /> BOOK A FREE CALL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}