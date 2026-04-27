import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

/**
 * Reusable "Book a Free Design Consultation" button.
 * 
 * Props:
 *   previewUrl   — Visualizer preview image URL (pre-fills booking form)
 *   shareUrl     — Visualizer share link
 *   description  — Rug idea description
 *   size         — Selected rug size
 *   source       — 'visualizer' | 'commission' | 'direct'
 *   variant      — 'dark' | 'light' | 'outline'
 *   size_btn     — 'sm' | 'md' | 'lg'
 *   label        — Override button label
 *   className    — Additional CSS classes
 */
export default function BookConsultationButton({
  previewUrl = '',
  shareUrl = '',
  description = '',
  size = '',
  source = 'direct',
  variant = 'dark',
  size_btn = 'md',
  label,
  style: extraStyle = {},
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    const params = new URLSearchParams();
    if (previewUrl) params.set('preview_url', previewUrl);
    if (shareUrl) params.set('share_url', shareUrl);
    if (description) params.set('description', description);
    if (size) params.set('size', size);
    params.set('source', source);
    navigate(`/BookConsultation?${params.toString()}`);
  };

  const sizes = {
    sm: { padding: '8px 18px', fontSize: '0.9rem', gap: 6, iconSize: 14 },
    md: { padding: '12px 24px', fontSize: '1.05rem', gap: 8, iconSize: 16 },
    lg: { padding: '16px 32px', fontSize: '1.2rem', gap: 10, iconSize: 20 },
  };
  const sz = sizes[size_btn] || sizes.md;

  const variants = {
    dark: { background: '#f04624', color: 'white', border: 'none' },
    light: { background: 'white', color: '#f04624', border: '2px solid #f04624' },
    outline: { background: 'transparent', color: '#f04624', border: '2px solid #f04624' },
  };
  const v = variants[variant] || variants.dark;

  return (
    <button
      onClick={handleClick}
      style={{
        ...v,
        borderRadius: 10,
        padding: sz.padding,
        fontSize: sz.fontSize,
        fontWeight: 900,
        fontFamily: 'Barlow Condensed, sans-serif',
        letterSpacing: '0.07em',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: sz.gap,
        transition: 'opacity 0.15s, transform 0.1s',
        ...extraStyle,
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <Calendar size={sz.iconSize} />
      {label || 'BOOK A FREE DESIGN CONSULTATION'}
    </button>
  );
}