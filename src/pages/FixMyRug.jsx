import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import PaintApp from '../components/custom/PaintApp';

export default function FixMyRug() {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    rug_size: '4x6',
    rug_material: '',
    issue_type: [],
    issue_description: '',
    service_requested: []
  });

  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPaintApp, setShowPaintApp] = useState(false);
  const [designPaintingUrl, setDesignPaintingUrl] = useState(null);

  const sizesPricing = {
    '2x3': 4900,
    '3x5': 7900,
    '4x6': 9900,
    '5x7': 12900,
    '6x9': 17900,
    '8x10': 24900,
    '9x12': 32900
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setPhotos([...photos, ...uploadedUrls]);
    } catch (error) {
      alert('Failed to upload photos: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleIssueTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      issue_type: prev.issue_type.includes(type)
        ? prev.issue_type.filter(t => t !== type)
        : [...prev.issue_type, type]
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      service_requested: prev.service_requested.includes(service)
        ? prev.service_requested.filter(s => s !== service)
        : [...prev.service_requested, service]
    }));
  };

  const calculatePrice = () => {
    return sizesPricing[formData.rug_size] || 9900;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.issue_type.length === 0) {
      alert('Please select at least one issue type');
      return;
    }

    if (formData.service_requested.length === 0) {
      alert('Please select at least one service');
      return;
    }

    if (photos.length === 0) {
      alert('Please upload at least one photo of your rug');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await base44.functions.invoke('createFixMyRugCheckout', {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: 'US'
        },
        rug_size: formData.rug_size,
        rug_material: formData.rug_material,
        issue_type: formData.issue_type,
        issue_description: formData.issue_description,
        rug_photos: photos,
        service_requested: formData.service_requested,
        price: calculatePrice()
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      alert('Failed to create checkout: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const issueTypes = [
    { value: 'stain', label: 'Stain/Spill' },
    { value: 'tear', label: 'Tear/Rip' },
    { value: 'discoloration', label: 'Discoloration/Fading' },
    { value: 'odor', label: 'Odor' },
    { value: 'wear', label: 'General Wear' },
    { value: 'other', label: 'Other' }
  ];

  const services = [
    { value: 'deep_clean', label: 'Deep Clean', description: 'Professional deep cleaning' },
    { value: 'stain_removal', label: 'Stain Removal', description: 'Targeted stain treatment' },
    { value: 'repair', label: 'Repair', description: 'Fix tears, holes, and fraying' },
    { value: 'painting', label: 'Custom Painting', description: 'Refresh with new designs' }
  ];

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <SEOHead
        title="Fix My Rug - Professional Rug Restoration | Rugly"
        description="Send us your stained, torn, or faded rug for professional cleaning, repair, and custom painting. We'll restore it and ship it back."
        keywords={['rug repair', 'rug restoration', 'rug cleaning', 'stain removal', 'rug painting']}
      />

      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Fix My Rug Service</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Got a stained, torn, or faded rug? Send it to us! We'll clean, repair, paint, and ship it back looking brand new.
          </p>
        </div>

        {/* Pricing Info */}
        <Card className="mb-8 border-2 border-blue-500">
          <CardHeader className="bg-blue-50">
            <CardTitle>Fixed Pricing by Size</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(sizesPricing).map(([size, price]) => (
                <div key={size} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-bold">{size}</div>
                  <div className="text-blue-600 font-semibold">${(price / 100).toFixed(0)}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Price includes cleaning, repair, and custom painting services. Return shipping included!
            </p>
          </CardContent>
        </Card>

        {/* Service Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h3 className="font-semibold">Submit Your Rug Details</h3>
                  <p className="text-sm text-gray-600">Fill out the form and upload photos of your rug</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h3 className="font-semibold">Ship Your Rug to Us</h3>
                  <p className="text-sm text-gray-600">After payment, we'll send you our studio address</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h3 className="font-semibold">We Work Our Magic</h3>
                  <p className="text-sm text-gray-600">Professional cleaning, repair, and custom painting</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h3 className="font-semibold">Receive Your Restored Rug</h3>
                  <p className="text-sm text-gray-600">We ship it back to you, looking brand new!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    required
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Email Address *</Label>
                <Input
                  required
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Return Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Return Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Street Address *</Label>
                <Input
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div>
                  <Label>ZIP Code *</Label>
                  <Input
                    required
                    value={formData.zip}
                    onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rug Details */}
          <Card>
            <CardHeader>
              <CardTitle>Rug Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Rug Size *</Label>
                  <select
                    required
                    value={formData.rug_size}
                    onChange={(e) => setFormData({...formData, rug_size: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    {Object.keys(sizesPricing).map(size => (
                      <option key={size} value={size}>
                        {size} - ${(sizesPricing[size] / 100).toFixed(0)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Material (if known)</Label>
                  <Input
                    placeholder="Wool, polyester, cotton, etc."
                    value={formData.rug_material}
                    onChange={(e) => setFormData({...formData, rug_material: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>What's wrong with your rug? *</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {issueTypes.map(issue => (
                    <div key={issue.value} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.issue_type.includes(issue.value)}
                        onCheckedChange={() => handleIssueTypeToggle(issue.value)}
                      />
                      <label className="text-sm">{issue.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Describe the Issue *</Label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Tell us what happened to your rug..."
                  value={formData.issue_description}
                  onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
                />
              </div>

              <div>
                <Label>Upload Photos of Your Rug *</Label>
                <p className="text-xs text-gray-600 mb-2">Please upload clear photos showing the damage/issues</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    {uploading ? (
                      <Loader2 className="w-12 h-12 mx-auto text-gray-400 animate-spin" />
                    ) : (
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    )}
                    <p className="text-sm text-gray-600 mt-2">Click to upload photos</p>
                  </label>
                </div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {photos.map((url, idx) => (
                      <img key={idx} src={url} alt="Rug" className="w-full h-24 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              {photos.length > 0 && (
                <div>
                  <Label>Paint Your Design Idea (Optional)</Label>
                  <p className="text-xs text-gray-600 mb-2">Paint directly on your rug photo to show us what you want</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPaintApp(!showPaintApp)}
                    className="w-full"
                  >
                    {showPaintApp ? 'Hide Paint App' : 'Open Paint App'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paint App Section */}
          {showPaintApp && (
            <Card>
              <CardHeader>
                <CardTitle>Paint Your Design Idea</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>Select a rug photo to paint on:</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {photos.filter(p => p !== designPaintingUrl).map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDesignPaintingUrl(null)}
                        className={`border-2 rounded overflow-hidden hover:border-blue-500 transition-all ${
                          designPaintingUrl === null ? 'border-blue-500' : 'border-gray-300'
                        }`}
                      >
                        <img src={url} alt="Rug" className="w-full h-24 object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
                <PaintApp 
                  rugSize={formData.rug_size}
                  initialImage={photos.filter(p => p !== designPaintingUrl)[0]}
                  onSaveImage={(url) => {
                    setDesignPaintingUrl(url);
                    if (!photos.includes(url)) {
                      setPhotos([...photos, url]);
                    }
                  }}
                  availableColors={[
                    { name: 'Black', hex: '#000000' },
                    { name: 'White', hex: '#FFFFFF' },
                    { name: 'Red', hex: '#EF4444' },
                    { name: 'Blue', hex: '#3B82F6' },
                    { name: 'Green', hex: '#10B981' },
                    { name: 'Yellow', hex: '#F59E0B' },
                    { name: 'Purple', hex: '#8B5CF6' },
                    { name: 'Pink', hex: '#EC4899' }
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services Requested *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map(service => (
                  <div key={service.value} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={formData.service_requested.includes(service.value)}
                      onCheckedChange={() => handleServiceToggle(service.value)}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{service.label}</div>
                      <div className="text-sm text-gray-600">{service.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Card className="border-2 border-green-500">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    Total: ${(calculatePrice() / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">All services included • Free return shipping</div>
                </div>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}