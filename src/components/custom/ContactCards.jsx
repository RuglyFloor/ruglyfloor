import React, { useState } from 'react';
import { Mail, Copy, Check, Phone, Globe } from 'lucide-react';

function StaticContactCard({ icon, title, value, copyValue, href }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-xl p-6 flex flex-col items-center justify-center text-center"
      style={{ border: '2px solid var(--brand-blue)', backgroundColor: 'var(--brand-cream)' }}
    >
      {icon}
      <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-dark)' }}>{title}</h3>
      <p className="font-bold text-base text-center break-all mb-3" style={{ color: 'var(--brand-dark)' }}>{value}</p>

      <div className="flex gap-2">
        <a
          href={href}
          className="px-3 py-1.5 rounded-lg text-sm font-bold text-white transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--brand-blue)', fontFamily: 'var(--font-button)' }}
        >
          Open
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-white transition-all active:scale-95"
          style={{
            backgroundColor: copied ? '#22c55e' : 'var(--brand-red)',
            fontFamily: 'var(--font-button)',
            transform: copied ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function ContactCards() {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-8">
      <StaticContactCard
        icon={<Mail className="w-8 h-8 mb-3" style={{ color: 'var(--brand-blue)' }} />}
        title="Email Us"
        value="info@ruglyfloor.com"
        copyValue="info@ruglyfloor.com"
        href="mailto:info@ruglyfloor.com"
      />
      <StaticContactCard
        icon={<Phone className="w-8 h-8 mb-3" style={{ color: 'var(--brand-blue)' }} />}
        title="Call Us"
        value="(517) 777-8474"
        copyValue="5177778474"
        href="tel:5177778474"
      />
      <StaticContactCard
        icon={<Globe className="w-8 h-8 mb-3" style={{ color: 'var(--brand-blue)' }} />}
        title="Visit Us"
        value="www.ruglyfloor.com"
        copyValue="https://ruglyfloor.com"
        href="https://ruglyfloor.com"
      />
    </div>
  );
}