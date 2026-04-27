import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Upload, X, ChevronRight, Share2, Check, Loader2 } from 'lucide-react';
import VisualizerGallery from '@/components/visualizer/VisualizerGallery';
import VisualizerSizeSelector from '@/components/visualizer/VisualizerSizeSelector';
import VisualizerPreview from '@/components/visualizer/VisualizerPreview';
import VisualizerLeadForm from '@/components/visualizer/VisualizerLeadForm';
import BookConsultationButton from '@/components/booking/BookConsultationButton';
import { useNavigate } from 'react-router-dom';

const STYLE_TAGS = ['Abstract', 'Geometric', 'Nature', 'Portrait', 'Typography', 'Floral', 'Retro', 'Minimalist'];

export default function Visualizer() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [step, setStep] = useState(1); // 1=describe, 2=preview, 3=submit
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSize, setSelectedSize] = useState('5x7');
  const [roomPhotoUrl, setRoomPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [promptUsed, setPromptUsed] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [priceEstimate, setPriceEstimate] = useState(null);
  const fileRef = useRef();

  const bg = darkMode ? '#0f0f0f' : '#f8f6f2';
  const surface = darkMode ? '#1a1a1a' : '#ffffff';
  const text = darkMode ? '#f0ede8' : '#1a1a1a';
  const muted = darkMode ? '#888' : '#666';
  const accent = '#f04624';
  const accentGlow = darkMode ? 'rgba(240,70,36,0.15)' : 'rgba(240,70,36,0.08)';

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setRoomPhotoUrl(file_url);
    setUploading(false);
  };

  const handleGenerate = async () => {
    if (!description.trim() && !roomPhotoUrl) return;
    setGenerating(true);
    setStep(2);

    const sizeLabel = selectedSize;
    const tagStr = selectedTags.length ? selectedTags.join(', ') : 'hand-painted';
    const roomContext = roomPhotoUrl ? 'placed in the room shown in the photo' : 'displayed on a hardwood floor in a modern living room';

    const prompt = `A photorealistic overhead-perspective render of a hand-painted custom area rug (${sizeLabel}) ${roomContext}. The rug features a ${tagStr} design: ${description || 'bold abstract painterly composition'}. Ryan Hensley signature gradient style — rich layered acrylic paints, expressive brushwork, deep saturated colors with confident stroke marks. The rug has a visible texture with slight pile depth. Studio lighting. 4K quality. No text or watermarks.`;
    setPromptUsed(prompt);

    const fileUrls = roomPhotoUrl ? [roomPhotoUrl] : undefined;
    const { url } = await base44.integrations.Core.GenerateImage({ prompt, existing_image_urls: fileUrls });
    setPreviewUrl(url);
    setGenerating(false);
  };

  const handleSubmitDesign = async (formData) => {
    setSubmitting(true);
    const token = Math.random().toString(36).slice(2, 10);
    const record = await base44.entities.VisualizerSubmission.create({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      notes: formData.notes,
      room_description: description,
      room_photo_url: roomPhotoUrl || '',
      size: selectedSize,
      style_tags: selectedTags,
      price_estimate: priceEstimate,
      preview_url: previewUrl,
      prompt_used: promptUsed,
      status: 'new',
      share_token: token
    });
    setShareToken(token);
    setSubmitted(true);
    setStep(3);
    setSubmitting(false);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const shareUrl = shareToken ? `${window.location.origin}/VisualizerShare?token=${shareToken}` : null;

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text, fontFamily: 'Barlow Condensed, sans-serif', transition: 'background 0.3s, color 0.3s' }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${darkMode ? '#222' : '#e5e5e5'}`, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20, background: surface }}>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.08em', color: accent, lineHeight: 1 }}>RUGLY VISUALIZER</div>
          <div style={{ fontSize: '0.75rem', color: muted, letterSpacing: '0.15em', marginTop: 2 }}>BY RYAN HENSLEY</div>
        </div>
        <button
          onClick={() => setDarkMode(d => !d)}
          style={{ background: darkMode ? '#222' : '#eee', border: 'none', borderRadius: 20, padding: '6px 16px', color: text, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em' }}
        >
          {darkMode ? '☀ Light' : '☾ Dark'}
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '0.04em', lineHeight: 1.05, marginBottom: 12 }}>
            See Your Custom Rug.<br />
            <span style={{ color: accent }}>Before It's Painted.</span>
          </h1>
          <p style={{ color: muted, fontSize: '1.1rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.6, fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}>
            Describe your vision or upload a room photo. Get an AI-generated preview in seconds, then send it straight to Ryan.
          </p>
        </div>

        {/* Step 1: Describe + Configure */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

            {/* Left: Text + Tags */}
            <div style={{ background: surface, borderRadius: 16, padding: 28, border: `1px solid ${darkMode ? '#2a2a2a' : '#e0e0e0'}` }}>
              <div style={{ marginBottom: 20 }}>
                <Label style={{ color: muted, fontSize: '0.7rem', letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>DESCRIBE YOUR RUG IDEA</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. A bold sunset over Chicago skyline with deep orange and purple gradients. Or: a golden retriever portrait on a cream base..."
                  style={{ background: darkMode ? '#111' : '#f9f9f9', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, color: text, borderRadius: 10, minHeight: 120, fontSize: '0.95rem', fontFamily: 'Roboto, sans-serif', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <Label style={{ color: muted, fontSize: '0.7rem', letterSpacing: '0.15em', display: 'block', marginBottom: 10 }}>STYLE</Label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {STYLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', cursor: 'pointer',
                        border: `1.5px solid ${selectedTags.includes(tag) ? accent : darkMode ? '#333' : '#ddd'}`,
                        background: selectedTags.includes(tag) ? accentGlow : 'transparent',
                        color: selectedTags.includes(tag) ? accent : muted,
                        fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.05em',
                        transition: 'all 0.15s'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Photo Upload */}
              <div>
                <Label style={{ color: muted, fontSize: '0.7rem', letterSpacing: '0.15em', display: 'block', marginBottom: 10 }}>UPLOAD ROOM PHOTO (OPTIONAL)</Label>
                {roomPhotoUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={roomPhotoUrl} alt="Room" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 10 }} />
                    <button onClick={() => setRoomPhotoUrl(null)} style={{ position: 'absolute', top: 6, right: 6, background: '#000a', border: 'none', borderRadius: '50%', color: 'white', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current.click()}
                    disabled={uploading}
                    style={{ width: '100%', border: `2px dashed ${darkMode ? '#333' : '#ddd'}`, borderRadius: 10, padding: '20px 0', background: 'transparent', color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.85rem', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                  >
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    {uploading ? 'Uploading…' : 'Click to upload photo of your room'}
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
            </div>

            {/* Right: Size + Price + Generate */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <VisualizerSizeSelector
                selected={selectedSize}
                onSelect={(size, price) => { setSelectedSize(size); setPriceEstimate(price); }}
                darkMode={darkMode}
                surface={surface}
                text={text}
                muted={muted}
                accent={accent}
              />

              <button
                onClick={handleGenerate}
                disabled={!description.trim() && !roomPhotoUrl}
                style={{
                  background: (!description.trim() && !roomPhotoUrl) ? '#444' : accent,
                  color: 'white', border: 'none', borderRadius: 12, padding: '18px 0',
                  fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Barlow Condensed, sans-serif',
                  letterSpacing: '0.08em', cursor: (!description.trim() && !roomPhotoUrl) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'background 0.2s'
                }}
              >
                <Sparkles size={20} />
                GENERATE PREVIEW
                <ChevronRight size={20} />
              </button>
              <p style={{ color: muted, fontSize: '0.78rem', textAlign: 'center', fontFamily: 'Roboto, sans-serif' }}>
                AI-generated preview in ~10 seconds. No payment required.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <VisualizerPreview
            generating={generating}
            previewUrl={previewUrl}
            size={selectedSize}
            priceEstimate={priceEstimate}
            description={description}
            selectedTags={selectedTags}
            darkMode={darkMode}
            surface={surface}
            text={text}
            muted={muted}
            accent={accent}
            onRegenerate={handleGenerate}
            onBack={() => setStep(1)}
            onSendToRyan={() => setStep('form')}
          />
        )}

        {/* Step: Lead Form */}
        {step === 'form' && (
          <VisualizerLeadForm
            previewUrl={previewUrl}
            size={selectedSize}
            priceEstimate={priceEstimate}
            submitting={submitting}
            darkMode={darkMode}
            surface={surface}
            text={text}
            muted={muted}
            accent={accent}
            onSubmit={handleSubmitDesign}
            onBack={() => setStep(2)}
          />
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: accentGlow, border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={32} color={accent} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '0.04em', marginBottom: 12 }}>Design Sent to Ryan!</h2>
            <p style={{ color: muted, fontFamily: 'Roboto, sans-serif', fontSize: '1rem', lineHeight: 1.7, marginBottom: 32 }}>
              Ryan will review your design and reach out within 24 hours with a custom quote. Keep an eye on your email and phone.
            </p>
            {previewUrl && (
              <img src={previewUrl} alt="Your preview" style={{ width: '100%', maxWidth: 380, borderRadius: 16, marginBottom: 28, border: `2px solid ${darkMode ? '#333' : '#e0e0e0'}` }} />
            )}
            {shareUrl && (
              <div style={{ background: surface, border: `1px solid ${darkMode ? '#2a2a2a' : '#e0e0e0'}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ color: muted, fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: 8 }}>SHARE YOUR DESIGN</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    readOnly
                    value={shareUrl}
                    style={{ flex: 1, background: darkMode ? '#111' : '#f5f5f5', border: `1px solid ${darkMode ? '#333' : '#ddd'}`, borderRadius: 8, padding: '8px 12px', color: text, fontSize: '0.8rem', fontFamily: 'monospace' }}
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                    style={{ background: accent, color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontFamily: 'inherit' }}
                  >
                    <Share2 size={14} /> Copy
                  </button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <BookConsultationButton
                previewUrl={previewUrl}
                shareUrl={shareUrl}
                description={description}
                size={selectedSize}
                source="visualizer"
                variant="dark"
                size_btn="lg"
                label="BOOK A FREE DESIGN CALL WITH RYAN"
              />
              <button
                onClick={() => { setStep(1); setPreviewUrl(null); setDescription(''); setSelectedTags([]); setRoomPhotoUrl(null); setSubmitted(false); setShareToken(null); }}
                style={{ color: accent, background: 'transparent', border: `1.5px solid ${darkMode ? '#333' : '#ddd'}`, borderRadius: 10, padding: '12px 24px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em' }}
              >
                Design Another Rug
              </button>
            </div>
          </div>
        )}

        {/* Gallery */}
        {step === 1 && (
          <div style={{ marginTop: 72 }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '0.05em', marginBottom: 8 }}>GALLERY</h2>
              <p style={{ color: muted, fontFamily: 'Roboto, sans-serif', fontSize: '0.95rem' }}>Browse Ryan's work for inspiration</p>
            </div>
            <VisualizerGallery darkMode={darkMode} surface={surface} text={text} muted={muted} accent={accent} />
          </div>
        )}

      </div>
    </div>
  );
}