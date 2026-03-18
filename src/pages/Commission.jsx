import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, Clock, Zap, Sparkles, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import AIPreviewPanel from '../components/commission/AIPreviewPanel';
import BusinessAccountPanel from '../components/commission/BusinessAccountPanel';
import ColorPaletteBuilder from '../components/commission/ColorPaletteBuilder';
import FloorPlanBuilder from '../components/commission/FloorPlanBuilder';

const SIZES = ['2x3', '3x5', '4x6', '5x7', '6x9', '8x10', '9x12', 'Custom'];
const STEPS = ['Design Vision', 'Floor Plan', 'Your Space', 'AI Preview', 'Submit'];

// Reusable tile button — selected = brand-blue border + light fill
function Tile({ selected, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 text-left transition-all duration-150 ${className}`}
      style={
        selected
          ? { borderColor: 'var(--brand-blue)', backgroundColor: 'rgba(64,117,255,0.07)', color: 'var(--brand-dark)' }
          : { borderColor: '#e5e7eb', backgroundColor: '#fff', color: 'var(--brand-dark)' }
      }
    >
      {children}
    </button>
  );
}

function SectionCard({ step, title, subtitle, required: requiredFields = [], optional = false, children }) {
  const accent = ['var(--brand-blue)', 'var(--brand-dark)', 'var(--brand-red)', 'var(--brand-cyan)', 'var(--brand-dark)'][step] || 'var(--brand-blue)';
  return (
    <Card className="rounded-2xl shadow-sm overflow-hidden bg-white" style={{ border: '1.5px solid #e5e7eb' }}>
      <div className="h-1.5" style={{ backgroundColor: accent }} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl font-black" style={{ color: 'var(--brand-dark)' }}>{title}</CardTitle>
            {subtitle && <p className="text-sm text-gray-500 font-normal mt-1">{subtitle}</p>}
          </div>
          {optional && (
            <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full mt-1" style={{ background: '#f3f4f6', color: '#9ca3af' }}>Optional</span>
          )}
        </div>
        {requiredFields.length > 0 && (
          <p className="text-xs font-semibold mt-2" style={{ color: accent }}>
            Required: {requiredFields.join(', ')}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6 pt-0">{children}</CardContent>
    </Card>
  );
}

function FieldGroup({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label className="font-bold text-sm" style={{ color: 'var(--brand-dark)' }}>{label}</Label>
        {required && <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(240,70,36,0.1)', color: 'var(--brand-red)' }}>Required</span>}
        {!required && <span className="text-xs text-gray-400">Optional</span>}
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

export default function Commission() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiPreviewUrl, setAiPreviewUrl] = useState(null);
  const [markupNotes, setMarkupNotes] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  const [floorPlan, setFloorPlan] = useState(null);

  const [formData, setFormData] = useState({
    inspirationImages: [],
    description: '',
    preferredSize: '',
    preferredColors: [],
    numColors: '3-4',
    budgetRange: '',
    projectType: 'residential',
    businessName: '',
    name: '',
    email: '',
    phone: '',
    rushOrder: false,
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
        formData: { ...formData, aiPreviewUrl, markupNotes, floorPlan },
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
      <div className="min-h-screen flex items-center justify-center py-20 px-6" style={{ background: 'var(--brand-light-gray)' }}>
        <div className="max-w-lg w-full text-center bg-white rounded-2xl p-10 shadow-sm" style={{ border: '1.5px solid #e5e7eb' }}>
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--brand-blue)' }} />
          <h1 className="text-4xl font-black mb-3" style={{ color: 'var(--brand-dark)' }}>Request Received</h1>
          <p className="text-gray-500 mb-6">We'll review your design and send a detailed estimate within 48 hours. No payment needed yet.</p>
          <div className="rounded-xl p-5 mb-6 text-left space-y-2 text-sm" style={{ background: 'var(--brand-cream)', border: '1.5px solid #e5e7eb' }}>
            <p className="font-bold text-gray-700 mb-2">What happens next</p>
            <p className="text-gray-600">— We review your concept &amp; AI preview</p>
            <p className="text-gray-600">— Detailed estimate arrives within 48 hrs</p>
            <p className="text-gray-600">— {formData.rushOrder ? 'Rush: shipped in ~2 weeks' : 'Standard: 3–5 weeks to your door'}</p>
            <p className="text-gray-600">— Payment only after you approve</p>
          </div>
          <Button onClick={() => navigate('/')} className="px-8 py-3 font-bold" style={{ backgroundColor: 'var(--brand-blue)', color: 'white', border: 'none' }}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--brand-light-gray)' }}>
      <SEOHead
        title="Commission a Custom Rugly Design | Bespoke Hand-Painted Rugs"
        description="Commission bespoke Rugly hand-painted area rug designs. AI-powered preview, designer markup tools, business accounts."
        keywords={['commission custom rug', 'bespoke hand-painted rug', 'custom rug design', 'interior designer rug']}
        url="/commission"
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ background: 'var(--brand-cream)', color: 'var(--brand-blue)', border: '1.5px solid var(--brand-blue)' }}>
            <Sparkles className="w-3.5 h-3.5" /> COMMISSION STUDIO
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-dark)' }}>
            Commission Your <span style={{ color: 'var(--brand-red)' }}>Dream Rug</span>
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto">
            Describe your vision, generate an AI preview, and submit — all free. Payment only after you approve.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <button
                type="button"
                onClick={() => setActiveStep(i)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={activeStep === i
                  ? { backgroundColor: 'var(--brand-blue)', color: 'white' }
                  : { backgroundColor: 'transparent', color: activeStep > i ? 'var(--brand-blue)' : '#9ca3af' }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={activeStep > i
                    ? { backgroundColor: 'var(--brand-blue)', color: 'white' }
                    : activeStep === i
                      ? { backgroundColor: 'white', color: 'var(--brand-blue)' }
                      : { backgroundColor: '#e5e7eb', color: '#9ca3af' }}>
                  {activeStep > i ? '✓' : i + 1}
                </span>
                <span className="hidden sm:inline">{step}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="w-6 h-0.5 mx-1" style={{ backgroundColor: activeStep > i ? 'var(--brand-blue)' : '#e5e7eb' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-3 gap-6">

            {/* LEFT — Steps */}
            <div className="md:col-span-2 space-y-5">

              {/* STEP 0 — Design Vision */}
              {activeStep === 0 && (
                <SectionCard step={0} title="Design Vision" subtitle="Tell us about your dream rug. The more detail you add, the better your AI preview will be.">

                  <FieldGroup label="Describe your design" required hint="Colors, patterns, mood, inspiration — the more detail, the better.">
                    <Textarea
                      className="mt-1 h-32 resize-none"
                      placeholder="e.g. Bold geometric pattern with navy and gold, abstract brushstrokes, Moroccan tile inspiration..."
                      value={formData.description}
                      onChange={(e) => update('description', e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">{formData.description.length} / 20 characters minimum</p>
                  </FieldGroup>

                  <FieldGroup label="Preferred Size" required hint="Pick the size that fits your space — we'll confirm during the estimate.">
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {SIZES.map(s => (
                        <Tile key={s} selected={formData.preferredSize === s} onClick={() => update('preferredSize', s)}
                          className="py-2 text-center text-sm font-bold">
                          {s}
                        </Tile>
                      ))}
                    </div>
                  </FieldGroup>

                  <div className="border-t pt-5" style={{ borderColor: '#f0f0f0' }}>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4">Optional — but helps us get it right</p>

                    <div className="space-y-6">
                      <FieldGroup label="Color Palette" hint="Pick a preset or build your own with specific hex colors.">
                        <ColorPaletteBuilder
                          value={formData.preferredColors}
                          onChange={(colors) => update('preferredColors', colors)}
                        />
                      </FieldGroup>

                      <FieldGroup label="Design Complexity" hint="How many paint colors should your rug use?">
                        <div className="grid grid-cols-3 gap-3 mt-1">
                          {[
                            { val: '1-2', label: 'Simple', sub: '1–2 colors', img: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/4247087cb_generated_image.png' },
                            { val: '3-4', label: 'Moderate', sub: '3–4 colors', img: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/085b8e540_generated_image.png' },
                            { val: '5+', label: 'Complex', sub: '5+ colors', img: 'https://media.base44.com/images/public/695ded1a209dda33af9a1cf6/b226d5b01_generated_image.png' },
                          ].map(opt => (
                            <Tile key={opt.val} selected={formData.numColors === opt.val} onClick={() => update('numColors', opt.val)}
                              className="overflow-hidden p-0 text-center">
                              <img src={opt.img} alt={opt.label} className="w-full h-24 object-cover" />
                              <div className="p-2">
                                <div className="text-sm font-bold">{opt.label}</div>
                                <div className="text-xs text-gray-400">{opt.sub}</div>
                              </div>
                            </Tile>
                          ))}
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Budget Range" hint="Helps us tailor the estimate — no payment now.">
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-1">
                          {[
                            { val: '350-500', label: '$350–$500' },
                            { val: '500-1000', label: '$500–$1K' },
                            { val: '1000-2000', label: '$1K–$2K' },
                            { val: '2000+', label: '$2K+' },
                            { val: 'flexible', label: 'Flexible' },
                          ].map(b => (
                            <Tile key={b.val} selected={formData.budgetRange === b.val} onClick={() => update('budgetRange', b.val)}
                              className="py-2 text-center text-sm font-bold">
                              {b.label}
                            </Tile>
                          ))}
                        </div>
                      </FieldGroup>

                      <FieldGroup label="Inspiration Images" hint="Logos, art, room photos — anything that captures your vision.">
                        <label htmlFor="inspiration-upload"
                          className={`flex flex-col items-center justify-center w-full h-24 rounded-xl cursor-pointer transition-all mt-1 ${uploading ? 'opacity-50' : 'hover:bg-gray-50'}`}
                          style={{ border: '2px dashed #e5e7eb' }}>
                          <input type="file" id="inspiration-upload" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                          {uploading
                            ? <><Loader2 className="w-5 h-5 animate-spin mb-1 text-gray-400" /><span className="text-xs text-gray-400">Uploading...</span></>
                            : <><Upload className="w-5 h-5 mb-1" style={{ color: 'var(--brand-blue)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--brand-blue)' }}>Click to upload</span></>
                          }
                        </label>
                        {formData.inspirationImages.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {formData.inspirationImages.map((url, idx) => (
                              <div key={idx} className="relative w-16 h-16">
                                <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                                <button type="button" onClick={() => update('inspirationImages', formData.inspirationImages.filter((_, i) => i !== idx))}
                                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: 'var(--brand-red)', color: 'white' }}>
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </FieldGroup>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      if (!formData.description || formData.description.length < 20) return alert('Please describe your design (at least 20 characters).');
                      if (!formData.preferredSize) return alert('Please select a preferred size.');
                      setActiveStep(1);
                    }}
                    className="w-full py-3 font-bold flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--brand-blue)', color: 'white', border: 'none' }}>
                    Continue to Floor Plan <ChevronRight className="w-4 h-4" />
                  </Button>
                </SectionCard>
              )}

              {/* STEP 1 — Floor Plan Builder */}
              {activeStep === 1 && (
                <SectionCard step={1} title="Floor Plan Builder" optional subtitle="Drag furniture, set room dimensions, and see how the rug fits your space. Skipping is fine — we'll follow up.">
                  <FloorPlanBuilder rugSize={formData.preferredSize} onChange={setFloorPlan} />
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setActiveStep(0)} className="flex-1 py-3 font-bold">
                      ← Back
                    </Button>
                    <Button type="button" onClick={() => setActiveStep(2)} className="flex-1 py-3 font-bold flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--brand-dark)', color: 'white', border: 'none' }}>
                      Continue to Your Space <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </SectionCard>
              )}

              {/* STEP 2 — Space & Timeline */}
              {activeStep === 2 && (
                <SectionCard step={2} title="Your Space & Timeline" subtitle="Two quick questions — both required to proceed.">

                  <FieldGroup label="Where is this rug going?" required>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      {[
                        { val: 'residential', label: 'Residential', sub: 'Home, apartment, condo' },
                        { val: 'commercial', label: 'Commercial', sub: 'Hotel, office, retail' },
                      ].map(opt => (
                        <Tile key={opt.val} selected={formData.projectType === opt.val} onClick={() => update('projectType', opt.val)}
                          className="p-4">
                          <div className="font-bold text-sm">{opt.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                        </Tile>
                      ))}
                    </div>
                  </FieldGroup>

                  {formData.projectType === 'commercial' && (
                    <FieldGroup label="Business Name" hint="We'll include this on your estimate.">
                      <Input className="mt-1" value={formData.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="Your Company LLC" />
                    </FieldGroup>
                  )}

                  <FieldGroup label="How soon do you need it?" required>
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <Tile selected={!formData.rushOrder} onClick={() => update('rushOrder', false)} className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-sm">Standard</span>
                        </div>
                        <div className="text-xs text-gray-400">3–5 weeks to your door</div>
                        <div className="text-sm font-bold mt-2" style={{ color: 'var(--brand-blue)' }}>Included</div>
                      </Tile>
                      <Tile selected={formData.rushOrder} onClick={() => update('rushOrder', true)} className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4" style={{ color: 'var(--brand-red)' }} />
                          <span className="font-bold text-sm">Rush Order</span>
                        </div>
                        <div className="text-xs text-gray-400">2 weeks total — at your door</div>
                        <div className="text-sm font-bold mt-2" style={{ color: 'var(--brand-red)' }}>+$99</div>
                      </Tile>
                    </div>
                  </FieldGroup>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setActiveStep(1)} className="flex-1 py-3 font-bold">
                      ← Back
                    </Button>
                    <Button type="button" onClick={() => setActiveStep(3)} className="flex-1 py-3 font-bold flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--brand-red)', color: 'white', border: 'none' }}>
                      Generate AI Preview <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </SectionCard>
              )}

              {/* STEP 3 — AI Preview */}
              {activeStep === 3 && (
                <SectionCard step={3} title="AI Preview & Markup" optional subtitle="Click 'Generate Preview' to see your rug come to life — then draw notes directly on the image. You can skip and submit without a preview.">
                  <AIPreviewPanel formData={formData} onMarkupSave={handleMarkupSave} />
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setActiveStep(2)} className="flex-1 py-3 font-bold">
                      ← Back
                    </Button>
                    <Button type="button" onClick={() => setActiveStep(4)} className="flex-1 py-3 font-bold flex items-center justify-center gap-2"
                      style={{ backgroundColor: 'var(--brand-cyan)', color: 'var(--brand-dark)', border: 'none' }}>
                      Continue to Submit <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </SectionCard>
              )}

              {/* STEP 4 — Submit */}
              {activeStep === 4 && (
                <SectionCard step={4} title="Almost Done — Contact Info" subtitle="All three fields are required. We'll send your free estimate within 48 hours. No payment now.">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--brand-red)' }}>All fields required</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <FieldGroup label="Your Name" required>
                      <Input className="mt-1" value={formData.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Smith" />
                    </FieldGroup>
                    <FieldGroup label="Email" required>
                      <Input type="email" className="mt-1" value={formData.email} onChange={(e) => update('email', e.target.value)} placeholder="jane@studio.com" />
                    </FieldGroup>
                    <FieldGroup label="Phone" required>
                      <Input className="mt-1" value={formData.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(555) 123-4567" />
                    </FieldGroup>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl p-4 space-y-2 text-sm" style={{ backgroundColor: 'var(--brand-cream)', border: '1.5px solid #e5e7eb' }}>
                    <p className="font-bold text-gray-700 mb-1">Commission Summary</p>
                    {formData.preferredSize && <p className="text-gray-600">Size: <strong>{formData.preferredSize}</strong></p>}
                    {formData.numColors && <p className="text-gray-600">Complexity: <strong>{formData.numColors} colors</strong></p>}
                    {formData.budgetRange && <p className="text-gray-600">Budget: <strong>{formData.budgetRange}</strong></p>}
                    <p className="text-gray-600">Timeline: <strong>{formData.rushOrder ? 'Rush — 2 weeks (+$99)' : 'Standard — 3–5 weeks'}</strong></p>
                    {formData.preferredColors?.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-600">Colors:</span>
                        {formData.preferredColors.map((c, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} title={c} />
                        ))}
                      </div>
                    )}
                    {aiPreviewUrl && <p className="text-gray-600">AI Preview: <strong>Included</strong></p>}
                    {markupNotes.length > 0 && <p className="text-gray-600">Design notes: <strong>{markupNotes.length} added</strong></p>}
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setActiveStep(3)} className="flex-1 py-3 font-bold">
                      ← Back
                    </Button>
                    <Button type="submit" disabled={submitting || uploading} className="flex-1 py-3 font-black text-base"
                      style={{ backgroundColor: 'var(--brand-blue)', color: 'white', border: 'none' }}>
                      {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Free Request'}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-gray-400">No payment required. Estimate arrives within 48 hours.</p>
                </SectionCard>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">

              {/* Business Account */}
              <BusinessAccountPanel
                formData={formData}
                aiPreviewUrl={aiPreviewUrl}
                markupNotes={markupNotes}
                onLoadDesign={handleLoadDesign}
              />

              {/* How It Works */}
              <div className="bg-white rounded-2xl p-5" style={{ border: '1.5px solid #e5e7eb' }}>
                <p className="font-black text-sm uppercase tracking-wide mb-4" style={{ color: 'var(--brand-dark)' }}>How It Works</p>
                <div className="space-y-3">
                  {[
                    { num: '1', step: 'Submit free request', time: 'Today' },
                    { num: '2', step: 'Receive detailed estimate', time: 'Within 48 hrs' },
                    { num: '3', step: 'Approve & pay deposit', time: 'After review' },
                    { num: '4', step: 'We hand-paint your rug', time: formData.rushOrder ? '~1 week' : '2–4 weeks' },
                    { num: '5', step: 'Shipped to your door', time: formData.rushOrder ? '2 wks total' : '3–5 wks total' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--brand-blue)', color: 'white' }}>
                        {s.num}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--brand-dark)' }}>{s.step}</div>
                        <div className="text-xs text-gray-400">{s.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Rugly */}
              <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--brand-dark)', color: 'white' }}>
                <p className="font-black text-sm uppercase tracking-wide mb-3 opacity-60">Why Rugly</p>
                <div className="space-y-2">
                  {[
                    'Real artists — no print-on-demand',
                    'Any size, any design',
                    'Free estimate, no commitment',
                    '24-hour damage guarantee',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--brand-cyan)' }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}