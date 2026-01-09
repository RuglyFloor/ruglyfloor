import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, User, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import SEOHead from '../components/seo/SEOHead';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'product-guide', label: 'Product Guide' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'news', label: 'News' }
];

export default function Blog() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: contents = [] } = useQuery({
    queryKey: ['published-contents'],
    queryFn: () => base44.entities.Content.filter({ status: 'published' }, '-published_date'),
  });

  const { data: singleContent } = useQuery({
    queryKey: ['content', slug],
    queryFn: () => base44.entities.Content.filter({ slug, status: 'published' }),
    enabled: !!slug,
  });

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || content.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (slug && singleContent && singleContent[0]) {
    const content = singleContent[0];
    return (
      <div className="min-h-screen py-12 px-6">
        <SEOHead
          title={content.seo_title || content.title}
          description={content.seo_description || content.excerpt}
          keywords={content.seo_keywords || []}
          url={`/blog?slug=${slug}`}
          type="article"
          image={content.featured_image}
        />
        <div className="max-w-4xl mx-auto">
          <Link to={createPageUrl('Blog')} className="text-blue-600 hover:underline mb-6 inline-block">
            ← Back to Blog
          </Link>
          
          {content.featured_image && (
            <img 
              src={content.featured_image} 
              alt={content.title}
              className="w-full h-96 object-cover rounded-lg mb-6"
            />
          )}

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            <div className="flex items-center gap-4 text-gray-600 text-sm">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{content.author_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(content.published_date), 'MMMM d, yyyy')}</span>
              </div>
              <Badge>{CATEGORIES.find(c => c.value === content.category)?.label}</Badge>
            </div>
          </div>

          {content.tags && content.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <SEOHead
        title="Blog & Resources - Rugly Floor"
        description="Read our latest blog posts, articles, and guides about custom rugs, interior design, and home decor."
        keywords={['rug blog', 'interior design', 'home decor', 'custom rugs', 'design guides']}
        url="/blog"
        type="website"
      />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Blog & Resources</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map(content => (
            <Link key={content.id} to={createPageUrl('Blog') + `?slug=${content.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {content.featured_image && (
                  <img 
                    src={content.featured_image} 
                    alt={content.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{CATEGORIES.find(c => c.value === content.category)?.label}</Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(content.published_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{content.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">{content.excerpt}</p>
                  {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {content.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredContents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No content found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}