import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, RotateCcw, Droplets, ShieldCheck, AlertTriangle } from 'lucide-react';

const RUG_TYPES = [
  {
    id: 'crugly',
    name: 'Crugly',
    tagline: 'Cost Efficient, looks great, customized, free shipping, 2 or less colors',
    image: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/e9b89c88d_Crugly.png',
    bg: '#2de89a',
    text: '#1a1a1a',
    accent: '#1a1a1a',
    shipping: 'FREE shipping — No minimum, no catch.',
    shippingDetail: 'Every Crugly ships completely free within the continental United States. Carefully packaged and delivered to your door.',
    delivery: '14 days estimated arrival',
    returns: '30-Day Return Policy',
    returnsDetail: 'Not happy? Return your Crugly within 30 days of delivery. Item must be in original condition. Return shipping is the customer\'s responsibility. Refund processed within 5–7 business days once received and inspected.',
    care: 'Machine Washable',
    careDetail: 'Your Crugly can be machine washed. Use cold water, gentle cycle. Lay flat or hang to dry.',
    warranty: null,
  },
  {
    id: 'rugly',
    name: 'Rugly',
    tagline: 'Our signature line — quality, gorgeous, at a fair price',
    image: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/89ac62d65_Rugly.png',
    bg: '#4d7eff',
    text: '#ffffff',
    accent: '#ffffff',
    shipping: 'Flat rate shipping based on size',
    shippingDetail: 'Tiny (2×3): $15 · Small (3×5): $30 · Medium (4×6): $45 · Large (5×7): $60 · Huge (7×9+): $75+. Ships via ground carrier within the continental US.',
    delivery: 'Estimated 14–21 business days',
    returns: '5-Year Warranty',
    returnsDetail: 'Rugly rugs come with a 5-year warranty covering manufacturing defects. Contact us within the warranty period with photos to initiate a claim. Refund or replacement issued at our discretion.',
    care: 'Shampoo with rug cleaner (wet)',
    careDetail: 'Can be shampooed with a rug cleaner (wet method). Do not machine wash. Blot spills immediately. Rotate periodically for even wear.',
    warranty: '5-Year Warranty',
  },
  {
    id: 'ruglux',
    name: 'Ruglux',
    tagline: 'High end, 3-D, Unlimited',
    image: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/d20d99086_RugLux.png',
    bg: '#3d3d3d',
    text: '#ffffff',
    accent: '#d4af37',
    shipping: 'Flat rate — $15 for Tiny, +$15 per size up',
    shippingDetail: 'Tiny (2×3): $15 · Small (3×5): $30 · Medium (4×6): $45 · Large (5×7): $60 · Huge (7×9+): $75. White-glove packaging on all Ruglux pieces.',
    delivery: 'Estimated 3–6 weeks (artist-level detail)',
    returns: 'Lifetime Warranty',
    returnsDetail: 'Ruglux is our top-tier artisan rug — backed by a lifetime warranty against manufacturing defects. Contact us at any time with photos and your order number. We\'ll make it right.',
    care: 'Dry clean or professional rug cleaning only',
    careDetail: 'Ruglux rugs must be dry cleaned or professionally cleaned by a rug specialist. Do NOT machine wash, wet clean, or shampoo. Blot spills gently with a dry cloth immediately.',
    warranty: 'Lifetime Warranty',
  },
  {
    id: 'square',
    name: 'Rugly Square',
    tagline: 'Cover any floor, any size, your way!',
    image: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/2c394fd62_Square.png',
    bg: '#e83a1a',
    text: '#ffffff',
    accent: '#ffffff',
    shipping: 'FREE shipping — Always.',
    shippingDetail: 'Every Rugly Square order ships completely free within the continental United States.',
    delivery: 'Estimated 14–21 business days',
    returns: '90-Day Return Policy',
    returnsDetail: 'Return your Rugly Square within 90 days of delivery. Item must be in original condition. Return shipping is the customer\'s responsibility. Refund processed within 5–7 business days once received and inspected.',
    care: 'Can be mopped or hosed down',
    careDetail: 'Rugly Square tiles are built for durability. Mop with a damp mop or hose down as needed. Let air dry completely before replacing on floor.',
    warranty: null,
  },
];

