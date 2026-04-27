import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const STYLE_FILTERS = ['All', 'Abstract', 'Geometric', 'Nature', 'Portrait', 'Typography', 'Floral', 'Retro', 'Minimalist'];

// Fallback gallery from existing Product images
const FALLBACK_GALLERY = [
  { id: 'f1', title: 'Cityscape Chicago', image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/d1577b50a_generated_image.png', style_tags: ['Abstract', 'Typography'], size: '5x7' },
  { id: 'f2', title: 'Trans Air PanAm', image_url: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/284c9e6ee_panam.jpg', style_tags: ['Retro', 'Typography'], size: '5x7' },
  { id: 'f3', title: 'Bitch I\'m Madonna', image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/4f33272b6_generated_image.png', style_tags: ['Abstract', 'Portrait'], size: '5x7' },
  { id: 'f4', title: 'The Queen B', image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/b740f34c3_generated_image.png', style_tags: ['Portrait', 'Abstract'], size: '5x7' },
  { id: 'f5', title: 'Retro Atari', image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/5b2b6b110_generated_image.png', style_tags: ['Retro', 'Geometric'], size: '4x6' },
  { id: 'f6', title: 'Harmony Groove', image_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/8212985fe_generated_image.png', style_tags: ['Abstract', 'Minimalist'], size: '3x4' },
];

export default function VisualizerGallery({ darkMode, surface, text, muted, accent }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const { data: galleryItems = [] } = useQuery({
    queryKey: ['gallery-rugs'],
    queryFn: () => base44.entities.GalleryRug.filter({ active: true }),
    initialData: []
  });

  const allItems = galleryItems.length > 0 ? galleryItems : FALLBACK_GALLERY;

  const filtered = activeFilter === 'All'
    ? allItems
    : allItems.filter(item => item.style_tags?.includes(activeFilter));

  return (
    <div>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
        {STYLE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '7px 18px', borderRadius: 20, fontSize: '0.82rem', cursor: 'pointer',
              border: `1.5px solid ${activeFilter === f ? accent : darkMode ? '#333' : '#ddd'}`,
              background: activeFilter === f ? `rgba(240,70,36,0.1)` : 'transparent',
              color: activeFilter === f ? accent : muted,
              fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.05em', fontWeight: activeFilter === f ? 700 : 400,
              transition: 'all 0.15s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => setLightboxUrl(item.image_url)}
            style={{ cursor: 'pointer', borderRadius: 12, overflow: 'hidden', background: surface, border: `1px solid ${darkMode ? '#2a2a2a' : '#e0e0e0'}`, transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
              <img src={item.image_url} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
            </div>
            <div style={{ padding: '10px 14px 14px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em', color: text, marginBottom: 4 }}>{item.title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {item.style_tags?.slice(0, 2).map(t => (
                  <span key={t} style={{ background: darkMode ? '#222' : '#f0ede8', color: muted, padding: '2px 8px', borderRadius: 20, fontSize: '0.68rem', fontFamily: 'Barlow Condensed, sans-serif' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, cursor: 'pointer' }}
        >
          <img src={lightboxUrl} alt="Gallery" style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12 }} />
          <div style={{ position: 'absolute', top: 20, right: 24, color: 'white', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>✕</div>
        </div>
      )}
    </div>
  );
}