import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DESIGN_LIBRARY = [
  {
    id: 'logo-1',
    name: 'Pan Am',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/b8df7ea6a_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/e2ca8e912_Screenshot2026-01-09at040505.png'
  },
  {
    id: 'logo-2',
    name: 'DeLorean Motor Company',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/650a1c5ee_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/f4e63e07f_Screenshot2026-01-09at040817.png'
  },
  {
    id: 'logo-3',
    name: 'Detroit Electric',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/ca145669d_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/56017b581_Screenshot2026-01-09at041003.png'
  },
  {
    id: 'logo-4',
    name: 'Fight Club',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/4dd7216cc_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/ff29cb05f_Screenshot2026-01-09at041140.png'
  },
  {
    id: 'logo-5',
    name: 'Bell Telephone',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/c474f2387_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/850c83557_Screenshot2026-01-09at041824.png'
  },
  {
    id: 'logo-6',
    name: 'Butterfinger',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/7ae6e22f3_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/de4fad953_Screenshot2026-01-09at042027.png'
  },
  {
    id: 'logo-7',
    name: 'Clark Bar',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/9d1e482a5_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/aac63a2ba_Screenshot2026-01-09at042153.png'
  },
  {
    id: 'logo-8',
    name: 'Oh Henry!',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/a1ea6baf6_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/31b8b1fe0_Screenshot2026-01-09at042252.png'
  },
  {
    id: 'logo-9',
    name: 'Atari',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/de04b9a16_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/a109f3d28_Screenshot2026-01-09at042510.png'
  },
  {
    id: 'logo-10',
    name: 'Exol Motor Oil',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/1e99af1bb_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/8b8f23d98_Screenshot2026-01-09at042755.png'
  },
  {
    id: 'logo-11',
    name: 'Texaco',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/2a7f523a5_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/2b095bbe6_Screenshot2026-01-09at042848.png'
  },
  {
    id: 'portrait-1',
    name: 'Portrait 1',
    category: 'portrait',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/f3d9a47b2_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/9d6f3b557_image.png'
  },
  {
    id: 'portrait-2',
    name: 'Portrait 2',
    category: 'portrait',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/1f5c83a21_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/bb9c2718a_image.png'
  },
  {
    id: 'logo-12',
    name: 'Chicago CTA',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/b5a79e74d_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/48665128e_image.png'
  },
  {
    id: 'logo-13',
    name: 'NYC Subway Times Square',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/76404c79f_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/476865fa1_Screenshot2026-01-09at124250.png'
  },
  {
    id: 'logo-14',
    name: 'Colorado Flag',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/5029dd3f4_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/345492b05_Screenshot2026-01-09at124339.png'
  },
  {
    id: 'logo-15',
    name: 'Great Lakes',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/972278b07_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/440e289c0_image.png'
  },
  {
    id: 'logo-16',
    name: 'CTA Transit Map',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/53bb78f8b_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/0a7d4f94a_Screenshot2026-01-09at153024.png'
  },
  {
    id: 'icon-betty',
    name: 'Betty Boop',
    category: 'portrait',
    url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/716bb46e3_betty.jpg',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/716bb46e3_betty.jpg'
  },
  {
    id: 'band-beatles',
    name: 'The Beatles',
    category: 'portrait',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/8bfe197f2_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/475bcc93d_Screenshot2026-01-31at003552.png'
  },
  {
    id: 'band-grateful',
    name: 'Grateful Dead Bears',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/4bb80508b_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/697de5553_image.png'
  },
  {
    id: 'band-beastie',
    name: 'Beastie Boys',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/bd2f91c4a_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/7a6877c54_image.png'
  },
  {
    id: 'album-pistols',
    name: 'Sex Pistols',
    category: 'vintage',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/e7a3d05f1_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/c0c065eea_image.png'
  },
  {
    id: 'album-abbey-road',
    name: 'Abbey Road',
    category: 'portrait',
    url: 'https://base44.app/api/apps/695ded1a209dda33af9a1cf6/files/mp/public/695ded1a209dda33af9a1cf6/d8c62f3a0_stencil.png',
    thumb: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695ded1a209dda33af9a1cf6/571b3650e_Screenshot2026-01-31at003150.png'
  }
];

const CATEGORIES = ['all', 'vintage', 'portrait'];

export default function DesignLibrary({ onSelectDesign }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const filteredDesigns = DESIGN_LIBRARY.filter(design => {
    const matchesCategory = selectedCategory === 'all' || design.category === selectedCategory;
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onSelectDesign(file_url);
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Design</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search designs..."
              className="pl-10"
            />
          </div>
          <label htmlFor="upload-custom">
            <Button variant="outline" disabled={uploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </span>
            </Button>
          </label>
          <input
            id="upload-custom"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {filteredDesigns.map(design => (
            <button
              key={design.id}
              onClick={() => onSelectDesign(design.url)}
              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-600 transition-all"
              style={{ background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}
            >
              <div className="w-full h-full flex items-center justify-center p-2 bg-white/80">
                <img
                  src={design.thumb || design.url}
                  alt={design.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center pointer-events-none">
                <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity text-center px-1">
                  {design.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}