import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { pageName, pageContent, currentTitle, currentDescription } = await req.json();

    const prompt = `You are an SEO expert. Generate optimized SEO metadata for a custom rug website page.

Page: ${pageName}
Current Title: ${currentTitle || 'None'}
Current Description: ${currentDescription || 'None'}
Page Content Summary: ${pageContent}

Generate:
1. An SEO-optimized title tag (50-60 characters, include primary keyword)
2. A compelling meta description (150-160 characters, include call-to-action)
3. 5-8 relevant keywords for this page
4. SEO improvement suggestions (keyword placement, header structure, content recommendations)

Focus on keywords like: custom rugs, hand-painted rugs, personalized floor rugs, custom carpet designs`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
          suggestions: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('SEO generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});