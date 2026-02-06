import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { ShoppingCart, Menu, X, Facebook, Instagram, Twitter, Mail, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Optional auth check for public app
    base44.auth.isAuthenticated().then(isAuth => {
      if (isAuth) {
        base44.auth.me().then(setUser).catch(() => setUser(null));
      } else {
        setUser(null);
      }
    }).catch(() => setUser(null));
    
    // Track site entry time and referrer
    if (!sessionStorage.getItem('rugly_site_start_time')) {
      sessionStorage.setItem('rugly_site_start_time', Date.now().toString());
    }
    if (!sessionStorage.getItem('rugly_referrer')) {
      sessionStorage.setItem('rugly_referrer', document.referrer || 'direct');
    }

    // Google Analytics
    const script1 = document.createElement('script');
    script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-6DSQKNVFMB';
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6DSQKNVFMB');
    `;
    document.head.appendChild(script2);
  }, []);

  const navLinks = [
    { name: 'Home', page: 'Home' },
    { name: 'Build Your Rug', page: 'CustomBuilder' },
    { name: 'Shop Originals', page: 'Shop' },
    { name: 'Commission Rugley', page: 'Commission' },
    { name: 'Fix My Rug', page: 'FixMyRug' },
    { name: 'About', page: 'About' },
    { name: 'Contact', page: 'Contact' },
    { name: 'My Orders', page: 'Orders' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
          {/* Favicon */}
          <link rel="icon" href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/d71f153d8_RUGLYMASTERLOGO-92.png" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,700;0,900;1,100;1,700&family=Baumans&family=Kameron:wght@400..700&family=Major+Mono+Display&family=Roboto:wght@400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Allerta+Stencil&family=Big+Shoulders+Stencil+Display:wght@400;700;900&family=Saira+Stencil+One&family=Black+Ops+One&family=Wallpoet&family=Kenia&family=Plaster&family=Emblema+One&family=Protest+Guerrilla&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Magistral&display=swap');

        :root {
          /* Primary Brand Color - Change this to customize your accent color */
          --primary: 37 99 235; /* Blue (rgb format for Tailwind) */
          --primary-hover: 29 78 216;

          /* You can change to other colors like:
             --primary: 147 51 234; (Purple)
             --primary: 34 197 94; (Green)
             --primary: 239 68 68; (Red)
          */

          /* Typography */
          --font-heading: 'Barlow Condensed', sans-serif;
          --font-body: 'Roboto', sans-serif;
          --font-accent: 'Baumans', sans-serif;
          --font-display: 'Boldonse', sans-serif;
          --font-serif: 'Kameron', serif;
          --font-script: 'Qwitcher Grypen', cursive;
          --font-button: 'Big Shoulders Stencil Display', sans-serif;
          --font-rugly: 'Magistral', sans-serif;
          }
        
        body {
          font-family: var(--font-body);
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading);
        }

        button, .btn, [role="button"] {
          font-family: var(--font-button);
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .rugly-text {
          font-family: var(--font-rugly);
        }
        
        /* Custom primary color classes */
        .bg-primary { background-color: rgb(var(--primary)); }
        .text-primary { color: rgb(var(--primary)); }
        .border-primary { border-color: rgb(var(--primary)); }
        .hover\\:bg-primary-hover:hover { background-color: rgb(var(--primary-hover)); }
      `}</style>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/9a05f04b4_RUGLYMASTERLOGO-92.png" 
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
      <footer className="bg-gray-900 text-gray-300 py-16 px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          {/* Contact Us Section - Cutout Style */}
          <div className="border-4 border-gray-900 rounded-2xl p-12 mb-12 text-center bg-white">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Have a question about custom rugs or need help with your order? We're here to help.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="border-2 border-gray-900 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                <Mail className="w-8 h-8 mx-auto mb-3 text-gray-900" />
                <h3 className="text-gray-900 font-bold text-lg mb-2">Email Us</h3>
                <a href="mailto:info@ruglyfloor.com" className="text-gray-600 hover:text-gray-900 text-lg">
                  info@ruglyfloor.com
                </a>
              </div>

              <div className="border-2 border-gray-900 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 mx-auto mb-3 text-gray-900 flex items-center justify-center text-2xl">📞</div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">Call Us</h3>
                <a href="tel:5177778474" className="text-gray-600 hover:text-gray-900 text-lg">
                  (517) 777-8474
                </a>
              </div>

              <div className="border-2 border-gray-900 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 mx-auto mb-3 text-gray-900 flex items-center justify-center text-2xl">🌐</div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">Visit Us</h3>
                <a href="https://ruglyfloors.com" className="text-gray-600 hover:text-gray-900 text-lg">
                  www.ruglyfloors.com
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex justify-center gap-6">
              <a href="https://www.facebook.com/profile.php?id=61585565308752" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Facebook className="w-8 h-8" />
              </a>
              <a href="https://instagram.com/ruglyfloor" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Instagram className="w-8 h-8" />
              </a>
              <a href="https://twitter.com/ruglyfloor" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Twitter className="w-8 h-8" />
              </a>
              <a href="https://tiktok.com/@ruglyfloor" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                <Video className="w-8 h-8" />
              </a>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="text-center">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/d71f153d8_RUGLYMASTERLOGO-92.png" 
              alt="Rugly" 
              className="h-10 mx-auto mb-4 opacity-70"
            />
            <p className="text-sm mb-2">Homesteads, LLC</p>
            <p className="text-sm text-gray-500">Custom-painted rugs for spaces that inspire</p>

            <div className="mt-6 pt-6 border-t border-gray-800">
              {/* Trust Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs text-gray-400">5-Star Yelp Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🔒</div>
                  <div className="text-xs text-gray-400">Secure Checkout</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">✓</div>
                  <div className="text-xs text-gray-400">24-Hour Guarantee</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🚚</div>
                  <div className="text-xs text-gray-400">Free Ship on 2+ Rugs</div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <Link to={createPageUrl('Policies')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms & Policies
                </Link>
                <a href="mailto:info@ruglyfloor.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Shipping & Returns
                </a>
                <Link to={createPageUrl('Contact')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact Support
                </Link>
                <Link to={createPageUrl('AdminLogin')} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}