function RugTypeCard({ rug }) {
  const [open, setOpen] = useState(false);
  const bodyStyle = {
    backgroundColor: `${rug.bg} !important`,
    background: rug.bg,
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border-2" style={{ borderColor: rug.bg, backgroundColor: rug.bg }}>
      {/* Header Image */}
      <div className="relative">
        <img src={rug.image} alt={rug.name} className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
      </div>

      {/* Body */}
      <div className="p-6" ref={el => { if (el) el.style.setProperty('background-color', rug.bg, 'important'); }}>
        <h2 className="text-3xl font-bold mb-1" style={{ color: rug.text, fontFamily: 'var(--font-heading)' }}>{rug.name}</h2>
        <p className="text-sm mb-4 opacity-80" style={{ color: rug.text }}>{rug.tagline}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-black/20 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" style={{ color: rug.accent }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: rug.accent }}>Shipping</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: rug.text }}>{rug.shipping}</p>
            <p className="text-xs opacity-70" style={{ color: rug.text }}>{rug.delivery}</p>
          </div>

          <div className="rounded-xl p-3 bg-black/20 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" style={{ color: rug.accent }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: rug.accent }}>Returns</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: rug.text }}>{rug.returns}</p>
            {rug.warranty && (
              <div className="flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3 h-3" style={{ color: rug.accent }} />
                <span className="text-xs opacity-80" style={{ color: rug.text }}>{rug.warranty}</span>
              </div>
            )}
          </div>

          <div className="col-span-2 rounded-xl p-3 bg-black/20 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4" style={{ color: rug.accent }} />
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: rug.accent }}>Care</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: rug.text }}>{rug.care}</p>
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="mt-4 w-full py-2 rounded-xl text-sm font-bold transition-all bg-black/30 hover:bg-black/40"
          style={{ color: rug.text, fontFamily: 'var(--font-button)' }}
        >
          {open ? 'Hide Details ▲' : 'View Full Policy ▼'}
        </button>

        {open && (
          <div className="mt-4 space-y-3 text-sm" style={{ color: rug.text }}>
            <div>
              <p className="font-bold mb-1">📦 Shipping Details</p>
              <p className="opacity-80">{rug.shippingDetail}</p>
            </div>
            <div>
              <p className="font-bold mb-1">🔄 Return Policy</p>
              <p className="opacity-80">{rug.returnsDetail}</p>
            </div>
            <div>
              <p className="font-bold mb-1">🧼 Care Instructions</p>
              <p className="opacity-80">{rug.careDetail}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Policies() {
  return (
    <div className="min-h-screen py-12 px-6" style={{ backgroundColor: 'var(--brand-light-gray)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3" style={{ color: 'var(--brand-dark)', fontFamily: 'var(--font-heading)' }}>
            Policies & Terms
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every Rugly product line has its own shipping, return, and care policies tailored to the product. Find yours below.
          </p>
        </div>

        {/* Damage / Stains Disclaimer */}
        <div className="rounded-2xl p-6 mb-10 flex gap-4 items-start" style={{ backgroundColor: '#fff3cd', border: '2px solid #f04624' }}>
          <AlertTriangle className="w-8 h-8 flex-shrink-0 mt-0.5" style={{ color: '#f04624' }} />
          <div>
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-dark)' }}>Important: Stains & Damage Not Covered</h3>
            <p className="text-gray-700">
              Our return and warranty policies do <strong>not</strong> cover damage caused by stains, improper cleaning, misuse, pet damage, or normal wear and tear.
              All rugs are hand-painted artworks — color variation inherent to handmade goods is not a defect.
              Damage caused after delivery is the sole responsibility of the customer.
            </p>
          </div>
        </div>

        {/* Rug Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {RUG_TYPES.map(rug => <RugTypeCard key={rug.id} rug={rug} />)}
        </div>

        {/* How to Start a Return */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}>How to Start a Return</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <ol className="list-decimal ml-6 space-y-2">
              <li>Email <strong>info@ruglyfloor.com</strong> with your order number and a description. Photos of any damage are always helpful.</li>
              <li>We'll confirm your return eligibility and send instructions.</li>
              <li>Ship the rug back — <strong>return shipping is the customer's responsibility.</strong></li>
              <li>Refund processed within <strong>5–7 business days</strong> of receipt and inspection.</li>
            </ol>
            <p className="text-sm text-gray-500 mt-2">Upon approval, we will either ship a corrected replacement rug or issue a full refund — your choice. No refund will be issued until the returned item has been received and inspected at our studio.</p>
          </CardContent>
        </Card>

        {/* SMS Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}>SMS/Text Messaging Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p className="font-semibold">Effective Date: January 19, 2026</p>
            <p>By providing your phone number, you agree to receive text messages from Rugly Floors (Homesteads, LLC) for order updates, shipping notifications, and customer service. Consent is not required as a condition of purchase.</p>
            <p>Reply <strong>STOP</strong> to opt out at any time. Reply <strong>HELP</strong> for support. Message and data rates may apply.</p>
            <p>Contact: (517) 777-8474 | info@ruglyfloor.com</p>
          </CardContent>
        </Card>

        {/* Terms of Service */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>By placing an order with Rugly (operated by Homesteads, LLC), you agree to the following:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>All rugs are hand-painted. Slight variations in color and texture are inherent to handmade goods and are not defects.</li>
              <li>Orders may be cancelled within 24 hours of purchase if production has not begun. After production starts, no cancellations.</li>
              <li>By uploading designs, you confirm you own or have rights to the content.</li>
              <li>Rugly's liability is limited to the purchase price of the product.</li>
              <li>Payment is processed securely through Stripe.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>We collect name, email, phone, shipping address, and design files to process your order. This data is used solely for order fulfillment, communications, and support. We do not sell your data. Payment is processed by Stripe and never stored on our servers.</p>
            <p>To access, correct, or delete your data, contact us at info@ruglyfloor.com.</p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem' }}>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700 space-y-1">
            <p><strong>Email:</strong> info@ruglyfloor.com</p>
            <p><strong>Phone:</strong> (517) 777-8474</p>
            <p><strong>Website:</strong> www.ruglyfloor.com</p>
            <p><strong>Business:</strong> Homesteads, LLC</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}