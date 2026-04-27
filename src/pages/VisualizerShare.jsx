import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

export default function VisualizerShare() {
  const token = new URLSearchParams(window.location.search).get('token');

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['visualizer-share', token],
    queryFn: () => base44.entities.VisualizerSubmission.filter({ share_token: token }),
    enabled: !!token
  });

  const sub = submissions[0];

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>
        LOADING…
      </div>
    );
  }

  if (!sub) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ color: '#f04624', fontSize: '1.2rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>DESIGN NOT FOUND</div>
        <Link to="/Visualizer" style={{ color: '#888', textDecoration: 'underline', fontFamily: 'Roboto, sans-serif', fontSize: '0.9rem' }}>Create your own rug design</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#f0ede8', fontFamily: 'Barlow Condensed, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.08em', color: '#f04624', marginBottom: 4 }}>RUGLY VISUALIZER</div>
          <div style={{ color: '#666', fontSize: '0.75rem', letterSpacing: '0.15em' }}>BY RYAN HENSLEY</div>
        </div>

        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 900, letterSpacing: '0.04em', textAlign: 'center', marginBottom: 8 }}>
          {sub.name ? `${sub.name}'s Custom Rug` : 'Custom Rug Design'}
        </h1>
        <p style={{ color: '#666', textAlign: 'center', fontFamily: 'Roboto, sans-serif', fontSize: '0.9rem', marginBottom: 32 }}>
          AI-generated preview for a {sub.size} hand-painted rug by Ryan Hensley
        </p>

        {sub.preview_url && (
          <img
            src={sub.preview_url}
            alt="Rug design preview"
            style={{ width: '100%', borderRadius: 16, marginBottom: 28, border: '2px solid #222' }}
          />
        )}

        <div style={{ background: '#1a1a1a', borderRadius: 14, padding: 24, marginBottom: 24, border: '1px solid #2a2a2a' }}>
          {sub.room_description && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#555', fontSize: '0.68rem', letterSpacing: '0.12em', marginBottom: 6 }}>DESIGN DESCRIPTION</div>
              <p style={{ color: '#ccc', fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic' }}>"{sub.room_description}"</p>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {sub.size && (
              <div>
                <div style={{ color: '#555', fontSize: '0.68rem', letterSpacing: '0.12em', marginBottom: 4 }}>SIZE</div>
                <div style={{ color: '#f04624', fontWeight: 900, fontSize: '1.2rem' }}>{sub.size}</div>
              </div>
            )}
            {sub.price_estimate && (
              <div>
                <div style={{ color: '#555', fontSize: '0.68rem', letterSpacing: '0.12em', marginBottom: 4 }}>STARTING AT</div>
                <div style={{ color: '#f0ede8', fontWeight: 900, fontSize: '1.2rem' }}>${sub.price_estimate}</div>
              </div>
            )}
            {sub.style_tags?.length > 0 && (
              <div>
                <div style={{ color: '#555', fontSize: '0.68rem', letterSpacing: '0.12em', marginBottom: 6 }}>STYLE</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {sub.style_tags.map(t => (
                    <span key={t} style={{ background: '#222', color: '#888', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/Visualizer">
            <button style={{ background: '#f04624', color: 'white', border: 'none', borderRadius: 12, padding: '16px 40px', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em' }}>
              CREATE MY OWN DESIGN →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}