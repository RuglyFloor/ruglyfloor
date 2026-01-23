import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2, CheckCircle, Clock, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';

export default function Commission() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  
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

    if (!formData.agreedToDeposit) {
      alert('Please agree to the $300 deposit to proceed');
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = 'COMM-' + Date.now();
      const depositAmount = 300;
      const rushFee = formData.rushOrder ? 159 : 0;
      const totalDeposit = depositAmount + rushFee;
      
      const items = [
        {
          type: 'commission',
          name: 'Custom Commission - Deposit',
          price: depositAmount
        }
      ];

      if (formData.rushOrder) {
        items.push({
          type: 'commission',
          name: 'Rush Order Fee',
          price: rushFee
        });
      }

      const orderData = {
        order_number: orderNumber,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        total_amount: totalDeposit,
        status: 'pending',
        payment_status: 'pending',
        items: items,
        notes: JSON.stringify({
          type: 'commission',
          inspirationImages: formData.inspirationImages,
          description: formData.description,
          preferredSize: formData.preferredSize,
          preferredColors: formData.preferredColors,
          numColors: formData.numColors,
          budgetRange: formData.budgetRange,
          projectType: formData.projectType,
          businessName: formData.businessName,
          rushOrder: formData.rushOrder,
          depositAmount: depositAmount,
          rushFee: rushFee
        })
      };

      console.log('Creating order with data:', orderData);
      const createdOrder = await base44.entities.Order.create(orderData);
      console.log('Order created successfully:', createdOrder);

      await base44.functions.invoke('notifyNewOrder', { 
        orderData: {
          order_number: orderNumber,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          total_amount: totalDeposit,
          items: [{ type: 'commission', name: 'Custom Commission' }]
        }
      });

      setSubmitted(true);
    } catch (error) {
      console.error('Commission submission error:', error);
      alert('Failed to submit commission request. Please try again. Error: ' + error.message);
    } finally {
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
            Thank you for your $300 deposit. We'll create a detailed estimate and reach out within 48 hours.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-700">
              <strong>Next Steps:</strong>
            </p>
            <ul className="text-left text-sm text-gray-700 mt-3 space-y-2">
              <li>• We'll review your design request and create a detailed estimate</li>
              <li>• You'll receive the estimate within 48 hours</li>
              <li>• The $300 deposit will be applied to your total cost</li>
              <li>• {formData.rushOrder ? 'Rush production: 1 week + shipping' : 'Standard production: 3 weeks + shipping'}</li>
            </ul>
          </div>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const totalCost = () => {
    const deposit = 300;
    const rush = formData.rushOrder ? 159 : 0;
    return deposit + rush;
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
        <h1 className="text-4xl font-bold mb-4 text-center">Commission a Rugley Design</h1>
        <p className="text-center text-gray-600 mb-4 text-lg">
          Rugley commissions are bespoke, hand-painted rugs created for interior designers, commercial spaces, hotels, restaurants, Airbnbs, and businesses. Get a detailed estimate from our studio.
        </p>

        {/* What is Rugley Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-900">What is a Rugley?</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Rugley</strong> is our premium commission line designed specifically for interior designers, architects, and commercial clients who need custom floor art that makes a statement.
            </p>
            <p>
              Whether you're outfitting a boutique hotel lobby, creating a branded experience for a restaurant, or adding personality to an Airbnb rental, Rugley commissions are fully custom, one-of-a-kind pieces that transform spaces.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Interior Designers:</strong> Collaborate with us to create signature pieces that complement your vision</li>
              <li><strong>Commercial Spaces:</strong> Hotels, restaurants, offices, retail stores</li>
              <li><strong>Unique Branding:</strong> Custom logos, brand colors, and messaging on durable, washable rugs</li>
              <li><strong>Any Size:</strong> From small accent rugs to massive commercial installations</li>
            </ul>
          </div>
        </div>

        {/* Deposit Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">$300 Deposit Required</h3>
              <p className="text-sm text-gray-700 mb-2">
                The deposit covers the cost of creating a detailed estimate and design mockup. It's applied to your final rug cost.
              </p>
              <p className="text-xs text-gray-600">
                <strong>Non-refundable after estimate approval.</strong> Typical timeline: 3 weeks production + shipping
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
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {formData.inspirationImages.map((url, idx) => (
                      <img key={idx} src={url} alt={`Inspiration ${idx + 1}`} className="w-full h-32 object-cover rounded" />
                    ))}
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

          {/* Deposit Agreement */}
          <Card>
            <CardHeader>
              <CardTitle>Deposit & Agreement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Deposit for Estimate</div>
                    <div className="text-2xl font-bold">$300.00</div>
                  </div>
                  {formData.rushOrder && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Rush Fee</div>
                      <div className="text-2xl font-bold text-orange-600">+$159.00</div>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Due Now:</span>
                    <span className="text-3xl font-bold text-blue-600">${totalCost()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                <p>• The $300 deposit covers our time creating a detailed design estimate and mockup</p>
                <p>• This amount will be <strong>applied to your final rug cost</strong></p>
                <p>• <strong>Non-refundable after you approve the estimate</strong></p>
                <p>• If you decline the estimate, the deposit is refundable</p>
              </div>

              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <input
                  type="checkbox"
                  id="agreedToDeposit"
                  checked={formData.agreedToDeposit}
                  onChange={(e) => setFormData(prev => ({ ...prev, agreedToDeposit: e.target.checked }))}
                  className="w-5 h-5 mt-0.5"
                />
                <Label htmlFor="agreedToDeposit" className="text-sm cursor-pointer">
                  I understand and agree to the $300 deposit terms. This deposit will be applied to my final rug cost and is non-refundable after estimate approval.
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-7"
            disabled={submitting || uploading || !formData.agreedToDeposit}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Submit Request & Pay $${totalCost()} Deposit`
            )}
          </Button>
          <p className="text-center text-xs text-gray-500">
            You'll receive a detailed estimate within 48 hours
          </p>
        </form>
      </div>
    </div>
  );
}