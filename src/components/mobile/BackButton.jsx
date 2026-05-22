import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function BackButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Don't show on the home page
  if (pathname === '/' || pathname === createPageUrl('Home')) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-1 no-select mr-2 transition-opacity hover:opacity-70"
      style={{ color: 'var(--brand-blue)' }}
      aria-label="Go back"
    >
      <ChevronLeft className="w-5 h-5" />
      <span className="text-sm font-semibold hidden sm:inline">Back</span>
    </button>
  );
}