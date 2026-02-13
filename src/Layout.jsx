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
          /* Brand Color Palette */
          --brand-red: #f04624;
          --brand-cyan: #24f0a0;
          --brand-blue: #4075ff;
          --brand-light-gray: #F5F5F5;
          --brand-cream: #F7F1DA;
          --brand-dark: #343634;

          /* Primary Colors (RGB for Tailwind) */
          --primary: 64 117 255; /* brand-blue */
          --primary-hover: 240 70 36; /* brand-red */
          --accent: 36 240 160; /* brand-cyan */

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
          background-color: var(--brand-light-gray);
          color: var(--brand-dark);
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: var(--font-heading);
          color: var(--brand-dark);
        }

        button, .btn, [role="button"] {
          font-family: var(--font-button);
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .rugly-text {
          font-family: var(--font-rugly);
        }

        /* Override Tailwind colors with brand palette */
        .bg-blue-600, .bg-blue-700, .bg-primary { background-color: var(--brand-blue) !important; }
        .hover\\:bg-blue-700:hover, .hover\\:bg-primary-hover:hover { background-color: var(--brand-red) !important; }
        .bg-red-500, .bg-red-600 { background-color: var(--brand-red) !important; }
        .bg-green-600, .bg-green-500 { background-color: var(--brand-cyan) !important; }
        .bg-purple-600 { background-color: var(--brand-blue) !important; }
        .bg-gray-50 { background-color: var(--brand-cream) !important; }
        .bg-gray-100 { background-color: var(--brand-light-gray) !important; }
        .bg-gray-900 { background-color: var(--brand-dark) !important; }
        .bg-white { background-color: #ffffff !important; }

        .text-blue-600, .text-blue-700, .text-primary { color: var(--brand-blue) !important; }
        .text-red-500, .text-red-600 { color: var(--brand-red) !important; }
        .text-green-600 { color: var(--brand-cyan) !important; }
        .text-purple-600 { color: var(--brand-blue) !important; }
        .text-gray-900, .text-gray-800 { color: var(--brand-dark) !important; }
        .text-gray-700, .text-gray-600 { color: var(--brand-dark) !important; }
        .text-gray-500 { color: #6b7280 !important; }
        .text-gray-400 { color: #9ca3af !important; }
        .text-gray-300 { color: #d1d5db !important; }

        .border-blue-600, .border-blue-500 { border-color: var(--brand-blue) !important; }
        .border-red-500 { border-color: var(--brand-red) !important; }
        .border-green-600 { border-color: var(--brand-cyan) !important; }
        .border-purple-600, .border-purple-300 { border-color: var(--brand-blue) !important; }
        .border-gray-900 { border-color: var(--brand-dark) !important; }

        .hover\\:bg-blue-50:hover, .hover\\:bg-purple-50:hover { background-color: rgba(64, 117, 255, 0.1) !important; }
        .hover\\:bg-gray-50:hover { background-color: var(--brand-cream) !important; }
        .hover\\:text-blue-600:hover { color: var(--brand-blue) !important; }

        /* Gradient overrides */
        .from-purple-600, .from-pink-600 { --tw-gradient-from: var(--brand-blue) !important; }
        .to-blue-600, .to-purple-600 { --tw-gradient-to: var(--brand-red) !important; }
        .from-blue-50, .from-purple-50 { --tw-gradient-from: var(--brand-cream) !important; }
        .to-pink-50 { --tw-gradient-to: var(--brand-light-gray) !important; }
      `}</style>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50" style={{borderColor: 'var(--brand-blue)'}}>
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
                  className={`transition-colors ${
                    currentPageName === link.page ? 'font-semibold' : ''
                  }`}
                  style={{color: currentPageName === link.page ? 'var(--brand-blue)' : 'var(--brand-dark)'}}
                  onMouseEnter={(e) => e.target.style.color = 'var(--brand-blue)'}
                  onMouseLeave={(e) => e.target.style.color = currentPageName === link.page ? 'var(--brand-blue)' : 'var(--brand-dark)'}
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
                  className={`transition-colors py-2 ${
                    currentPageName === link.page ? 'font-semibold' : ''
                  }`}
                  style={{color: currentPageName === link.page ? 'var(--brand-blue)' : 'var(--brand-dark)'}}
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
      <footer className="py-16 px-6 mt-20" style={{backgroundColor: 'var(--brand-dark)', color: '#d1d5db'}}>
        <div className="max-w-7xl mx-auto">
          {/* Contact Us Section - Cutout Style */}
          <div className="rounded-2xl p-12 mb-12 text-center bg-white" style={{border: '4px solid var(--brand-blue)'}}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{color: 'var(--brand-dark)'}}>Get In Touch</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{color: 'var(--brand-dark)'}}>
              Have a question about custom rugs or need help with your order? We're here to help.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="rounded-xl p-6 transition-colors" style={{border: '2px solid var(--brand-blue)'}} 
                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-cream)'}
                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Mail className="w-8 h-8 mx-auto mb-3" style={{color: 'var(--brand-blue)'}} />
                <h3 className="font-bold text-lg mb-2" style={{color: 'var(--brand-dark)'}}>Email Us</h3>
                <a href="mailto:info@ruglyfloor.com" className="text-lg" style={{color: 'var(--brand-dark)'}}>
                  info@ruglyfloor.com
                </a>
              </div>

              <div className="rounded-xl p-6 transition-colors" style={{border: '2px solid var(--brand-blue)'}}
                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-cream)'}
                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div className="w-8 h-8 mx-auto mb-3 flex items-center justify-center text-2xl" style={{color: 'var(--brand-blue)'}}>📞</div>
                <h3 className="font-bold text-lg mb-2" style={{color: 'var(--brand-dark)'}}>Call Us</h3>
                <a href="tel:5177778474" className="text-lg" style={{color: 'var(--brand-dark)'}}>
                  (517) 777-8474
                </a>
              </div>

              <div className="rounded-xl p-6 transition-colors" style={{border: '2px solid var(--brand-blue)'}}
                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-cream)'}
                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div className="w-8 h-8 mx-auto mb-3 flex items-center justify-center text-2xl" style={{color: 'var(--brand-blue)'}}>🌐</div>
                <h3 className="font-bold text-lg mb-2" style={{color: 'var(--brand-dark)'}}>Visit Us</h3>
                <a href="https://ruglyfloors.com" className="text-lg" style={{color: 'var(--brand-dark)'}}>
                  www.ruglyfloors.com
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex justify-center gap-6">
              <a href="https://www.facebook.com/profile.php?id=61585565308752" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{color: 'var(--brand-dark)'}}
                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-blue)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--brand-dark)'}>
                <Facebook className="w-8 h-8" />
              </a>
              <a href="https://instagram.com/ruglyfloor" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{color: 'var(--brand-dark)'}}
                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-blue)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--brand-dark)'}>
                <Instagram className="w-8 h-8" />
              </a>
              <a href="https://twitter.com/ruglyfloor" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{color: 'var(--brand-dark)'}}
                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-blue)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--brand-dark)'}>
                <Twitter className="w-8 h-8" />
              </a>
              <a href="https://tiktok.com/@ruglyfloor" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{color: 'var(--brand-dark)'}}
                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-blue)'}
                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--brand-dark)'}>
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

            <div className="mt-6 pt-6" style={{borderTop: '1px solid rgba(255,255,255,0.1)'}}>
              {/* Trust Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <a href="https://www.yelp.com/biz/rugly-floor-lansing" target="_blank" rel="noopener noreferrer" className="text-center hover:opacity-80 transition-opacity">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs text-gray-400">5-Star Yelp Reviews</div>
                </a>
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
                  <div className="text-xs text-gray-400">Free shipping on all Crugly Purchases</div>
                </div>
              </div>

              {/* Footer Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <Link to={createPageUrl('Policies')} className="text-sm transition-colors" style={{color: '#9ca3af'}}
                      onMouseEnter={(e) => e.target.style.color = 'var(--brand-cyan)'}
                      onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                  Terms & Policies
                </Link>
                <a href="mailto:info@ruglyfloor.com" className="text-sm transition-colors" style={{color: '#9ca3af'}}
                   onMouseEnter={(e) => e.target.style.color = 'var(--brand-cyan)'}
                   onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                  Shipping & Returns
                </a>
                <Link to={createPageUrl('Contact')} className="text-sm transition-colors" style={{color: '#9ca3af'}}
                      onMouseEnter={(e) => e.target.style.color = 'var(--brand-cyan)'}
                      onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                  Contact Support
                </Link>
                <Link to={createPageUrl('AdminLogin')} className="text-sm transition-colors" style={{color: '#9ca3af'}}
                      onMouseEnter={(e) => e.target.style.color = 'var(--brand-cyan)'}
                      onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
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