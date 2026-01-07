import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', page: 'Home' },
    { name: 'Custom Builder', page: 'CustomBuilder' },
    { name: 'Shop Originals', page: 'Shop' },
    { name: 'My Orders', page: 'Orders' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/91fa687b5_RUGLYMASTERLOGO-61.png" 
                alt="Rugly" 
                className="h-10"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`text-gray-700 hover:text-blue-600 transition-colors ${
                    currentPageName === link.page ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to={createPageUrl('Cart')}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3">
              {navLinks.map(link => (
                <Link
                  key={link.page}
                  to={createPageUrl(link.page)}
                  className={`text-gray-700 hover:text-blue-600 transition-colors py-2 ${
                    currentPageName === link.page ? 'text-blue-600 font-semibold' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link to={createPageUrl('Cart')} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="gap-2 w-full">
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                </Button>
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-6 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/91fa687b5_RUGLYMASTERLOGO-61.png" 
            alt="Rugly" 
            className="h-8 mx-auto mb-4"
          />
          <p className="mb-2">Homesteads, LLC</p>
          <p className="text-sm text-gray-400">www.ruglyfloor.com</p>
          <p className="text-sm text-gray-400 mt-4">Custom-painted rugs for spaces that inspire</p>
        </div>
      </footer>
    </div>
  );
}