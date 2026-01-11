import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Edit, Trash2, Eye, Save, Upload, Loader2, X } from 'lucide-react';
import RichTextEditor from '../components/cms/RichTextEditor';
import VersionHistory from '../components/cms/VersionHistory';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import AdminProtected from '../components/AdminProtected';

const CATEGORIES = [
  { value: 'blog', label: 'Blog Post' },
  { value: 'article', label: 'Article' },
  { value: 'product-guide', label: 'Product Guide' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'news', label: 'News' }
];

export default function ContentManager() {
  return (
    <AdminProtected>
      <ContentManagerContent />
    </AdminProtected>
  );
}

function ContentManagerContent() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    featured_image: '',
    category: 'blog',
    tags: [],
    status: 'draft',
    seo_title: '',
    seo_description: '',
    seo_keywords: []
  });
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ['contents'],
    queryFn: () => base44.entities.Content.list('-updated_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Content.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contents']);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Content.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['contents']);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Content.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['contents']),
  });

  const resetForm = () => {
    setEditingContent(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      body: '',
      featured_image: '',
      category: 'blog',
      tags: [],
      status: 'draft',
      seo_title: '',
      seo_description: '',
      seo_keywords: []
    });
    setChangeNote('');
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      slug: content.slug,
      excerpt: content.excerpt || '',
      body: content.body,
      featured_image: content.featured_image || '',
      category: content.category,
      tags: content.tags || [],
      status: content.status,
      seo_title: content.seo_title || '',
      seo_description: content.seo_description || '',
      seo_keywords: content.seo_keywords || []
    });
  };

  const handleSave = () => {
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const saveData = {
      ...formData,
      slug,
      author_name: user?.full_name || 'Admin',
      published_date: formData.status === 'published' ? new Date().toISOString() : formData.published_date
    };

    if (editingContent) {
      // Version control: save current version to history
      const newVersion = (editingContent.current_version || 1) + 1;
      const versionHistory = editingContent.version_history || [];
      versionHistory.push({
        version: editingContent.current_version || 1,
        body: editingContent.body,
        updated_at: new Date().toISOString(),
        updated_by: user?.full_name || 'Admin',
        change_note: changeNote || 'Content updated'
      });

      updateMutation.mutate({
        id: editingContent.id,
        data: {
          ...saveData,
          current_version: newVersion,
          version_history: versionHistory
        }
      });
    } else {
      createMutation.mutate({
        ...saveData,
        current_version: 1,
        version_history: []
      });
    }
  };

  const handleRestore = (version) => {
    if (confirm(`Restore to version ${version.version}?`)) {
      const newVersion = (editingContent.current_version || 1) + 1;
      const versionHistory = editingContent.version_history || [];
      versionHistory.push({
        version: editingContent.current_version || 1,
        body: editingContent.body,
        updated_at: new Date().toISOString(),
        updated_by: user?.full_name || 'Admin',
        change_note: `Restored from version ${version.version}`
      });

      updateMutation.mutate({
        id: editingContent.id,
        data: {
          body: version.body,
          current_version: newVersion,
          version_history: versionHistory
        }
      });
      setFormData(prev => ({ ...prev, body: version.body }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, featured_image: file_url }));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.seo_keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({ ...prev, seo_keywords: [...prev.seo_keywords, keywordInput.trim()] }));
      setKeywordInput('');
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  if (user.role !== 'admin') return <div className="min-h-screen flex items-center justify-center"><p>Admin access required</p></div>;

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Content Manager</h1>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('Blog')}>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Blog
              </Button>
            </Link>
            {!editingContent && (
              <Button onClick={() => setEditingContent({})}>
                <Plus className="w-4 h-4 mr-2" />
                New Content
              </Button>
            )}
          </div>
        </div>

        {editingContent ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{editingContent.id ? 'Edit Content' : 'Create New Content'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Content title"
                    />
                  </div>

                  <div>
                    <Label>URL Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="auto-generated-from-title"
                    />
                  </div>

                  <div>
                    <Label>Excerpt</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Short summary..."
                      className="h-20"
                    />
                  </div>

                  <div>
                    <Label>Content *</Label>
                    <RichTextEditor
                      value={formData.body}
                      onChange={(value) => setFormData(prev => ({ ...prev, body: value }))}
                    />
                  </div>

                  {editingContent.id && (
                    <div>
                      <Label>Change Note (for version history)</Label>
                      <Input
                        value={changeNote}
                        onChange={(e) => setChangeNote(e.target.value)}
                        placeholder="Describe what you changed..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>SEO Title</Label>
                    <Input
                      value={formData.seo_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                      placeholder="Leave empty to use content title"
                    />
                  </div>
                  <div>
                    <Label>SEO Description</Label>
                    <Textarea
                      value={formData.seo_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                      placeholder="Meta description for search engines"
                      className="h-20"
                    />
                  </div>
                  <div>
                    <Label>SEO Keywords</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                        placeholder="Add keyword"
                      />
                      <Button onClick={handleAddKeyword} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.seo_keywords.map((kw, idx) => (
                        <Badge key={idx} variant="secondary">
                          {kw}
                          <button onClick={() => setFormData(prev => ({ ...prev, seo_keywords: prev.seo_keywords.filter((_, i) => i !== idx) }))} className="ml-2">×</button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Featured Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    {formData.featured_image && (
                      <img src={formData.featured_image} alt="Featured" className="w-full h-32 object-cover rounded mt-2" />
                    )}
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Add tag"
                      />
                      <Button onClick={handleAddTag} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, idx) => (
                        <Badge key={idx}>
                          {tag}
                          <button onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== idx) }))} className="ml-2">×</button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1" disabled={!formData.title || !formData.body}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingContent.id ? 'Update' : 'Create'}
                    </Button>
                    <Button onClick={resetForm} variant="outline">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {editingContent.id && (
                <VersionHistory
                  versions={editingContent.version_history}
                  currentVersion={editingContent.current_version}
                  onRestore={handleRestore}
                />
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Content ({contents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contents.map(content => (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{content.title}</h3>
                        <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                          {content.status}
                        </Badge>
                        <Badge variant="outline">{CATEGORIES.find(c => c.value === content.category)?.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{content.excerpt}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        v{content.current_version || 1} • Updated {format(new Date(content.updated_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(content)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(content.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}