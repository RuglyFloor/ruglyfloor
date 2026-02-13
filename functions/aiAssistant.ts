import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const startTime = Date.now();
    console.log('[aiAssistant] Request received at', new Date().toISOString());
    
    try {
        const base44 = createClientFromRequest(req);
        
        // Add request timeout
        const timeoutMs = 55000; // 55 seconds (under Deno's 60s limit)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
        );

        const processRequest = async () => {
            let body;
            try {
                body = await req.json();
            } catch (parseError) {
                console.error('[aiAssistant] JSON parse error:', parseError);
                return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
            }

            const { prompt, imageUrl, rugSize, qualityTier, generateVariations } = body;
            console.log('[aiAssistant] Params:', { 
                hasPrompt: !!prompt, 
                hasImage: !!imageUrl, 
                rugSize, 
                qualityTier 
            });

            if (!prompt) {
                return Response.json({ error: 'Prompt is required' }, { status: 400 });
            }

            const file_urls = imageUrl ? [imageUrl] : [];
            const isLuxTier = qualityTier === 'highend';

        let llmPrompt = `You are a professional interior designer specializing in custom rugs. The user wants design suggestions for a custom hand-painted rug.

User's request: "${prompt}"
${rugSize ? `Rug size: ${rugSize}` : ''}
${imageUrl ? 'The user has uploaded a reference image for inspiration.' : ''}
${isLuxTier ? 'This is for a LUXURY PREMIUM rug - provide sophisticated, high-end design suggestions with exceptional attention to detail.' : ''}

Please provide:
1. ${isLuxTier ? 'Four' : 'Three'} distinct color palettes (each with a descriptive name and ${isLuxTier ? '5-7' : '3-5'} hex color codes that work well together for a rug design).
2. ${isLuxTier ? 'Four' : 'Three'} unique pattern ideas (creative, specific descriptions that the user can actually paint or stencil onto their rug).
3. ${isLuxTier ? 'Four' : 'Three'} layout suggestions (describe how to arrange the design elements on the rug, considering composition and visual balance).
${isLuxTier ? '4. Three texture and finishing technique suggestions (advanced techniques like shading, gradients, layering, or special effects that enhance the luxury feel).' : ''}

${isLuxTier ? 'Focus on premium, artistic designs with sophisticated color theory and complex compositions suitable for a luxury hand-painted rug.' : 'Make your suggestions practical, creative, and suitable for a hand-painted custom rug.'}`;

        const schema = {
            type: "object",
            properties: {
                palettes: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            colors: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                patterns: {
                    type: "array",
                    items: { type: "string" }
                },
                layouts: {
                    type: "array",
                    items: { type: "string" }
                },
                ...(isLuxTier && {
                    techniques: {
                        type: "array",
                        items: { type: "string" },
                        description: "Advanced finishing techniques for luxury rugs"
                    }
                })
            }
        };
        
            console.log('[aiAssistant] Calling LLM...');
            let llmResponse;
            try {
                llmResponse = await base44.integrations.Core.InvokeLLM({
                    prompt: llmPrompt,
                    add_context_from_internet: file_urls.length > 0 ? true : false,
                    file_urls: file_urls.length > 0 ? file_urls : undefined,
                    response_json_schema: schema
                });
                console.log('[aiAssistant] LLM response received, type:', typeof llmResponse);
            } catch (llmError) {
                console.error('[aiAssistant] LLM invocation error:', llmError);
                throw new Error('AI service unavailable. Please try again.');
            }

            // If we got a string response (from vision model), parse it
            let parsedResponse;
            if (typeof llmResponse === 'string') {
                try {
                    // Remove markdown code blocks if present
                    let cleanedResponse = llmResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
                    parsedResponse = JSON.parse(cleanedResponse);
                    console.log('[aiAssistant] Parsed string response successfully');
                } catch (parseError) {
                    console.error('[aiAssistant] Failed to parse LLM response:', parseError);
                    console.error('[aiAssistant] Raw response:', llmResponse.substring(0, 500));
                    return Response.json({ 
                        error: 'The AI is having trouble generating suggestions. Please try again.' 
                    }, { status: 500 });
                }
            } else {
                parsedResponse = llmResponse;
                console.log('[aiAssistant] Direct JSON response received');
            }

            const elapsed = Date.now() - startTime;
            console.log(`[aiAssistant] Success in ${elapsed}ms`);
            return Response.json(parsedResponse);
        };

        return await Promise.race([processRequest(), timeoutPromise]);

    } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error(`[aiAssistant] Error after ${elapsed}ms:`, error);
        console.error('[aiAssistant] Error stack:', error.stack);
        
        if (error.message === 'Request timeout') {
            return Response.json({ 
                error: 'Request timed out. Please try a simpler prompt or without an image.' 
            }, { status: 504 });
        }
        
        return Response.json({ 
            error: error.message || 'An unexpected error occurred. Please try again.' 
        }, { status: 500 });
    }
});