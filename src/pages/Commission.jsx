import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, CheckCircle, Clock, Zap, Palette, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import AIPreviewPanel from '../components/commission/AIPreviewPanel';
import BusinessAccountPanel from '../components/commission/BusinessAccountPanel';
import ColorPaletteBuilder from '../components/commission/ColorPaletteBuilder';

const SIZES = ['2x3', '3x5', '4x6', '5x7', '6x9', '8x10', '9x12', 'Custom'];


export default function Commission() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiPreviewUrl, setAiPreviewUrl] = useState(null);
  const [markupNotes, setMarkupNotes] = useState([]);
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    inspirationImages: [],
    description: '',
    preferredSize: '',
    preferredColors: '',
    numColors: '3-4',
    budgetRange: '',
    projectType: 'residential',
    businessName: '',
    name: '',
    email: '',
    phone: '',
    rushOrder: false,
    agreedToDeposit: false
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, inspirationImages: [...prev.inspirationImages, file_url] }));
    } catch {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleMarkupSave = (url, notes) => {
    setAiPreviewUrl(url);
    setMarkupNotes(notes);
  };

  const handleLoadDesign = (savedDesign) => {
    if (savedDesign.form_data) setFormData(savedDesign.form_data);
    if (savedDesign.ai_preview_url) setAiPreviewUrl(savedDesign.ai_preview_url);
    if (savedDesign.markup_notes) setMarkupNotes(savedDesign.markup_notes.split('\n').filter(Boolean));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please provide your name, email, and phone number');
      return;
    }
    if (!formData.description) {
      alert('Please describe your design vision');
      return;
    }
    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('createCommissionCheckout', {
        formData: { ...formData, aiPreviewUrl, markupNotes },
        couponCode: null
      });
      if (response.data.orderId) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to submit commission');
      }
    } catch (error) {
      alert('Failed to submit. Please try again. Error: ' + error.message);
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--brand-blue)' }}>You're in the queue!</h1>
          <p className="text-xl text-gray-600 mb-4">
            We'll review your design and reach out within 48 hours with a detailed estimate.
          </p>
          <div className="rounded-2xl p-6 mb-8 text-left space-y-3" style={{ background: 'var(--brand-cream)', border: '2px solid var(--brand-blue)' }}>
            <p className="font-bold text-gray-800">What happens next:</p>
            <p className="text-sm text-gray-700">✅ We review your design concept and any AI preview you generated</p>
            <p className="text-sm text-gray-700">✅ You receive a detailed estimate within 48 hours</p>
            <p className="text-sm text-gray-700">✅ {formData.rushOrder ? '⚡ Rush: 2 weeks at your door' : '📅 Standard: 3–5 weeks production + shipping'}</p>
            <p className="text-sm text-gray-700">✅ Payment only after you approve</p>
          </div>
          <Button onClick={() => navigate('/')} className="px-8 py-4 text-lg" style={{ backgroundColor: 'var(--brand-blue)', color: 'white' }}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const STEPS = ['Design Vision', 'Your Space', 'Preview & Markup', 'Details & Submit'];

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--brand-light-gray)' }}>
      <SEOHead
        title="Commission a Custom Rugly Design | Bespoke Hand-Painted Rugs"
        description="Commission bespoke Rugly hand-painted area rug designs. AI-powered preview, designer markup tools, business accounts."
        keywords={['commission custom rug', 'bespoke hand-painted rug', 'custom rug design', 'interior designer rug']}
        url="/commission"
      />

      <div className="max-w-5xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
            style={{ background: 'var(--brand-cream)', color: 'var(--brand-blue)', border: '2px solid var(--brand-blue)' }}>
            <Sparkles className="w-4 h-4" /> DESIGNER COMMISSION STUDIO
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-dark)' }}>
            Commission Your <span style={{ color: 'var(--brand-red)' }}>Dream Rug</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your vision, generate an AI preview, mark it up, and submit — all in one place. Built for designers and dreamers.
          </p>
        </div>

        {/* Step Pills */}
        <div className="flex gap-2 justify-center mb-8 flex-wrap">
          {STEPS.map((step, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveStep(i)}
              className="px-4 py-2 rounded-full text-sm font-bold transition-all"
              style={activeStep === i
                ? { backgroundColor: 'var(--brand-blue)', color: 'white' }
                : { backgroundColor: 'white', color: 'var(--brand-dark)', border: '2px solid #e5e7eb' }}
            >
              {i + 1}. {step}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* LEFT COLUMN — Design Inputs */}
            <div className="md:col-span-2 space-y-6">

              {/* STEP 0 — Design Vision */}
              {(activeStep === 0 || activeStep > 0) && (
                <Card className="rounded-3xl shadow-sm overflow-hidden" style={{ border: '2px solid #e5e7eb' }}>
                  <div className="h-2" style={{ background: 'linear-gradient(90deg, var(--brand-blue), var(--brand-red))' }} />
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <span className="text-3xl">✏️</span> Design Vision
                    </CardTitle>
                    <p className="text-sm text-gray-500">Tell us about your dream rug — the more detail, the better your AI preview</p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <Label className="font-bold">Describe your design *</Label>
                      <Textarea
                        required
                        className="mt-2 h-28 resize-none text-base"
                        placeholder="e.g. A bold geometric pattern with navy and gold, abstract brushstrokes in the center, inspired by Moroccan tiles..."
                        value={formData.description}
                        onChange={(e) => update('description', e.target.value)}
                      />
                      <p className="text-xs text-gray-400 mt-1">{formData.description.length} chars — more detail = better AI preview</p>
                    </div>

                    {/* Size Picker */}
                    <div>
                      <Label className="font-bold">Preferred Size</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {SIZES.map(s => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => update('preferredSize', s)}
                            className="py-2 px-3 rounded-xl text-sm font-bold border-2 transition-all"
                            style={formData.preferredSize === s
                              ? { borderColor: 'var(--brand-blue)', backgroundColor: 'var(--brand-blue)', color: 'white' }
                              : { borderColor: '#e5e7eb', backgroundColor: 'white', color: 'var(--brand-dark)' }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Palette Picker */}
                    <div>
                      <Label className="font-bold">Color Palette</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {COLOR_PALETTES.map((p) => (
                          <button
                            type="button"
                            key={p.label}
                            onClick={() => {
                              setSelectedPalette(p.label);
                              update('preferredColors', p.label);
                            }}
                            className="p-3 rounded-xl border-2 text-left transition-all"
                            style={selectedPalette === p.label
                              ? { borderColor: 'var(--brand-blue)', backgroundColor: '#eff6ff' }
                              : { borderColor: '#e5e7eb', backgroundColor: 'white' }}
                          >
                            <div className="flex gap-1 mb-1">
                              {p.colors.map((c, i) => (
                                <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                            <div className="text-xs font-bold text-gray-700">{p.label}</div>
                          </button>
                        ))}
                      </div>
                      <Input
                        className="mt-2"
                        placeholder="Or describe your own: e.g. dusty rose with sage green"
                        value={selectedPalette ? '' : formData.preferredColors}
                        onChange={(e) => { setSelectedPalette(null); update('preferredColors', e.target.value); }}
                      />
                    </div>

                    {/* Complexity */}
                    <div>
                      <Label className="font-bold">Design Complexity</Label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        {[
                          { val: '1-2', label: 'Simple', emoji: '⬜', sub: '1–2 colors', img: null },
                          { val: '3-4', label: 'Moderate', emoji: null, sub: '3–4 colors', img: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/287aa7607_generated_image.png' },
                          { val: '5+', label: 'Complex', emoji: null, sub: '5+ colors', img: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/b226d5b01_generated_image.png' },
                        ].map(opt => (
                          <button
                            type="button"
                            key={opt.val}
                            onClick={() => update('numColors', opt.val)}
                            className="py-3 px-2 rounded-xl border-2 text-center transition-all overflow-hidden"
                            style={formData.numColors === opt.val
                              ? { borderColor: 'var(--brand-red)', backgroundColor: '#fff5f3', color: 'var(--brand-dark)' }
                              : { borderColor: '#e5e7eb', backgroundColor: 'white' }}
                          >
                            {opt.img ? (
                              <img src={opt.img} alt={opt.label} className="w-full h-20 object-cover rounded-lg mb-2" />
                            ) : (
                              <div className="text-2xl mb-1">{opt.emoji}</div>
                            )}
                            <div className="text-sm font-bold">{opt.label}</div>
                            <div className="text-xs text-gray-500">{opt.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <Label className="font-bold">Budget Range</Label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                        {[
                          { val: 'under-500', label: 'Under $500' },
                          { val: '500-1000', label: '$500–$1K' },
                          { val: '1000-2000', label: '$1K–$2K' },
                          { val: '2000+', label: '$2K+' },
                          { val: 'flexible', label: 'Flexible' },
                        ].map(b => (
                          <button
                            type="button"
                            key={b.val}
                            onClick={() => update('budgetRange', b.val)}
                            className="py-2 px-3 rounded-xl text-sm font-bold border-2 transition-all"
                            style={formData.budgetRange === b.val
                              ? { borderColor: 'var(--brand-cyan)', backgroundColor: '#f0fdf4', color: 'var(--brand-dark)' }
                              : { borderColor: '#e5e7eb', backgroundColor: 'white' }}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Inspiration Images */}
                    <div>
                      <Label className="font-bold">Upload Inspiration Images</Label>
                      <div className="mt-2">
                        <label htmlFor="inspiration-upload" className={`flex flex-col items-center justify-center w-full h-28 border-3 border-dashed rounded-2xl cursor-pointer transition-all ${uploading ? 'opacity-50' : 'hover:bg-gray-50'}`}
                          style={{ borderColor: 'var(--brand-blue)', borderWidth: '2px', borderStyle: 'dashed' }}>
                          <input
                            type="file"
                            id="inspiration-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                          {uploading ? (
                            <><Loader2 className="w-6 h-6 animate-spin mb-1" style={{ color: 'var(--brand-blue)' }} /><span className="text-sm text-gray-500">Uploading...</span></>
                          ) : (
                            <><Upload className="w-6 h-6 mb-1" style={{ color: 'var(--brand-blue)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--brand-blue)' }}>Click to upload reference image</span><span className="text-xs text-gray-400">Logos, art, room photos, etc.</span></>
                          )}
                        </label>
                        {formData.inspirationImages.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {formData.inspirationImages.map((url, idx) => (
                              <div key={idx} className="relative w-20 h-20">
                                <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                                <button
                                  type="button"
                                  onClick={() => update('inspirationImages', formData.inspirationImages.filter((_, i) => i !== idx))}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setActiveStep(1)}
                      className="w-full py-4 rounded-xl font-bold text-base"
                      style={{ backgroundColor: 'var(--brand-blue)', color: 'white', border: 'none' }}
                    >
                      Next: Tell Us About Your Space →
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* STEP 1 — Space & Timeline */}
              {(activeStep >= 1) && (
                <Card className="rounded-3xl shadow-sm" style={{ border: '2px solid #e5e7eb' }}>
                  <div className="h-2" style={{ background: 'linear-gradient(90deg, var(--brand-red), var(--brand-cyan))' }} />
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <span className="text-3xl">🏛️</span> Your Space & Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Project Type */}
                    <div>
                      <Label className="font-bold">Project Type</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {[
                          { val: 'residential', label: 'Residential', emoji: '🏠', sub: 'Home, apartment' },
                          { val: 'commercial', label: 'Commercial', emoji: '🏢', sub: 'Hotel, office, retail' },
                        ].map(opt => (
                          <button
                            type="button"
                            key={opt.val}
                            onClick={() => update('projectType', opt.val)}
                            className="py-4 rounded-2xl border-2 text-center transition-all"
                            style={formData.projectType === opt.val
                              ? { borderColor: 'var(--brand-blue)', backgroundColor: '#eff6ff' }
                              : { borderColor: '#e5e7eb', backgroundColor: 'white' }}
                          >
                            <div className="text-3xl mb-1">{opt.emoji}</div>
                            <div className="font-bold text-sm">{opt.label}</div>
                            <div className="text-xs text-gray-500">{opt.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.projectType === 'commercial' && (
                      <div>
                        <Label className="font-bold">Business Name</Label>
                        <Input className="mt-1" value={formData.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="Your Company LLC" />
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <Label className="font-bold">Production Timeline</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => update('rushOrder', false)}
                          className="p-4 rounded-2xl border-2 text-left transition-all"
                          style={!formData.rushOrder ? { borderColor: 'var(--brand-blue)', backgroundColor: '#eff6ff' } : { borderColor: '#e5e7eb', backgroundColor: 'white' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <span className="font-bold text-sm">Standard</span>
                          </div>
                          <div className="text-xs text-gray-600">3–5 weeks to your door</div>
                          <div className="text-base font-bold mt-1" style={{ color: 'var(--brand-blue)' }}>Included</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => update('rushOrder', true)}
                          className="p-4 rounded-2xl border-2 text-left transition-all"
                          style={formData.rushOrder ? { borderColor: 'var(--brand-red)', backgroundColor: '#fff5f3' } : { borderColor: '#e5e7eb', backgroundColor: 'white' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-5 h-5 text-orange-500" />
                            <span className="font-bold text-sm">Rush Order ⚡</span>
                          </div>
                          <div className="text-xs text-gray-600">2 weeks total — at your door</div>
                          <div className="text-base font-bold mt-1 text-orange-600">+$99</div>
                        </button>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="w-full py-4 rounded-xl font-bold text-base"
                      style={{ backgroundColor: 'var(--brand-red)', color: 'white', border: 'none' }}
                    >
                      Next: Generate AI Preview →
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* STEP 2 — AI Preview */}
              {(activeStep >= 2) && (
                <Card className="rounded-3xl shadow-sm" style={{ border: '2px solid #e5e7eb' }}>
                  <div className="h-2" style={{ background: 'linear-gradient(90deg, var(--brand-cyan), var(--brand-blue))' }} />
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <span className="text-3xl">🤖</span> AI Preview & Markup
                    </CardTitle>
                    <p className="text-sm text-gray-500">Generate a sample from your description, then draw notes directly on it</p>
                  </CardHeader>
                  <CardContent>
                    <AIPreviewPanel formData={formData} onMarkupSave={handleMarkupSave} />
                  </CardContent>
                  <div className="px-6 pb-6">
                    <Button
                      type="button"
                      onClick={() => setActiveStep(3)}
                      className="w-full py-4 rounded-xl font-bold text-base"
                      style={{ backgroundColor: 'var(--brand-cyan)', color: 'var(--brand-dark)', border: 'none' }}
                    >
                      Next: Contact & Submit →
                    </Button>
                  </div>
                </Card>
              )}

              {/* STEP 3 — Contact & Submit */}
              {(activeStep >= 3) && (
                <Card className="rounded-3xl shadow-sm" style={{ border: '2px solid #e5e7eb' }}>
                  <div className="h-2" style={{ background: 'linear-gradient(90deg, var(--brand-blue), var(--brand-dark))' }} />
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <span className="text-3xl">📬</span> Contact Info & Submit
                    </CardTitle>
                    <p className="text-sm text-gray-500">Free submission — payment only after you approve the estimate</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <Label className="font-bold">Name *</Label>
                        <Input required className="mt-1" value={formData.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Smith" />
                      </div>
                      <div>
                        <Label className="font-bold">Email *</Label>
                        <Input required type="email" className="mt-1" value={formData.email} onChange={(e) => update('email', e.target.value)} placeholder="jane@studio.com" />
                      </div>
                      <div>
                        <Label className="font-bold">Phone *</Label>
                        <Input required className="mt-1" value={formData.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(555) 123-4567" />
                      </div>
                    </div>

                    {/* Summary Box */}
                    <div className="rounded-2xl p-4 space-y-2 text-sm" style={{ backgroundColor: 'var(--brand-cream)', border: '2px solid var(--brand-blue)' }}>
                      <p className="font-bold text-gray-800">📋 Your Commission Summary</p>
                      {formData.preferredSize && <p>📐 Size: {formData.preferredSize}</p>}
                      {formData.preferredColors && <p>🎨 Colors: {formData.preferredColors}</p>}
                      {formData.budgetRange && <p>💰 Budget: {formData.budgetRange}</p>}
                      <p>⏱ Timeline: {formData.rushOrder ? '⚡ Rush — 2 weeks (+$99)' : 'Standard — 3–5 weeks'}</p>
                      {aiPreviewUrl && <p>🖼 AI Preview: Included</p>}
                      {markupNotes.length > 0 && <p>📝 Design notes: {markupNotes.length} added</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting || uploading}
                      className="w-full py-6 rounded-2xl text-lg font-black"
                      style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-red))', color: 'white', border: 'none' }}
                    >
                      {submitting ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</>
                      ) : (
                        '🚀 Submit Free Commission Request'
                      )}
                    </Button>
                    <p className="text-center text-xs text-gray-500">No payment required. We'll send a detailed estimate within 48 hours.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* RIGHT COLUMN — Business Account */}
            <div className="space-y-6">
              <BusinessAccountPanel
                formData={formData}
                aiPreviewUrl={aiPreviewUrl}
                markupNotes={markupNotes}
                onLoadDesign={handleLoadDesign}
              />

              {/* Timeline Explainer */}
              <Card className="rounded-3xl shadow-sm" style={{ border: '2px solid #e5e7eb' }}>
                <CardContent className="pt-6 space-y-4">
                  <p className="font-black text-lg">📅 How It Works</p>
                  {[
                    { icon: '📝', step: 'Submit free request', time: 'Now' },
                    { icon: '📬', step: 'Get detailed estimate', time: '48 hrs' },
                    { icon: '💳', step: 'Approve & pay deposit', time: 'After review' },
                    { icon: '🎨', step: 'We paint your rug', time: formData.rushOrder ? '~1 week' : '2–4 weeks' },
                    { icon: '🚚', step: 'Shipped to your door', time: formData.rushOrder ? '2 wks total' : '3–5 wks total' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-2xl">{s.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800">{s.step}</div>
                        <div className="text-xs text-gray-500">{s.time}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Why Rugly */}
              <div className="rounded-3xl p-5 space-y-3" style={{ background: 'var(--brand-dark)', color: 'white' }}>
                <p className="font-black text-lg">⭐ Why Rugly?</p>
                <p className="text-sm opacity-80">100% hand-painted, one-of-a-kind rugs used by interior designers, boutique hotels, and brands.</p>
                <div className="space-y-2 text-sm">
                  <p>✅ Real artists, no print-on-demand</p>
                  <p>✅ Any size, any design</p>
                  <p>✅ Free design estimate</p>
                  <p>✅ 24hr damage guarantee</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}