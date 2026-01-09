import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Search, FileText, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SEOAnalyzer from '../components/seo/SEOAnalyzer';

const PAGES = [
  { name: 'Home', path: '/', description: 'Main landing page showcasing custom painted rugs' },
  { name: 'Custom Builder', path: '/custom-builder', description: 'Interactive tool to design custom rugs' },
  { name: 'Shop', path: '/shop', description: 'Browse original hand-painted rug designs' },
  { name: 'Commission', path: '/commission', description: 'Request custom commission work' },
  { name: 'About', path: '/about', description: 'Story about Rugly and founder Ryan Hensley' }
];

export default function AdminSEO() {
  const [user, setUser] = useState(null);
  const [selectedPage, setSelectedPage] = useState(PAGES[0]);
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: []
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleGenerateSEO = async () => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateSEO', {
        pageName: selectedPage.name,
        pageContent: selectedPage.description,
        currentTitle: seoData.title,
        currentDescription: seoData.description
      });

      setSeoData({
        title: response.data.title,
        description: response.data.description,
        keywords: response.data.keywords
      });
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      alert('Failed to generate SEO content');
    } finally {
      setGenerating(false);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !seoData.keywords.includes(keywordInput.trim())) {
      setSeoData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setSeoData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
            <p className="text-gray-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Search className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold">SEO Manager</h1>
        </div>

        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">SEO Editor</TabsTrigger>
            <TabsTrigger value="analyzer">SEO Analyzer</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            {/* Page Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Page</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  {PAGES.map((page) => (
                    <button
                      key={page.name}
                      onClick={() => setSelectedPage(page)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedPage.name === page.name
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold">{page.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{page.path}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                  Generate optimized SEO metadata for <strong>{selectedPage.name}</strong> page using AI
                </p>
                <Button 
                  onClick={handleGenerateSEO} 
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {generating ? (
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

            {/* SEO Form */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meta Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title Tag</Label>
                    <Input
                      value={seoData.title}
                      onChange={(e) => setSeoData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="SEO-optimized page title (50-60 chars)"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {seoData.title.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={seoData.description}
                      onChange={(e) => setSeoData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Compelling description with call-to-action (150-160 chars)"
                      maxLength={160}
                      className="h-24"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {seoData.description.length}/160 characters
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
                      {seoData.keywords.map((keyword, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                        >
                          {keyword}
                          <button onClick={() => handleRemoveKeyword(keyword)} className="hover:text-red-600">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Google Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 bg-white">
                      <div className="text-xs text-gray-500 mb-1">ruglyfloor.com{selectedPage.path}</div>
                      <div className="text-blue-600 text-xl mb-1 hover:underline cursor-pointer">
                        {seoData.title || 'Your page title will appear here'}
                      </div>
                      <div className="text-sm text-gray-700">
                        {seoData.description || 'Your meta description will appear here'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        AI Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analyzer">
            <SEOAnalyzer
              content={selectedPage.description}
              title={seoData.title}
              description={seoData.description}
              keywords={seoData.keywords}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}