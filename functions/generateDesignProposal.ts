import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { formData, aiPreviewUrl, markupNotes, draftId } = await req.json();

    const colorList = Array.isArray(formData.preferredColors) && formData.preferredColors.length > 0
      ? formData.preferredColors.join(', ')
      : 'designer-selected palette';

    const prompt = `You are the lead creative director at a prestigious rug atelier, writing a PROJECT RUNWAY–style design proposal for a bespoke hand-painted rug commission. Be dramatic, editorial, and visionary — like a fashion runway show press kit.

Commission Details:
- Client: ${formData.name || 'Valued Client'}
- Project Type: ${formData.projectType || 'Residential'}
${formData.businessName ? `- Studio/Company: ${formData.businessName}` : ''}
- Size: ${formData.preferredSize || 'To be confirmed'}
- Design Vision: ${formData.description}
- Color Palette: ${colorList}
- Complexity: ${formData.numColors || '3-4'} colors
- Timeline: ${formData.rushOrder ? 'Rush — 2 weeks' : 'Standard — 3–5 weeks'}
- Budget: ${formData.budgetRange || 'Flexible'}
${markupNotes && markupNotes.length > 0 ? `- Design Notes: ${Array.isArray(markupNotes) ? markupNotes.join('; ') : markupNotes}` : ''}

Generate a gorgeous design proposal with the following sections (return as JSON):
{
  "collection_name": "A dramatic, evocative name for this piece (e.g. 'Midnight Cartouche', 'Terre de Sienne No.7')",
  "tagline": "One poetic sentence — the runway caption",
  "story": "2-3 paragraphs. The inspiration narrative. Where does this piece come from emotionally and aesthetically? Reference art movements, travel, materials, light, texture. Make it feel like a museum placard meets a luxury brand lookbook.",
  "design_direction": {
    "mood": "One evocative word or short phrase (e.g. 'Nomadic Luxury', 'Brutalist Warmth')",
    "palette_narrative": "Describe the chosen colors poetically — their relationship, their tension, their harmony.",
    "pattern_language": "Describe the visual vocabulary — geometric, organic, abstract, ancestral, etc.",
    "texture_note": "How will the hand-painted texture feel visually? What does the brushwork communicate?"
  },
  "production_notes": {
    "technique": "Which hand-painting methods will be used and why they suit this design",
    "layers": "How many paint passes, what the build-up of depth will look like",
    "finishing": "Edge treatment, backing, care"
  },
  "placement_vision": "How this rug transforms the room it lives in — spatial, emotional, social impact",
  "designer_note": "A personal note from the artist — intimate, signed, handwritten in tone",
  "estimated_timeline": "${formData.rushOrder ? '2 weeks rush production + shipping' : '3–5 weeks standard production + shipping'}",
  "investment": "${formData.budgetRange ? 'Starting at ' + formData.budgetRange : 'Custom estimate to follow within 48 hours'}"
}`;

    const proposal = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude_sonnet_4_6',
      response_json_schema: {
        type: 'object',
        properties: {
          collection_name: { type: 'string' },
          tagline: { type: 'string' },
          story: { type: 'string' },
          design_direction: {
            type: 'object',
            properties: {
              mood: { type: 'string' },
              palette_narrative: { type: 'string' },
              pattern_language: { type: 'string' },
              texture_note: { type: 'string' }
            }
          },
          production_notes: {
            type: 'object',
            properties: {
              technique: { type: 'string' },
              layers: { type: 'string' },
              finishing: { type: 'string' }
            }
          },
          placement_vision: { type: 'string' },
          designer_note: { type: 'string' },
          estimated_timeline: { type: 'string' },
          investment: { type: 'string' }
        }
      }
    });

    // Save proposal to the draft if we have one
    if (draftId) {
      try {
        const existing = await base44.asServiceRole.entities.SavedCommission.get(draftId);
        await base44.asServiceRole.entities.SavedCommission.update(draftId, {
          ...existing,
          form_data: { ...existing.form_data, designProposal: proposal }
        });
      } catch (e) {
        console.error('Failed to attach proposal to draft:', e.message);
      }
    }

    return Response.json({ success: true, proposal });
  } catch (error) {
    console.error('generateDesignProposal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});