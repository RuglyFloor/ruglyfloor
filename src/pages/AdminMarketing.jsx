import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  TrendingUp, Tag, Image, MessageSquare, BarChart3, 
  Facebook, Instagram, Twitter, Youtube, Sparkles, 
  AlertTriangle, ExternalLink, Plus, Edit, Trash2, Copy,
  Award, ShoppingBag, Package
} from 'lucide-react';
import AdminProtected from '../components/AdminProtected';

function AdminMarketingContent() {
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState('Home');
  const [generatingKeywords, setGeneratingKeywords] = useState(false);
  const [checkingSocial, setCheckingSocial] = useState(false);
  const [analyzingAnalytics, setAnalyzingAnalytics] = useState(false);
  const [socialMessages, setSocialMessages] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Fetch content/SEO data
  const { data: seoPages = [] } = useQuery({
    queryKey: ['seo-content'],
    queryFn: () => base44.entities.Content.list()
  });

  // Fetch coupons
  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => base44.entities.Coupon.list('-created_date')
  });

  const [editingSEO, setEditingSEO] = useState(null);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const pages = ['Home', 'CustomBuilder', 'Shop', 'Commission', 'FixMyRug', 'About', 'Contact'];

  // SEO mutations
  const createSEOMutation = useMutation({
    mutationFn: (data) => base44.entities.Content.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seo-content']);
      setEditingSEO(null);
    }
  });

  const updateSEOMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Content.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seo-content']);
      setEditingSEO(null);
    }
  });

  // Coupon mutations
  const createCouponMutation = useMutation({
    mutationFn: (data) => base44.entities.Coupon.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['coupons']);
      setShowCouponForm(false);
      setEditingCoupon(null);
    }
  });

  const updateCouponMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Coupon.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['coupons']);
      setEditingCoupon(null);
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id) => base44.entities.Coupon.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['coupons'])
  });

  // AI Generate Keywords
  const handleGenerateKeywords = async () => {
    setGeneratingKeywords(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate SEO keywords for a custom hand-painted rug business page: "${activePage}". 
        Provide 10-15 high-value search terms that potential customers would use. 
        Consider: custom rugs, hand-painted rugs, interior design, home decor, artistic rugs.
        Format as comma-separated keywords.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            keywords: { type: "array", items: { type: "string" } },
            title: { type: "string" },
            description: { type: "string" }
          }
        }
      });

      const existingPage = seoPages.find(p => p.slug === activePage.toLowerCase());
      const seoData = {
        slug: activePage.toLowerCase(),
        seo_title: result.title,
        seo_description: result.description,
        seo_keywords: result.keywords
      };

      if (existingPage) {
        await updateSEOMutation.mutateAsync({ id: existingPage.id, data: seoData });
      } else {
        await createSEOMutation.mutateAsync(seoData);
      }

      alert('✨ SEO keywords generated successfully!');
    } catch (error) {
      alert('Failed to generate keywords: ' + error.message);
    } finally {
      setGeneratingKeywords(false);
    }
  };

  // Check Social Media
  const handleCheckSocial = async () => {
    setCheckingSocial(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze social media presence for a custom hand-painted rug business.
        Check platforms: Instagram (@ruglyfloor), Facebook, TikTok (@ruglyfloor), Twitter (@ruglyfloor).
        Identify if there are common types of unanswered questions or engagement opportunities.
        Provide actionable insights about message management and engagement.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            platforms: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  status: { type: "string" },
                  insights: { type: "string" },
                  action_needed: { type: "boolean" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      setSocialMessages(result.platforms);
      alert(`Social media check complete!\n\n${result.summary}`);
    } catch (error) {
      alert('Failed to check social media: ' + error.message);
    } finally {
      setCheckingSocial(false);
    }
  };

  // Analyze Google Analytics
  const handleAnalyzeAnalytics = async () => {
    setAnalyzingAnalytics(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze typical e-commerce drop-off points for a custom rug business.
        Focus on:
        1. Cart abandonment patterns
        2. Checkout process friction
        3. Product page engagement
        4. Custom builder completion rates
        5. Mobile vs desktop conversion
        
        Provide specific recommendations for improvement and typical drop-off percentages.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            drop_off_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  stage: { type: "string" },
                  severity: { type: "string" },
                  typical_drop_rate: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            summary: { type: "string" }
          }
        }
      });

      setAnalyticsData(result);
      alert('Analytics insights generated!');
    } catch (error) {
      alert('Failed to analyze analytics: ' + error.message);
    } finally {
      setAnalyzingAnalytics(false);
    }
  };

  const currentSEO = seoPages.find(p => p.slug === activePage.toLowerCase()) || {
    slug: activePage.toLowerCase(),
    seo_title: '',
    seo_description: '',
    seo_keywords: []
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Marketing & SEO</h1>
          <p className="text-gray-600">Manage SEO, discounts, social media, and analytics</p>
        </div>

        <Tabs defaultValue="seo" className="space-y-6">
          <TabsList>
            <TabsTrigger value="seo" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              SEO & Content
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Tag className="w-4 h-4" />
              Discount Codes
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* SEO & Content Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Page</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={activePage}
                    onChange={(e) => setActivePage(e.target.value)}
                  >
                    {pages.map(page => (
                      <option key={page} value={page}>{page}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>SEO Title</Label>
                  <Input
                    value={currentSEO.seo_title || ''}
                    onChange={(e) => {
                      const updated = { ...currentSEO, seo_title: e.target.value };
                      if (currentSEO.id) {
                        updateSEOMutation.mutate({ id: currentSEO.id, data: updated });
                      }
                    }}
                    placeholder="Page Title for Search Engines"
                  />
                </div>

                <div>
                  <Label>SEO Description</Label>
                  <Textarea
                    value={currentSEO.seo_description || ''}
                    onChange={(e) => {
                      const updated = { ...currentSEO, seo_description: e.target.value };
                      if (currentSEO.id) {
                        updateSEOMutation.mutate({ id: currentSEO.id, data: updated });
                      }
                    }}
                    placeholder="Meta description for search results"
                    rows={3}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>SEO Keywords</Label>
                    <Button
                      size="sm"
                      onClick={handleGenerateKeywords}
                      disabled={generatingKeywords}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      {generatingKeywords ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <Textarea
                    value={currentSEO.seo_keywords?.join(', ') || ''}
                    onChange={(e) => {
                      const keywords = e.target.value.split(',').map(k => k.trim());
                      const updated = { ...currentSEO, seo_keywords: keywords };
                      if (currentSEO.id) {
                        updateSEOMutation.mutate({ id: currentSEO.id, data: updated });
                      }
                    }}
                    placeholder="keyword1, keyword2, keyword3"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discount Codes Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Active Discount Codes</h2>
              <Button onClick={() => setShowCouponForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Coupon
              </Button>
            </div>

            {(showCouponForm || editingCoupon) && (
              <CouponForm
                coupon={editingCoupon}
                onSave={(data) => {
                  if (editingCoupon) {
                    updateCouponMutation.mutate({ id: editingCoupon.id, data });
                  } else {
                    createCouponMutation.mutate(data);
                  }
                }}
                onCancel={() => {
                  setShowCouponForm(false);
                  setEditingCoupon(null);
                }}
              />
            )}

            <div className="grid gap-4">
              {coupons.map(coupon => (
                <Card key={coupon.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-lg font-bold bg-gray-100 px-3 py-1 rounded">
                            {coupon.code}
                          </code>
                          <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {coupon.expires_at && new Date(coupon.expires_at) < new Date() && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="font-semibold">
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}% OFF` 
                              : `$${coupon.discount_value} OFF`}
                          </span>
                          {coupon.min_order_amount > 0 && (
                            <span className="text-gray-500">Min: ${coupon.min_order_amount}</span>
                          )}
                          <span className="text-gray-500">
                            Used: {coupon.times_used} {coupon.max_uses ? `/ ${coupon.max_uses}` : ''}
                          </span>
                          {coupon.expires_at && (
                            <span className="text-gray-500">
                              Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            alert('Code copied!');
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCoupon(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Delete this coupon?')) {
                              deleteCouponMutation.mutate(coupon.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {coupons.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No discount codes yet. Create your first coupon!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Social Media Monitoring</CardTitle>
                  <Button
                    onClick={handleCheckSocial}
                    disabled={checkingSocial}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {checkingSocial ? 'Checking...' : 'Check All Platforms'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <a
                    href="https://instagram.com/ruglyfloor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Instagram className="w-6 h-6 text-pink-600" />
                    <div className="flex-1">
                      <div className="font-semibold">Instagram</div>
                      <div className="text-sm text-gray-500">@ruglyfloor</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  <a
                    href="https://www.facebook.com/profile.php?id=61585565308752"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Facebook className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-semibold">Facebook</div>
                      <div className="text-sm text-gray-500">Rugly Floor</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  <a
                    href="https://twitter.com/ruglyfloor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Twitter className="w-6 h-6 text-blue-400" />
                    <div className="flex-1">
                      <div className="font-semibold">Twitter</div>
                      <div className="text-sm text-gray-500">@ruglyfloor</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  <a
                    href="https://tiktok.com/@ruglyfloor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Youtube className="w-6 h-6 text-black" />
                    <div className="flex-1">
                      <div className="font-semibold">TikTok</div>
                      <div className="text-sm text-gray-500">@ruglyfloor</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  <a
                    href="https://www.youtube.com/@ruglyfloor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Youtube className="w-6 h-6 text-red-600" />
                    <div className="flex-1">
                      <div className="font-semibold">YouTube</div>
                      <div className="text-sm text-gray-500">@ruglyfloor</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  <a
                    href="https://www.reddit.com/user/ruglyfloor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="w-6 h-6 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-semibold">Reddit</div>
                      <div className="text-sm text-gray-500">u/ruglyfloor</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  <a
                    href="https://business.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-semibold">Google Business</div>
                      <div className="text-sm text-gray-500">Rugly Floor</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  <a
                    href="https://www.yelp.com/biz/rugly-floor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Award className="w-6 h-6 text-red-600" />
                    <div className="flex-1">
                      <div className="font-semibold">Yelp</div>
                      <div className="text-sm text-gray-500">Rugly Floor</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  <a
                    href="https://www.etsy.com/shop/ruglyfloor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingBag className="w-6 h-6 text-orange-500" />
                    <div className="flex-1">
                      <div className="font-semibold">Etsy</div>
                      <div className="text-sm text-gray-500">Rugly Floor Shop</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>

                  <a
                    href="https://ruglyfloor.myshopify.com/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Package className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <div className="font-semibold">Shopify</div>
                      <div className="text-sm text-gray-500">Store Admin</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                </div>

                {socialMessages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Platform Insights</h3>
                    <div className="space-y-3">
                      {socialMessages.map((platform, idx) => (
                        <div
                          key={idx}
                          className={`p-4 border rounded-lg ${
                            platform.action_needed ? 'border-orange-500 bg-orange-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {platform.action_needed && <AlertTriangle className="w-5 h-5 text-orange-600" />}
                            <div className="flex-1">
                              <div className="font-semibold">{platform.platform}</div>
                              <div className="text-sm text-gray-600 mt-1">{platform.insights}</div>
                              <Badge className="mt-2">{platform.status}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Conversion Analytics</CardTitle>
                  <Button
                    onClick={handleAnalyzeAnalytics}
                    disabled={analyzingAnalytics}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    {analyzingAnalytics ? 'Analyzing...' : 'AI Analyze'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  Connect Google Analytics (G-6DSQKNVFMB) to track user behavior and identify drop-off points.
                </div>

                {analyticsData && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-sm text-gray-700">{analyticsData.summary}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Drop-off Points</h3>
                      <div className="space-y-3">
                        {analyticsData.drop_off_points?.map((point, idx) => (
                          <div
                            key={idx}
                            className={`p-4 border rounded-lg ${
                              point.severity === 'high' ? 'border-red-500 bg-red-50' :
                              point.severity === 'medium' ? 'border-orange-500 bg-orange-50' :
                              'border-yellow-500 bg-yellow-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold">{point.stage}</div>
                              <Badge variant={point.severity === 'high' ? 'destructive' : 'default'}>
                                {point.typical_drop_rate}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{point.recommendation}</p>
                            <div className="text-xs text-gray-500">Severity: {point.severity}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CouponForm({ coupon, onSave, onCancel }) {
  const [formData, setFormData] = useState(coupon || {
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_uses: null,
    expires_at: '',
    is_active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{coupon ? 'Edit Coupon' : 'New Coupon'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Coupon Code *</Label>
              <Input
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME20"
              />
            </div>
            <div>
              <Label>Discount Type *</Label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="20% off for first-time customers"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Discount Value *</Label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                placeholder={formData.discount_type === 'percentage' ? '20' : '50'}
              />
            </div>
            <div>
              <Label>Min Order ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Max Uses</Label>
              <Input
                type="number"
                value={formData.max_uses || ''}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div>
            <Label>Expiration Date</Label>
            <Input
              type="datetime-local"
              value={formData.expires_at ? new Date(formData.expires_at).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
            />
            <Label>Active</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminMarketing() {
  return (
    <AdminProtected>
      <AdminMarketingContent />
    </AdminProtected>
  );
}