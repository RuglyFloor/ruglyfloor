import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, ShoppingBag, ShoppingCart } from 'lucide-react';
import { createPageUrl } from '@/utils';

const TABS = [
  { label: 'Home',   icon: Home,         to: createPageUrl('Home') },
  { label: 'Design', icon: Sparkles,     to: createPageUrl('CustomBuilder') },
  { label: 'Shop',   icon: ShoppingBag,  to: createPageUrl('Shop') },
  { label: 'Cart',   icon: ShoppingCart, to: createPageUrl('Cart') },
];

export default function BottomTabs() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 no-select safe-bottom"
      style={{ borderColor: 'var(--brand-blue)' }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ label, icon: Icon, to }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center justify-center flex-1 gap-1 transition-colors"
              style={{ color: active ? 'var(--brand-blue)' : '#9ca3af' }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}