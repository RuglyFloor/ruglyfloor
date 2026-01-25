import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ShoppingBag, BookmarkPlus, Mail, MessageSquare, Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import SEOHead from '../components/seo/SEOHead';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  });
  const [submitting, setSubmitting] = useState(false);
  const [designInstructions, setDesignInstructions] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    setCart(savedCart);
  }, []);

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('rugly_cart', JSON.stringify(newCart));
  };

  const saveForLater = (index) => {
    const savedItems = JSON.parse(localStorage.getItem('rugly_saved') || '[]');
    savedItems.push(cart[index]);
    localStorage.setItem('rugly_saved', JSON.stringify(savedItems));
    removeItem(index);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const depositAmount = 100;
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

  const handleCheckout = async () => {
    // Track time on site
    const siteStartTime = parseInt(sessionStorage.getItem('rugly_site_start_time') || Date.now());
    const timeOnSite = Math.floor((Date.now() - siteStartTime) / 1000);
    const referrerSource = sessionStorage.getItem('rugly_referrer') || document.referrer || 'direct';
    if (!customerInfo.name || !customerInfo.email || !customerInfo.street || !customerInfo.city) {
      alert('Please fill in all required fields');
      return;
    }

    if (customerInfo.phone && !smsConsent) {
      alert('Please consent to receive text messages if you provide a phone number');
      return;
    }

    // Check if running in iframe (preview mode)
    if (window.self !== window.top) {
      alert('⚠️ Checkout only works in the published app. Please publish your app and open it in a new tab to complete the purchase.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('createCheckout', { 
        cart, 
        customerInfo: {
          ...customerInfo,
          timeOnSite,
          referrerSource
        },
        designInstructions,
        couponCode: couponValidation?.valid ? couponCode : null
      });

      if (response.data.url) {
        // Clear cart before redirecting
        localStorage.removeItem('rugly_cart');
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout. Please try again.');
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    const savedItems = JSON.parse(localStorage.getItem('rugly_saved') || '[]');
    
    return (
      <div className="min-h-screen py-12 px-6">
        <SEOHead
          title="Rugly Floors - Cart"
          description="Review your custom rug order and checkout securely."
          url="/cart"
        />
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some custom rugs to get started!</p>
          <Button onClick={() => navigate(createPageUrl('CustomBuilder'))}>
            Design a Rug
          </Button>

          {savedItems.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">Saved for Later ({savedItems.length})</h3>
              <div className="space-y-3">
                {savedItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 flex gap-4 items-center">
                      {item.previewUrl && (
                        <img src={item.previewUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.price}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const newSaved = savedItems.filter((_, i) => i !== index);
                          localStorage.setItem('rugly_saved', JSON.stringify(newSaved));
                          const currentCart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
                          currentCart.push(item);
                          localStorage.setItem('rugly_cart', JSON.stringify(currentCart));
                          setCart(currentCart);
                        }}
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <SEOHead
        title="Rugly Floors - Cart"
        description="Review your custom rug order and checkout securely."
        url="/cart"
      />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.previewUrl && (
                      <img src={item.previewUrl} alt={item.name} className="w-24 h-24 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      {item.baseColor && <p className="text-sm text-gray-600">Base: {item.baseColor}</p>}
                      {item.paintColor && <p className="text-sm text-gray-600">Paint: {item.paintColor}</p>}
                      {item.is3D && <p className="text-sm text-gray-600">Style: 3-D Effect</p>}
                      <p className="text-xl font-bold text-blue-600 mt-2">${item.price}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveForLater(index)}
                        title="Save for later"
                      >
                        <BookmarkPlus className="w-5 h-5 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input 
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input 
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                {/* SMS Consent */}
                {customerInfo.phone && (
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded">
                    <Checkbox 
                      id="sms-consent" 
                      checked={smsConsent}
                      onCheckedChange={setSmsConsent}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="sms-consent"
                        className="text-xs leading-tight cursor-pointer"
                      >
                        By checking this box, I consent to receive text messages from Rugly Floors at the number provided, including messages sent by autodialer. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply. Reply STOP to cancel or HELP for help.
                      </label>
                    </div>
                  </div>
                )}
                <div>
                  <Label>Street Address *</Label>
                  <Input 
                    value={customerInfo.street}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, street: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input 
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input 
                      value={customerInfo.state}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input 
                    value={customerInfo.zip}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, zip: e.target.value }))}
                  />
                </div>

                {/* Master Design Instructions */}
                <div className="border-t pt-4 mt-4">
                  <Label className="text-sm mb-2 block font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    Master Design Instructions (Optional)
                  </Label>
                  <Textarea
                    value={designInstructions}
                    onChange={(e) => setDesignInstructions(e.target.value)}
                    placeholder="Example: Make the text bold and centered, add a vintage feel, use vibrant colors..."
                    className="h-24 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Share special requests or design details
                  </p>
                  
                  <div className="border-4 border-gray-900 p-3 rounded-lg bg-white mt-3">
                    <p className="text-xs font-semibold text-gray-900 mb-2">Need to discuss your design?</p>
                    <div className="flex gap-2">
                      <a href="tel:5177778474" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs border-2 border-gray-900">
                          <Phone className="w-3 h-3" />
                          Call
                        </Button>
                      </a>
                      <a href="sms:5177778474" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs border-2 border-gray-900">
                          <MessageSquare className="w-3 h-3" />
                          Text
                        </Button>
                      </a>
                    </div>
                    <p className="text-xs text-center text-gray-600 mt-1">(517) 777-8474</p>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="border-t pt-4 mt-4">
                  <Label className="text-sm font-medium mb-2 block">Promo Code</Label>
                  {!couponValidation?.valid ? (
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        disabled={validatingCoupon}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        variant="outline"
                        disabled={!couponCode.trim() || validatingCoupon}
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div>
                        <div className="font-semibold text-green-800">{couponValidation.coupon.code}</div>
                        <div className="text-xs text-green-600">{couponValidation.coupon.description}</div>
                      </div>
                      <Button
                        onClick={handleRemoveCoupon}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Deposit Required</span>
                      <span className="font-semibold">$100.00</span>
                    </div>
                    {couponValidation?.valid && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({couponValidation.coupon.code})</span>
                        <span className="font-semibold">-${couponValidation.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total Due Now</span>
                      <span className="text-2xl">${couponValidation?.valid ? couponValidation.final_amount.toFixed(2) : '100.00'}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full border-4 border-gray-900 bg-white hover:bg-gray-50 text-gray-900 font-bold"
                    onClick={handleCheckout}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : `Pay $${couponValidation?.valid ? couponValidation.final_amount.toFixed(2) : '100'} Deposit`}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Full payment due before shipping
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}