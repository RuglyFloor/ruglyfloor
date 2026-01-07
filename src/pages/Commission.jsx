import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

export default function Commission() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Inspiration images
    inspirationImages: [],
    skipInspirationImages: false,
    
    // Base rug link
    baseRugLink: '',
    baseRugPrice: '',
    skipBaseRug: false,
    
    // Scale/size
    scale: '',
    skipScale: false,
    
    // Space photo
    spacePhoto: '',
    skipSpacePhoto: false,
    
    // Description
    description: '',
    
    // Contact info
    name: '',
    email: '',
    phone: '',
    businessName: '',
    isCommercial: false,
    
    // Communication preference
    communicationPreference: 'let_us_decide',
    
    // Payment
    downPayment: 0
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
    
    if (!formData.name || !formData.email) {
      alert('Please provide your name and email');
      return;
    }

    if (!formData.skipBaseRug && !formData.baseRugPrice) {
      alert('Please provide the base rug price or select "I don\'t care"');
      return;
    }

    setSubmitting(true);
    try {
      // Create commission order
      const orderNumber = 'COMM-' + Date.now();
      
      await base44.entities.Order.create({
        order_number: orderNumber,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        total_amount: parseFloat(formData.downPayment) || 0,
        status: 'pending',
        payment_status: 'pending',
        items: [{
          type: 'commission',
          name: 'Custom Commission',
          price: parseFloat(formData.downPayment) || 0
        }],
        notes: JSON.stringify({
          type: 'commission',
          inspirationImages: formData.inspirationImages,
          skipInspirationImages: formData.skipInspirationImages,
          baseRugLink: formData.baseRugLink,
          baseRugPrice: formData.baseRugPrice,
          skipBaseRug: formData.skipBaseRug,
          scale: formData.scale,
          skipScale: formData.skipScale,
          spacePhoto: formData.spacePhoto,
          skipSpacePhoto: formData.skipSpacePhoto,
          description: formData.description,
          businessName: formData.businessName,
          isCommercial: formData.isCommercial,
          communicationPreference: formData.communicationPreference
        })
      });

      // Send notification
      await base44.functions.invoke('notifyNewOrder', { 
        orderData: {
          order_number: orderNumber,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          total_amount: parseFloat(formData.downPayment) || 0,
          items: [{ type: 'commission', name: 'Custom Commission' }]
        }
      });

      setSubmitted(true);
    } catch (error) {
      alert('Failed to submit commission request. Please try again.');
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
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your submission. We'll review your request and reach out to you shortly to discuss your custom Rugly.
          </p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Commission Your Own Design</h1>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Perfect for businesses and unique spaces. Share your vision and we'll bring it to life.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Type */}
          <Card>
            <CardHeader>
              <CardTitle>About You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="isCommercial"
                  checked={formData.isCommercial}
                  onChange={(e) => setFormData(prev => ({ ...prev, isCommercial: e.target.checked }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="isCommercial">This is for a commercial/business project</Label>
              </div>
              
              {formData.isCommercial && (
                <div>
                  <Label>Business Name</Label>
                  <Input
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  />
                </div>
              )}
              
              <div>
                <Label>Your Name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inspiration Images */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Design Inspiration</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, skipInspirationImages: !prev.skipInspirationImages }))}
                >
                  {formData.skipInspirationImages ? '✓ Skipped' : 'I don\'t care'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!formData.skipInspirationImages && (
                <div>
                  <Label>Upload inspiration images (logos, artwork, patterns)</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="inspiration-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'inspirationImages')}
                      disabled={uploading}
                    />
                    <label htmlFor="inspiration-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">Click to upload images</p>
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
              )}
            </CardContent>
          </Card>

          {/* Base Rug */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Base Rug</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, skipBaseRug: !prev.skipBaseRug }))}
                >
                  {formData.skipBaseRug ? '✓ Skipped' : 'I don\'t care'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!formData.skipBaseRug && (
                <div className="space-y-4">
                  <div>
                    <Label>Link to product online</Label>
                    <Input
                      placeholder="https://example.com/rug"
                      value={formData.baseRugLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseRugLink: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Base Rug Price (required for down payment)</Label>
                    <Input
                      type="number"
                      placeholder="299.99"
                      value={formData.baseRugPrice}
                      onChange={(e) => {
                        const price = e.target.value;
                        setFormData(prev => ({ ...prev, baseRugPrice: price, downPayment: price }));
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scale/Size */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Scale/Size</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, skipScale: !prev.skipScale }))}
                >
                  {formData.skipScale ? '✓ Skipped' : 'I don\'t care'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!formData.skipScale && (
                <Input
                  placeholder="e.g., 8x10, 5ft round, 120x180cm"
                  value={formData.scale}
                  onChange={(e) => setFormData(prev => ({ ...prev, scale: e.target.value }))}
                />
              )}
            </CardContent>
          </Card>

          {/* Space Photo */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Space Photo</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, skipSpacePhoto: !prev.skipSpacePhoto }))}
                >
                  {formData.skipSpacePhoto ? '✓ Skipped' : 'I don\'t care'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!formData.skipSpacePhoto && (
                <div>
                  <Label>Upload a photo of the space</Label>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                    {formData.spacePhoto ? (
                      <div>
                        <img src={formData.spacePhoto} alt="Space" className="max-h-64 mx-auto mb-4 rounded" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('space-upload').click()}
                        >
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="space-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">Click to upload</p>
                      </label>
                    )}
                    <input
                      type="file"
                      id="space-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'spacePhoto')}
                      disabled={uploading}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Your Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <Label>Describe what you're looking for</Label>
              <Textarea
                className="mt-2 h-32"
                placeholder="Tell us about your vision, style preferences, color palette, or any specific requirements..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* Communication Preference */}
          <Card>
            <CardHeader>
              <CardTitle>How would you like us to collaborate?</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.communicationPreference}
                onValueChange={(value) => setFormData(prev => ({ ...prev, communicationPreference: value }))}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="call" id="call" />
                  <Label htmlFor="call">Phone Call</Label>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video">Video Chat</Label>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="let_us_decide" id="let_us_decide" />
                  <Label htmlFor="let_us_decide">Let us decide</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="surprise" id="surprise" />
                  <Label htmlFor="surprise">Surprise me! (Full creative freedom)</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Down Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Down Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  Down payment equals the price of the base rug
                </p>
                <div className="text-3xl font-bold text-blue-600">
                  ${formData.downPayment || '0.00'}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We'll provide a final quote and payment details after reviewing your request
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            disabled={submitting || uploading}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Commission Request'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}