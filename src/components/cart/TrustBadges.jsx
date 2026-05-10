import React from 'react';
import { ShieldCheck, Award, Truck, RefreshCw } from 'lucide-react';

const badges = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'SSL Secure',
    sub: 'Stripe encrypted',
    color: '#22c55e',
  },
  {
    icon: <Award className="w-5 h-5" />,
    title: 'Hand-Painted',
    sub: 'By real artists',
    color: '#4075ff',
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: '24hr Guarantee',
    sub: 'Damage protection',
    color: '#f04624',
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: 'Free Shipping',
    sub: 'On Crugly orders',
    color: '#24f0a0',
  },
];

export default function TrustBadges({ className = '' }) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {badges.map((b) => (
        <div
          key={b.title}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
            style={{ backgroundColor: b.color }}
          >
            {b.icon}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-800 leading-tight">{b.title}</div>
            <div className="text-xs text-gray-500 leading-tight">{b.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}