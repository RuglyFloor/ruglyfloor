import React, { useState } from 'react';
import { Mail, Copy, Check, Phone, Globe, RotateCcw } from 'lucide-react';


function FlipCard({ icon, emoji, title, value, copyValue, href }) {
  const [flipped, setFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFlipBack = (e) => {
    e.stopPropagation();
    setFlipped(false);
  };

  return (
    <div
      className="relative h-44 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(f => !f)}
    >
      <div
        className="w-full h-full relative transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl p-6 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', border: '2px solid var(--brand-blue)', backgroundColor: 'white' }}
        >
          {icon
            ? <>{icon}</>
            : <div className="text-3xl mb-3">{emoji}</div>
          }
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-dark)' }}>{title}</h3>
          <p className="text-sm" style={{ color: '#6b7280' }}>Tap to reveal →</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl p-6 flex flex-col items-center justify-center gap-3"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', border: '2px solid var(--brand-blue)', backgroundColor: 'var(--brand-cream)' }}
        >
          <p className="font-bold text-base text-center break-all" style={{ color: 'var(--brand-dark)' }}>{value}</p>

          <div className="flex gap-2">
            <a
              href={href}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg text-sm font-bold text-white transition-transform active:scale-95"
              style={{ backgroundColor: 'var(--brand-blue)', fontFamily: 'var(--font-button)' }}
            >
              Open
            </a>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-white transition-all active:scale-95"
              style={{ backgroundColor: copied ? '#22c55e' : 'var(--brand-red)', fontFamily: 'var(--font-button)', transform: copied ? 'scale(1.05)' : 'scale(1)' }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleFlipBack}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-95"
              style={{ border: '2px solid var(--brand-blue)', color: 'var(--brand-blue)', backgroundColor: 'white', fontFamily: 'var(--font-button)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactCards() {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-8">
      <FlipCard
        icon={<Mail className="w-8 h-8 mb-3" style={{ color: 'var(--brand-blue)' }} />}
        title="Email Us"
        value="info@ruglyfloor.com"
        copyValue="info@ruglyfloor.com"
        href="mailto:info@ruglyfloor.com"
      />
      <FlipCard
        icon={<Phone className="w-8 h-8 mb-3" style={{ color: 'var(--brand-blue)' }} />}
        title="Call Us"
        value="(517) 777-8474"
        copyValue="5177778474"
        href="tel:5177778474"
      />
      <FlipCard
        icon={<Globe className="w-8 h-8 mb-3" style={{ color: 'var(--brand-blue)' }} />}
        title="Visit Us"
        value="www.ruglyfloor.com"
        copyValue="https://ruglyfloor.com"
        href="https://ruglyfloor.com"
      />
    </div>
  );
}