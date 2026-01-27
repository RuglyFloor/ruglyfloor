import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { prompt, imageUrl, rugSize } = await req.json();

        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const file_urls = imageUrl ? [imageUrl] : [];

        const llmPrompt = `You are a professional interior designer specializing in custom rugs. The user wants design suggestions for a custom hand-painted rug.

User's request: "${prompt}"
${rugSize ? `Rug size: ${rugSize}` : ''}
${imageUrl ? 'The user has uploaded a reference image for inspiration.' : ''}

Please provide:
1. Three distinct color palettes (each with a descriptive name and 3-5 hex color codes that work well together for a rug design).
2. Three unique pattern ideas (creative, specific descriptions that the user can actually paint or stencil onto their rug).
3. Three layout suggestions (describe how to arrange the design elements on the rug, considering composition and visual balance).

Make your suggestions practical, creative, and suitable for a hand-painted custom rug.`;

        // When using file_urls (images), don't use JSON schema - vision models handle it better without
        const updatedPrompt = llmPrompt + '\n\nFormat your response as valid JSON with this structure: {"palettes": [{"name": "Palette Name", "colors": ["#hex1", "#hex2", "#hex3"]}], "patterns": ["pattern 1", "pattern 2", "pattern 3"], "layouts": ["layout 1", "layout 2", "layout 3"]}';
        
        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: updatedPrompt,
            add_context_from_internet: false,
            file_urls: file_urls
        });

        // Parse the text response
        let parsedResponse;
        try {
            parsedResponse = typeof llmResponse === 'string' ? JSON.parse(llmResponse) : llmResponse;
        } catch (parseError) {
            console.error("Failed to parse LLM response:", parseError);
            return Response.json({ 
                error: 'The AI is having trouble generating suggestions. Please try a simpler prompt.' 
            }, { status: 500 });
        }

        return Response.json(parsedResponse);

    } catch (error) {
        console.error("AI Assistant Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});