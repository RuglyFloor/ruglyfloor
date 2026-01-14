import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminProtected from '../components/AdminProtected';
import SEOAnalyzer from '../components/seo/SEOAnalyzer';
import {
  Search, Sparkles, FileText, Eye, EyeOff, Save, Trash2, Plus,
  AlertCircle, CheckCircle2, Calendar, Globe, Loader2
} from 'lucide-react';

const PAGES = [
  { name: 'Home', path: '/', description: 'Main landing page showcasing custom painted rugs' },
  { name: 'Custom Builder', path: '/custom-builder', description: 'Interactive tool to design custom rugs' },
  { name: 'Shop', path: '/shop', description: 'Browse original hand-painted rug designs' },
  { name: 'Commission', path: '/commission', description: 'Request custom commission work' },
  { name: 'About', path: '/about', description: 'Story about Rugly and founder Ryan Hensley' },
  { name: 'Contact', path: '/contact', description: 'Get in touch with Rugly' },
  { name: 'Blog', path: '/blog', description: 'Blog and articles' }
];

export default function AdminSEO() {
  return (
    <AdminProtected>
      <AdminSEOContent />
    </AdminProtected>
  );
}

function AdminSEOContent() {
  const queryClient = useQueryClient();
  const [selectedPage, setSelectedPage] = useState(PAGES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewContentModal, setShowNewContentModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    title: PAGES[0].name,
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    slug: PAGES[0].path === '/' ? '' : PAGES[0].path.slice(1),
    status: 'draft'
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Fetch all SEO content
  const { data: contents = [], isLoading } = useQuery({
    queryKey: ['seo-content'],
    queryFn: () => base44.entities.Content.list('-updated_date')
  });

  // Save/Update content
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingContent?.id) {
        return base44.entities.Content.update(editingContent.id, data);
      }
      return base44.entities.Content.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-content'] });
      resetForm();
      alert('Content saved successfully!');
    }
  });

  // Delete content
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Content.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-content'] });
      resetForm();
    }
  });

  const handleGenerateSEO = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateSEO', {
        pageName: selectedPage.name,
        pageContent: selectedPage.description,
        currentTitle: formData.title,
        currentDescription: formData.seo_description
      });

      setFormData(prev => ({
        ...prev,
        seo_title: response.data.title,
        seo_description: response.data.description,
        seo_keywords: response.data.keywords
      }));
    } catch (error) {
      alert('Failed to generate SEO content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = () => {
    if (!formData.title || !formData.slug || !formData.seo_title) {
      alert('Please fill in title, slug, and SEO title');
      return;
    }

    saveMutation.mutate({
      title: formData.title,
      slug: formData.slug,
      seo_title: formData.seo_title,
      seo_description: formData.seo_description,
      seo_keywords: formData.seo_keywords,
      status: formData.status,
      body: formData.body || ''
    });
  };

  const handleLoadContent = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title || '',
      seo_title: content.seo_title || '',
      seo_description: content.seo_description || '',
      seo_keywords: content.seo_keywords || [],
      slug: content.slug || '',
      status: content.status || 'draft',
      body: content.body || ''
    });
  };

  const handleSelectPage = (page) => {
    setSelectedPage(page);
    setEditingContent(null);
    const existingContent = contents.find(c => c.slug === page.path.slice(1) || c.slug === page.path);
    if (existingContent) {
      handleLoadContent(existingContent);
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setEditingContent(null);
    setFormData({
      title: selectedPage.name,
      seo_title: '',
      seo_description: '',
      seo_keywords: [],
      slug: selectedPage.path.slice(1),
      status: 'draft',
      body: ''
    });
    setKeywordInput('');
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.seo_keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seo_keywords: [...prev.seo_keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      seo_keywords: prev.seo_keywords.filter(k => k !== keyword)
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Search className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold">SEO Manager</h1>
          </div>
          <Button onClick={() => setShowNewContentModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Page
          </Button>
        </div>

        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">SEO Editor</TabsTrigger>
            <TabsTrigger value="pages">Content Library</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            {/* Page Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Page to Optimize</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PAGES.map((page) => (
                    <button
                      key={page.name}
                      onClick={() => handleSelectPage(page)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedPage.name === page.name
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">{page.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{page.path}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* AI Generation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      AI-Powered SEO Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate optimized SEO metadata for <strong>{selectedPage.name}</strong> using AI
                    </p>
                    <Button
                      onClick={handleGenerateSEO}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate SEO Content
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Meta Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Meta Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Page Title</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Custom Rug Designer"
                      />
                    </div>

                    <div>
                      <Label>Page Slug</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="e.g., custom-builder"
                      />
                    </div>

                    <div>
                      <Label>Status</Label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>SEO Title (Page Title Tag)</Label>
                      <Input
                        value={formData.seo_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                        placeholder="SEO-optimized title (50-60 chars)"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.seo_title.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <Label>Meta Description</Label>
                      <Textarea
                        value={formData.seo_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                        placeholder="Compelling description (150-160 chars)"
                        maxLength={160}
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.seo_description.length}/160 characters
                      </p>
                    </div>

                    <div>
                      <Label>Keywords</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                          placeholder="Add keyword and press Enter"
                        />
                        <Button onClick={handleAddKeyword} size="sm">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.seo_keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="pl-2">
                            {keyword}
                            <button
                              onClick={() => handleRemoveKeyword(keyword)}
                              className="ml-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Google Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Google Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-white space-y-1">
                      <div className="text-xs text-gray-500">ruglyfloor.com{selectedPage.path}</div>
                      <div className="text-blue-600 text-sm font-medium hover:underline cursor-pointer break-words">
                        {formData.seo_title || 'Your title here...'}
                      </div>
                      <div className="text-xs text-gray-700 line-clamp-2">
                        {formData.seo_description || 'Your description will appear here...'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {formData.seo_title.length >= 50 && formData.seo_title.length <= 60 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span>Title: {formData.seo_title.length}/60 chars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.seo_description.length >= 150 && formData.seo_description.length <= 160 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span>Description: {formData.seo_description.length}/160 chars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {formData.seo_keywords.length >= 5 && formData.seo_keywords.length <= 8 ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span>Keywords: {formData.seo_keywords.length}/8</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={handleSaveContent}
                    className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                    disabled={saveMutation.isPending}
                  >
                    <Save className="w-4 h-4" />
                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>

                  {editingContent && (
                    <>
                      <Button
                        onClick={() => resetForm()}
                        variant="outline"
                        className="w-full"
                      >
                        New
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm('Delete this content?')) {
                            deleteMutation.mutate(editingContent.id);
                          }
                        }}
                        variant="destructive"
                        className="w-full gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>

                {formData.status === 'published' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Globe className="w-4 h-4" />
                      <span>Published</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Library</CardTitle>
              </CardHeader>
              <CardContent>
                {contents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No content yet. Create your first SEO page using the editor tab.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contents.map((content) => (
                      <div
                        key={content.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition cursor-pointer"
                        onClick={() => {
                          handleLoadContent(content);
                          document.querySelector('[value="editor"]').click();
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{content.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{content.seo_description}</p>
                            <div className="flex items-center gap-3 mt-3">
                              <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                                {content.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(content.updated_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {content.status === 'published' ? (
                              <Eye className="w-5 h-5 text-green-600" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Page Modal */}
      <Dialog open={showNewContentModal} onOpenChange={setShowNewContentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Page Name</Label>
              <Input
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="e.g., Testimonials"
              />
            </div>
            <div>
              <Label>Page Path</Label>
              <Input
                value={newPagePath}
                onChange={(e) => setNewPagePath(e.target.value)}
                placeholder="e.g., /testimonials"
              />
            </div>
            <Button
              onClick={() => {
                if (newPageName && newPagePath) {
                  const newPage = { name: newPageName, path: newPagePath, description: newPageName };
                  PAGES.push(newPage);
                  setSelectedPage(newPage);
                  resetForm();
                  setShowNewContentModal(false);
                  setNewPageName('');
                  setNewPagePath('');
                }
              }}
              className="w-full"
            >
              Create Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}