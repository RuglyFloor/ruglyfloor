import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Download, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function ProposalSection({ title, children, accent = 'var(--brand-blue)' }) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: accent }} />
      <div className="pl-6">
        <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-50">{title}</p>
        <div className="text-base leading-relaxed" style={{ color: 'var(--brand-dark)' }}>{children}</div>
      </div>
    </div>
  );
}

function ColorDot({ hex }) {
  return (
    <div
      className="w-8 h-8 rounded-full border-2 border-white shadow-md"
      style={{ backgroundColor: hex }}
      title={hex}
    />
  );
}

export default function DesignProposal() {
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [formData, setFormData] = useState(null);
  const [aiPreviewUrl, setAiPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('rugly_commission_proposal');
    if (!raw) {
      navigate('/Commission');
      return;
    }
    try {
      const data = JSON.parse(raw);
      setProposal(data.proposal);
      setFormData(data.formData);
      setAiPreviewUrl(data.aiPreviewUrl);
    } catch {
      setError('Failed to load proposal.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--brand-light-gray)' }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: 'var(--brand-blue)' }} />
          <p className="font-bold text-gray-500">Loading your design proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'No proposal found.'}</p>
          <Button onClick={() => navigate('/Commission')}>← Back to Commission</Button>
        </div>
      </div>
    );
  }

  const colors = formData?.preferredColors || [];

  return (
    <div className="min-h-screen print:bg-white" style={{ background: 'var(--brand-light-gray)' }}>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.7s ease both; }
      `}</style>

      {/* Nav bar */}
      <div className="no-print sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: '#e5e7eb' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/Commission')} className="gap-2 text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Commission Another
        </Button>
        <Button size="sm" onClick={handlePrint} className="gap-2"
          style={{ backgroundColor: 'var(--brand-dark)', color: 'white', border: 'none' }}>
          <Download className="w-4 h-4" /> Save as PDF
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-0 fade-in">

        {/* ── COVER ────────────────────────────────────── */}
        <div className="rounded-3xl overflow-hidden mb-10" style={{ backgroundColor: 'var(--brand-dark)' }}>
          {/* top bar */}
          <div className="flex items-center justify-between px-8 pt-7 pb-4">
            <span className="text-xs font-black uppercase tracking-widest opacity-40 text-white">Rugly Commission Studio</span>
            <Sparkles className="w-4 h-4 opacity-30 text-white" />
          </div>

          {/* headline */}
          <div className="px-8 pb-8">
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--brand-cyan)' }}>
              Design Proposal
            </p>
            <h1 className="text-5xl md:text-6xl font-black leading-none text-white mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}>
              {proposal.collection_name}
            </h1>
            <p className="text-lg mt-3 opacity-60 text-white italic">"{proposal.tagline}"</p>

            {/* color swatches */}
            {colors.length > 0 && (
              <div className="flex items-center gap-2 mt-6">
                {colors.map((c, i) => <ColorDot key={i} hex={c} />)}
                <span className="text-xs opacity-40 text-white ml-2">Palette</span>
              </div>
            )}

            {/* meta row */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              {[
                { label: 'Client', val: formData?.name || '—' },
                { label: 'Size', val: formData?.preferredSize || 'Custom' },
                { label: 'Timeline', val: proposal.estimated_timeline },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-xs opacity-40 text-white uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-sm font-bold text-white">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AI PREVIEW ───────────────────────────────── */}
        {aiPreviewUrl && (
          <div className="mb-10">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={aiPreviewUrl} alt="AI Design Preview" className="w-full object-cover" style={{ maxHeight: 420 }} />
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">AI-generated design preview · Rugly Commission Studio</p>
          </div>
        )}

        {/* ── STORY ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 mb-6 space-y-4" style={{ border: '1.5px solid #e5e7eb' }}>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">The Story</p>
          {proposal.story.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-gray-700">{para}</p>
          ))}
        </div>

        {/* ── DESIGN DIRECTION ─────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 mb-6 space-y-7" style={{ border: '1.5px solid #e5e7eb' }}>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Design Direction</p>

          <div className="grid md:grid-cols-2 gap-7">
            <ProposalSection title="Mood" accent="var(--brand-blue)">
              <span className="text-2xl font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                {proposal.design_direction?.mood}
              </span>
            </ProposalSection>
            <ProposalSection title="Palette" accent="var(--brand-cyan)">
              {proposal.design_direction?.palette_narrative}
            </ProposalSection>
            <ProposalSection title="Pattern Language" accent="var(--brand-red)">
              {proposal.design_direction?.pattern_language}
            </ProposalSection>
            <ProposalSection title="Texture" accent="var(--brand-dark)">
              {proposal.design_direction?.texture_note}
            </ProposalSection>
          </div>
        </div>

        {/* ── PRODUCTION NOTES ─────────────────────────── */}
        <div className="rounded-2xl p-8 mb-6 space-y-5" style={{ backgroundColor: 'var(--brand-cream)', border: '1.5px solid #e5e7eb' }}>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Production Notes</p>
          <div className="space-y-4">
            {[
              { label: 'Technique', val: proposal.production_notes?.technique },
              { label: 'Layers & Depth', val: proposal.production_notes?.layers },
              { label: 'Finishing', val: proposal.production_notes?.finishing },
            ].map(({ label, val }) => val && (
              <div key={label}>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
                <p className="text-sm leading-relaxed text-gray-700">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── PLACEMENT VISION ─────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: '1.5px solid #e5e7eb' }}>
          <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">Placement Vision</p>
          <p className="text-base leading-relaxed text-gray-700 italic">"{proposal.placement_vision}"</p>
        </div>

        {/* ── DESIGNER NOTE ────────────────────────────── */}
        <div className="rounded-2xl p-8 mb-6" style={{ backgroundColor: 'var(--brand-dark)', color: 'white' }}>
          <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">A Note from Your Artist</p>
          <p className="text-base leading-relaxed opacity-80 italic">{proposal.designer_note}</p>
          <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-xs opacity-40 mb-1">Investment</p>
            <p className="text-lg font-bold" style={{ color: 'var(--brand-cyan)' }}>{proposal.investment}</p>
          </div>
        </div>

        {/* ── CTA ──────────────────────────────────────── */}
        <div className="no-print text-center py-8 space-y-4">
          <p className="text-gray-500 text-sm">Your request has been received. Expect a full estimate within 48 hours.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Download Proposal
            </Button>
            <Button onClick={() => navigate('/')} className="gap-2"
              style={{ backgroundColor: 'var(--brand-blue)', color: 'white', border: 'none' }}>
              Back to Home
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}