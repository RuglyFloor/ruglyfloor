import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DESIGN_LIBRARY = [
  {
    id: 'geometric-1',
    name: 'Bold Circles',
    category: 'geometric',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
  },
  {
    id: 'geometric-2',
    name: 'Triangle Pattern',
    category: 'geometric',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop'
  },
  {
    id: 'floral-1',
    name: 'Rose Garden',
    category: 'floral',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop'
  },
  {
    id: 'floral-2',
    name: 'Tropical Leaves',
    category: 'floral',
    url: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=400&fit=crop'
  },
  {
    id: 'abstract-1',
    name: 'Paint Splash',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop'
  },
  {
    id: 'abstract-2',
    name: 'Brush Strokes',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=400&h=400&fit=crop'
  },
  {
    id: 'text-1',
    name: 'Typography',
    category: 'text',
    url: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=400&h=400&fit=crop'
  },
  {
    id: 'minimal-1',
    name: 'Simple Lines',
    category: 'minimal',
    url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=400&fit=crop'
  }
];

const CATEGORIES = ['all', 'geometric', 'floral', 'abstract', 'text', 'minimal'];

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
            >
              <img
                src={design.url}
                alt={design.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center">
                <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
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