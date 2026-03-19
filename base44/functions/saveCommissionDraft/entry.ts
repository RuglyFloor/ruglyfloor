import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { draftId, formData, aiPreviewUrl, markupNotes } = await req.json();

    const payload = {
      email: formData.email || 'draft@rugly.com',
      business_name: formData.businessName || '',
      design_name: (formData.description?.slice(0, 60) || 'Untitled Design') + (formData.preferredSize ? ` — ${formData.preferredSize}` : ''),
      form_data: formData,
      ai_preview_url: aiPreviewUrl || '',
      markup_notes: Array.isArray(markupNotes) ? markupNotes.join('\n') : (markupNotes || ''),
    };

    let record;
    if (draftId) {
      record = await base44.asServiceRole.entities.SavedCommission.update(draftId, payload);
    } else {
      record = await base44.asServiceRole.entities.SavedCommission.create(payload);
    }

    return Response.json({ success: true, draftId: record.id });
  } catch (error) {
    console.error('saveCommissionDraft error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});