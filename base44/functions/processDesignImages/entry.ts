import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import UPNG from 'npm:upng-js@2.1.0';

const DESIGN_LIBRARY = [
  { id: 'logo-1', name: 'Pan Am', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/e2ca8e912_Screenshot2026-01-09at040505.png' },
  { id: 'logo-2', name: 'DeLorean Motor Company', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/f4e63e07f_Screenshot2026-01-09at040817.png' },
  { id: 'logo-3', name: 'Detroit Electric', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/56017b581_Screenshot2026-01-09at041003.png' },
  { id: 'logo-4', name: 'Fight Club', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/ff29cb05f_Screenshot2026-01-09at041140.png' },
  { id: 'logo-5', name: 'Bell Telephone', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/850c83557_Screenshot2026-01-09at041824.png' },
  { id: 'logo-6', name: 'Butterfinger', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/de4fad953_Screenshot2026-01-09at042027.png' },
  { id: 'logo-7', name: 'Clark Bar', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/aac63a2ba_Screenshot2026-01-09at042153.png' },
  { id: 'logo-8', name: 'Oh Henry!', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/31b8b1fe0_Screenshot2026-01-09at042252.png' },
  { id: 'logo-9', name: 'Atari', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/a109f3d28_Screenshot2026-01-09at042510.png' },
  { id: 'logo-10', name: 'Exol Motor Oil', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/8b8f23d98_Screenshot2026-01-09at042755.png' },
  { id: 'logo-11', name: 'Texaco', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/2b095bbe6_Screenshot2026-01-09at042848.png' },
  { id: 'logo-12', name: 'Chicago CTA', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/48665128e_image.png' },
  { id: 'logo-13', name: 'NYC Subway Times Square', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/476865fa1_Screenshot2026-01-09at124250.png' },
  { id: 'logo-14', name: 'Colorado Flag', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/345492b05_Screenshot2026-01-09at124339.png' },
  { id: 'logo-15', name: 'Great Lakes', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/440e289c0_image.png' },
  { id: 'logo-16', name: 'CTA Transit Map', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/0a7d4f94a_Screenshot2026-01-09at153024.png' },
  { id: 'icon-betty', name: 'Betty Boop', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/716bb46e3_betty.jpg' },
  { id: 'band-beatles', name: 'The Beatles', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/475bcc93d_Screenshot2026-01-31at003552.png' },
  { id: 'band-grateful', name: 'Grateful Dead Bears', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/697de5553_image.png' },
  { id: 'band-beastie', name: 'Beastie Boys', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/7a6877c54_image.png' },
  { id: 'album-pistols', name: 'Sex Pistols', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/c0c065eea_image.png' },
  { id: 'album-abbey-road', name: 'Abbey Road', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/571b3650e_Screenshot2026-01-31at003150.png' },
  { id: 'portrait-1', name: 'Portrait 1', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/9d6f3b557_image.png' },
  { id: 'portrait-2', name: 'Portrait 2', url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/bb9c2718a_image.png' },
];

async function fetchAsArrayBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.arrayBuffer();
}

async function processImage(imageUrl, base44sdk) {
  const buf = await fetchAsArrayBuffer(imageUrl);

  // Decode PNG (or convert JPG → get pixel data via proxy)
  const img = UPNG.decode(buf);
  const { width, height } = img;

  // upng gives us rgba8 frames via toRGBA8
  const frames = UPNG.toRGBA8(img);
  const rgba = new Uint8Array(frames[0]);

  // Apply stencil: dark pixels → black with alpha, light → transparent
  const threshold = 180;
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < threshold) {
      const intensity = Math.round((1 - lum / threshold) * 255);
      rgba[i] = 0;
      rgba[i + 1] = 0;
      rgba[i + 2] = 0;
      rgba[i + 3] = intensity;
    } else {
      rgba[i + 3] = 0;
    }
  }

  // Encode back to PNG
  const outBuf = UPNG.encode([rgba.buffer], width, height, 4);
  const file = new File([outBuf], 'stencil.png', { type: 'image/png' });
  const { file_url } = await base44sdk.asServiceRole.integrations.Core.UploadFile({ file });
  return file_url;
}

Deno.serve(async (req) => {
  try {
    const base44sdk = createClientFromRequest(req);
    const user = await base44sdk.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const subset = body.ids
      ? DESIGN_LIBRARY.filter(d => body.ids.includes(d.id))
      : DESIGN_LIBRARY;

    const results = [];
    for (const design of subset) {
      try {
        console.log(`Processing: ${design.name}`);
        const newUrl = await processImage(design.url, base44sdk);
        results.push({ id: design.id, name: design.name, processed: newUrl });
        console.log(`Done: ${design.name} → ${newUrl}`);
      } catch (err) {
        console.error(`Failed ${design.name}:`, err.message);
        results.push({ id: design.id, name: design.name, error: err.message });
      }
    }

    return Response.json({ results });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});