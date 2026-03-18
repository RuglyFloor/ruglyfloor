import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Building2, Save, FolderOpen, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function BusinessAccountPanel({ formData, aiPreviewUrl, markupNotes, onLoadDesign }) {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [designName, setDesignName] = useState('');
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDesigns, setShowDesigns] = useState(false);
  const [linked, setLinked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLink = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const designs = await base44.entities.SavedCommission.filter({ email });
      setSavedDesigns(designs);
      setLinked(true);
      if (designs.length > 0) setShowDesigns(true);
    } catch (e) {
      alert('Failed to load account');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!email) { alert('Please enter your email first'); return; }
    setSaving(true);
    try {
      const payload = {
        email,
        business_name: businessName,
        design_name: designName || `Design ${new Date().toLocaleDateString()}`,
        form_data: formData,
        ai_preview_url: aiPreviewUrl || '',
        markup_notes: markupNotes ? markupNotes.join('\n') : ''
      };
      await base44.entities.SavedCommission.create(payload);
      const updated = await base44.entities.SavedCommission.filter({ email });
      setSavedDesigns(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.SavedCommission.delete(id);
    setSavedDesigns(prev => prev.filter(d => d.id !== id));
  };

  return (
    <Card className="border-2" style={{ borderColor: 'var(--brand-blue)' }}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5" style={{ color: 'var(--brand-blue)' }} />
          Business Account & Saved Designs
        </CardTitle>
        <p className="text-sm text-gray-500">Save your designs and access them anytime by email</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Link */}
        <div>
          <Label className="text-sm font-semibold">Your Email (Business Account)</Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="email"
              placeholder="studio@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLink()}
            />
            <Button type="button" variant="outline" onClick={handleLink} disabled={loading || !email}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load'}
            </Button>
          </div>
        </div>

        {linked && (
          <>
            <div>
              <Label className="text-sm font-semibold">Business / Studio Name</Label>
              <Input
                placeholder="Your Studio LLC"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Name this Design</Label>
              <Input
                placeholder="e.g. Hotel Lobby Draft 1"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              style={{ backgroundColor: saved ? '#22c55e' : 'var(--brand-blue)', color: 'white', border: 'none' }}
            >
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> :
               saved ? '✓ Design Saved!' : <><Save className="w-4 h-4 mr-2" /> Save This Design</>}
            </Button>
          </>
        )}

        {/* Saved Designs */}
        {linkedDesigns(savedDesigns, showDesigns, setShowDesigns, onLoadDesign, handleDelete)}
      </CardContent>
    </Card>
  );
}

function linkedDesigns(savedDesigns, showDesigns, setShowDesigns, onLoadDesign, handleDelete) {
  if (savedDesigns.length === 0) return null;
  return (
    <div>
      <button
        type="button"
        onClick={() => setShowDesigns(!showDesigns)}
        className="w-full flex items-center justify-between py-2 text-sm font-bold text-gray-700 border-t pt-3"
      >
        <span className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" style={{ color: 'var(--brand-blue)' }} />
          Saved Designs ({savedDesigns.length})
        </span>
        {showDesigns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showDesigns && (
        <div className="space-y-2 mt-2">
          {savedDesigns.map(d => (
            <div key={d.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border">
              {d.ai_preview_url && (
                <img src={d.ai_preview_url} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{d.design_name || 'Unnamed Design'}</div>
                <div className="text-xs text-gray-500">{new Date(d.created_date).toLocaleDateString()}</div>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => onLoadDesign(d)}>Load</Button>
              <button type="button" onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-500 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}