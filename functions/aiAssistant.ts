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

        const llmResponse = await base44.integrations.Core.InvokeLLM({
            prompt: llmPrompt,
            add_context_from_internet: false,
            file_urls: file_urls,
            response_json_schema: {
                type: "object",
                properties: {
                    palettes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                colors: { 
                                    type: "array", 
                                    items: { type: "string" }
                                }
                            },
                            required: ["name", "colors"]
                        }
                    },
                    patterns: { type: "array", items: { type: "string" } },
                    layouts: { type: "array", items: { type: "string" } }
                },
                required: ["palettes", "patterns", "layouts"]
            }
        });

        return Response.json(llmResponse);

    } catch (error) {
        console.error("AI Assistant Error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});