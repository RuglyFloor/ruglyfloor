import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, rugSize, numColors, budgetRange, description } = await req.json();

    // Build prompt for LLM to analyze and estimate
    const prompt = `You are an expert rug designer and pricing specialist. Analyze the following custom rug commission request and provide a price estimate range.

REQUEST DETAILS:
- Desired Rug Size: ${rugSize || 'Not specified'}
- Number of Colors: ${numColors || '1-2'}
- Budget Range: ${budgetRange || 'Flexible'}
- Description: ${description || 'Not provided'}

PRICING GUIDELINES:
- Small rugs (under 5x7): Base $400-$800
- Medium rugs (5x7 to 8x10): Base $800-$1,500
- Large rugs (8x10+): Base $1,500-$3,000
- Extra Large/Commercial: Base $3,000-$20,000

COMPLEXITY FACTORS:
- Simple designs (1-2 colors, basic patterns): +0%
- Moderate designs (3-4 colors, some detail): +30-50%
- Complex designs (5+ colors, intricate details): +70-150%
- Text/logos/fine details: +20-40%
${imageUrl ? '- Image complexity will be analyzed from uploaded reference' : ''}

Based on the description${imageUrl ? ' and uploaded image' : ''}, provide:
1. Estimated price range (e.g., "$1,200 - $2,000")
2. Brief explanation of the pricing factors
3. Complexity assessment (Simple, Moderate, or Complex)

Return ONLY valid JSON in this exact format:
{
  "priceRange": "$X - $Y",
  "explanation": "Brief explanation here",
  "complexity": "Simple|Moderate|Complex"
}`;

    // Call LLM with optional image analysis
    const llmParams = {
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          priceRange: { type: "string" },
          explanation: { type: "string" },
          complexity: { type: "string" }
        },
        required: ["priceRange", "explanation", "complexity"]
      }
    };

    // If image URL is provided, include it for visual analysis
    if (imageUrl) {
      llmParams.file_urls = [imageUrl];
    }

    const estimate = await base44.integrations.Core.InvokeLLM(llmParams);

    return Response.json({
      success: true,
      estimate: estimate
    });

  } catch (error) {
    console.error('Commission estimate error:', error);
    return Response.json({ 
      error: 'Failed to generate estimate', 
      details: error.message 
    }, { status: 500 });
  }
});