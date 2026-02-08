import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, CheckCircle, Clock, Zap, Palette } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import RugVisualizerPro from '../components/custom/RugVisualizerPro';

export default function Commission() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [visualizerOpen, setVisualizerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [formData, setFormData] = useState({
    // Design details
    inspirationImages: [],
    description: '',
    preferredSize: '',
    preferredColors: '',
    numColors: '1-2',
    budgetRange: '',
    
    // Project info
    projectType: 'residential',
    businessName: '',
    
    // Contact info
    name: '',
    email: '',
    phone: '',
    
    // Timeline
    rushOrder: false,
    
    // Terms
    agreedToDeposit: false
  });

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (field === 'inspirationImages') {
        setFormData(prev => ({
          ...prev,
          inspirationImages: [...prev.inspirationImages, file_url]
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: file_url }));
      }
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const depositAmount = 300;
      const response = await base44.functions.invoke('validateCoupon', {
        code: couponCode.toUpperCase(),
        orderAmount: depositAmount
      });

      setCouponValidation(response.data);
      if (!response.data.valid) {
        alert(response.data.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      alert('Failed to validate coupon');
      setCouponValidation(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponValidation(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please provide your name, email, and phone number');
      return;
    }

    if (!formData.description) {
      alert('Please describe your design vision');
      return;
    }

    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('createCommissionCheckout', { 
        formData: formData,
        couponCode: couponValidation?.valid ? couponCode : null
      });

      if (response.data.orderId) {
        // Free submission - no payment required
        setSubmitted(true);
      } else {
        throw new Error('Failed to submit commission');
      }
    } catch (error) {
      console.error('Commission submission error:', error);
      alert('Failed to submit commission. Please try again. Error: ' + error.message);
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 mx-auto text-green-600 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Commission Request Received!</h1>
          <p className="text-xl text-gray-600 mb-4">
            Thank you for your submission. We'll create a detailed estimate and reach out within 48 hours.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-700">
              <strong>Next Steps:</strong>
            </p>
            <ul className="text-left text-sm text-gray-700 mt-3 space-y-2">
              <li>• We'll review your design request and create a detailed estimate</li>
              <li>• You'll receive the estimate within 48 hours</li>
              <li>• {formData.rushOrder ? 'Rush production: 1 week + shipping' : 'Standard production: 3 weeks + shipping'}</li>
            </ul>
          </div>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const totalCost = () => {
    let deposit = 300;
    const rush = formData.rushOrder ? 159 : 0;
    const discount = couponValidation?.valid ? couponValidation.discount_amount : 0;
    return (deposit - discount) + rush;
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <SEOHead
        title="Commission Rugley Designs | Bespoke Hand-Painted Area Rugs for Commercial & Interior Design"
        description="Commission bespoke Rugley hand-painted area rug designs from professional artists. Custom rug trade program for interior designers, commercial spaces, and businesses. Luxury hand-painted carpet designs and custom logo rugs hand-painted for hotels, restaurants, Airbnbs, and offices."
        keywords={['rugley commission', 'commission custom rug design', 'bespoke hand-painted area rugs', 'custom rug trade program for designers', 'luxury hand-painted carpet designs', 'custom logo rugs hand-painted', 'best custom rug designers', 'custom hand-painted rugs for interior designers', 'commercial rug design', 'hotel lobby custom rugs']}
        url="/commission"
      />
      <div className="max-w-4xl mx-auto">
        {/* Production Timeline Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">📅 Custom Commission Timeline</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">1-2 hours</div>
              <div className="text-sm text-gray-700 font-semibold">Design Review</div>
              <div className="text-xs text-gray-600 mt-1">We'll review your request and respond</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">2-4 weeks</div>
              <div className="text-sm text-gray-700 font-semibold">Production</div>
              <div className="text-xs text-gray-600 mt-1">Hand-painting & quality control</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">3-5 days</div>
              <div className="text-sm text-gray-700 font-semibold">Delivery</div>
              <div className="text-xs text-gray-600 mt-1">Shipping to your door</div>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-center">Commission a <span className="rugly-text">Rugly</span> Design</h1>
        <p className="text-center text-gray-600 mb-4 text-lg">
          <span className="rugly-text">Rugly</span> commissions are bespoke, hand-painted rugs created for interior designers, commercial spaces, hotels, restaurants, Airbnbs, and businesses. Get a detailed estimate from our studio.
        </p>

        {/* What is Rugly Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-900">What is <span className="rugly-text">Rugly</span>?</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong className="rugly-text">Rugly</strong> is our premium commission line designed specifically for interior designers, architects, and commercial clients who need custom floor art that makes a statement.
            </p>
            <p>
              Whether you're outfitting a boutique hotel lobby, creating a branded experience for a restaurant, or adding personality to an Airbnb rental, <span className="rugly-text">Rugly</span> commissions are fully custom, one-of-a-kind pieces that transform spaces.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Interior Designers:</strong> Collaborate with us to create signature pieces that complement your vision</li>
              <li><strong>Commercial Spaces:</strong> Hotels, restaurants, offices, retail stores</li>
              <li><strong>Unique Branding:</strong> Custom logos, brand colors, and messaging on durable, washable rugs</li>
              <li><strong>Any Size:</strong> From small accent rugs to massive commercial installations</li>
            </ul>
          </div>
        </div>

        {/* Free Commission Info Banner */}
        <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Free Commission Request</h3>
              <p className="text-sm text-gray-700 mb-2">
                Submit your design vision and get a detailed estimate at no cost. No payment required until you approve the estimate.
              </p>
              <p className="text-xs text-gray-600">
                Typical timeline: 3 weeks production + shipping
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Your Name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <Label>Phone *</Label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Type */}
          <Card>
            <CardHeader>
              <CardTitle>Project Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Is this for residential or commercial use? *</Label>
                <RadioGroup
                  value={formData.projectType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="residential" id="residential" />
                    <Label htmlFor="residential">Residential (Home, apartment, etc.)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="commercial" id="commercial" />
                    <Label htmlFor="commercial">Commercial (Business, office, store, etc.)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.projectType === 'commercial' && (
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your Company LLC"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Design Details */}
          <Card>
            <CardHeader>
              <CardTitle>Design Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Describe your design vision *</Label>
                <Textarea
                  required
                  className="mt-2 h-32"
                  placeholder="Tell us about your ideal rug... What style, theme, or concept are you envisioning? Any specific elements, patterns, or imagery you want included?"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <Label>Upload Inspiration Images (Optional)</Label>
                <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="inspiration-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'inspirationImages')}
                    disabled={uploading}
                    multiple
                  />
                  <label htmlFor="inspiration-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Click to upload reference images</p>
                    <p className="text-xs text-gray-500 mt-1">Logos, artwork, color palettes, etc.</p>
                  </label>
                </div>
                {formData.inspirationImages.length > 0 && (
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      {formData.inspirationImages.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt={`Inspiration ${idx + 1}`} className="w-full h-32 object-cover rounded" />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setSelectedImage(url);
                              setVisualizerOpen(true);
                            }}
                          >
                            <Palette className="w-4 h-4 mr-1" />
                            Draw
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Size and Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Size & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Preferred Size</Label>
                <Input
                  value={formData.preferredSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredSize: e.target.value }))}
                  placeholder="e.g., 5x7, 8x10, 6ft round"
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank if flexible</p>
              </div>

              <div>
                <Label>Preferred Colors</Label>
                <Input
                  value={formData.preferredColors}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredColors: e.target.value }))}
                  placeholder="e.g., Navy blue and gold, earth tones, black and white"
                />
              </div>

              <div>
                <Label>Number of Colors in Design</Label>
                <Select
                  value={formData.numColors}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, numColors: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 colors (Simple)</SelectItem>
                    <SelectItem value="3-4">3-4 colors (Moderate)</SelectItem>
                    <SelectItem value="5+">5+ colors (Complex)</SelectItem>
                    <SelectItem value="flexible">Flexible - You decide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Budget Range (Optional)</Label>
                <Select
                  value={formData.budgetRange}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, budgetRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                    <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
                    <SelectItem value="2000+">$2,000+</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Production Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rushOrder: false }))}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    !formData.rushOrder ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="font-bold">Standard Timeline</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">3 weeks production + shipping</div>
                  <div className="text-lg font-bold text-blue-600">Included</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rushOrder: true }))}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    formData.rushOrder ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <span className="font-bold">Rush Order</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">1 week production + shipping</div>
                  <div className="text-lg font-bold text-orange-600">+$159</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Free Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">FREE</div>
                  <p className="text-sm text-gray-700">
                    No payment required at this time. We'll send you a detailed estimate within 48 hours.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <p>• Get a free, detailed design estimate and mockup</p>
                <p>• Review the estimate and pricing before committing</p>
                <p>• Payment only required after you approve the estimate</p>
                <p>• No deposit, no obligation</p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-7"
            disabled={submitting || uploading}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Free Commission Request'
            )}
          </Button>
          <p className="text-center text-xs text-gray-500">
            You'll receive a detailed estimate within 48 hours
          </p>
        </form>

        {visualizerOpen && selectedImage && (
          <RugVisualizerPro
            rugImage={selectedImage}
            rugName="Design Concept"
            onClose={() => {
              setVisualizerOpen(false);
              setSelectedImage(null);
            }}
          />
        )}
      </div>
    </div>
  );
}