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

            const { prompt, imageUrl, rugSize, qualityTier, generateVariations, referenceImages, baseColor, paintColor, secondPaintColor } = body;
            console.log('[aiAssistant] Params:', { 
                hasPrompt: !!prompt, 
                hasImage: !!imageUrl, 
                hasReferenceImages: !!referenceImages,
                rugSize, 
                qualityTier,
                generateVariations,
                baseColor,
                paintColor,
                secondPaintColor
            });

            // Collect all image URLs
            const file_urls = [];
            if (imageUrl) file_urls.push(imageUrl);
            if (referenceImages && Array.isArray(referenceImages)) {
                file_urls.push(...referenceImages);
            }

            const isLuxTier = qualityTier === 'highend';

            // Build color constraint string for all prompts
            const colorConstraint = `
CRITICAL STENCIL PAINTING CONSTRAINTS - MUST FOLLOW:
- This is a HAND-PAINTED STENCIL rug, NOT a printed image. The design uses ONLY flat paint applied through stencils.
- Base rug color: ${baseColor || 'neutral'}. This is the background color of the rug fabric itself — it shows through wherever paint is NOT applied.
- Primary paint color: ${paintColor || 'black'}. This is the ONLY paint color used for the main design elements.
${secondPaintColor ? `- Secondary paint color: ${secondPaintColor}. This is the ONLY second color allowed.` : '- No second paint color — use only the primary paint color.'}
- The final rug must contain ONLY these colors: the base rug color AND the paint color(s) listed above. NO other colors, NO gradients, NO photographic shading, NO full-color imagery.
- The design should look like flat paint stenciled or painted directly onto a ${baseColor || 'neutral'} rug — like a clean screen print or linocut.
- Simplify the reference image/description into bold shapes and outlines that can be achieved with stencils and flat paint.`;

            // If generating a design image (AI design mode)
            if (generateVariations && isLuxTier) {
                console.log('[aiAssistant] Generating stencil-style design image');
                
                const imagePrompt = `Create a photorealistic overhead flat-lay photo of a custom hand-painted stencil rug on a hardwood floor.

Design Request: "${prompt}"
${rugSize ? `Rug Size: ${rugSize}` : ''}

${colorConstraint}

COMPOSITION INSTRUCTIONS:
1. Show the rug from directly overhead (bird's-eye view) as a flat lay so the design is clearly visible
2. The rug shape should match the size (${rugSize || 'rectangular'})
3. The design should be clean, bold, and look like it was stenciled/painted by hand — slight imperfections in paint edges are fine and authentic
4. Lighting should be soft and even so all colors are clearly visible
5. The overall result should look like a real hand-painted rug photo that could appear in an interior design catalog`;

                try {
                    const imageResponse = await base44.integrations.Core.GenerateImage({
                        prompt: imagePrompt,
                        existing_image_urls: file_urls.length > 0 ? file_urls : undefined
                    });
                    
                    console.log('[aiAssistant] Image generated successfully');
                    return Response.json({ 
                        designImage: imageResponse.url,
                        type: 'image'
                    });
                } catch (imageError) {
                    console.error('[aiAssistant] Image generation error:', imageError);
                    return Response.json({ 
                        error: 'Failed to generate design image. Please try again.' 
                    }, { status: 500 });
                }
            }

            // Regular design suggestions mode
            if (!prompt) {
                return Response.json({ error: 'Prompt is required' }, { status: 400 });
            }

        let llmPrompt = `You are a professional stencil artist and rug designer specializing in hand-painted custom rugs. The user wants design suggestions for a custom hand-painted stencil rug.

User's request: "${prompt}"
${rugSize ? `Rug size: ${rugSize}` : ''}
${file_urls.length > 0 ? `The user has uploaded ${file_urls.length} reference image(s). Analyze these images and suggest how to translate them into a stencil-based rug design using only the specified paint colors.` : ''}
${isLuxTier ? 'This is for a LUXURY PREMIUM rug.' : ''}

${colorConstraint}

Please provide:
1. ${isLuxTier ? 'Four' : 'Three'} color palette suggestions — but ONLY using combinations of the base color (${baseColor || 'neutral'}) and the chosen paint color(s) (${paintColor || 'primary color'}${secondPaintColor ? `, ${secondPaintColor}` : ''}). Suggest how these specific colors can be layered or combined for visual impact.
2. ${isLuxTier ? 'Four' : 'Three'} unique pattern ideas — all must be achievable with flat stencil painting using only the selected colors. Bold shapes, outlines, geometric or organic patterns that translate well to stencil work.
3. ${isLuxTier ? 'Four' : 'Three'} layout suggestions — how to arrange stencil elements on the ${rugSize || 'rug'} for maximum visual impact using only the allowed colors.
${isLuxTier ? '4. Three stencil technique suggestions (e.g., layering the same color for depth, using negative space, creating texture through stencil repetition, etc.).' : ''}

${file_urls.length > 0 ? 'IMPORTANT: Translate the reference image(s) into stencil-safe designs — simplify complex imagery into bold flat shapes that can be painted with the specified colors only.' : ''}
All suggestions MUST respect the color constraints: only ${baseColor || 'base color'} and ${paintColor || 'primary paint color'}${secondPaintColor ? ` and ${secondPaintColor}` : ''} are available.`;

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