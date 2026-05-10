import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ShoppingBag, BookmarkPlus, Mail, MessageSquare, Phone, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import SEOHead from '../components/seo/SEOHead';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import TrustBadges from '../components/cart/TrustBadges';
import { useCartAbandonment } from '../hooks/useCartAbandonment';

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
  const [useGuestCheckout, setUseGuestCheckout] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [finalSaleAcknowledged, setFinalSaleAcknowledged] = useState(false);

  // Abandonment tracking
  useCartAbandonment(cart);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    setCart(savedCart);
    
    // Load saved customer info
    const savedInfo = localStorage.getItem('rugly_customer_info');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setCustomerInfo(parsed);
        setUseGuestCheckout(false);
      } catch (e) {
        console.error('Failed to load saved customer info');
      }
    }
  }, []);

  // Auto-calculate tax based on state
  useEffect(() => {
    const stateTaxRates = {
      'MI': 0.06,
      'CA': 0.0725,
      'NY': 0.04,
      'TX': 0.0625,
      'FL': 0.06
    };
    const rate = stateTaxRates[customerInfo.state?.toUpperCase()] || 0;
    setTaxRate(rate);
  }, [customerInfo.state]);

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

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  // Shipping cost calculation
  const getShippingCost = () => {
    if (cart.length === 0) return 0;
    // Free shipping if all items are Crugly or Original
    if (cart.every(item => item.qualityTier === 'crugly' || item.qualityTier === 'budget' || item.qualityTier === 'original')) {
      return 0;
    }
    return 15;
  };

  const shippingCost = getShippingCost();
  const taxAmount = (subtotal + shippingCost) * taxRate;
  const totalAmount = subtotal + shippingCost + taxAmount;

  // Check if cart has Crugly or Rugly (requires upfront payment; rugly_lx is deposit-only)
  const hasUpfrontPaymentItems = cart.some(item => 
    item.qualityTier === 'crugly' || item.qualityTier === 'rugly' || 
    item.qualityTier === 'budget' || item.qualityTier === 'good' ||
    item.qualityTier === 'original'
  );
  const paymentAmount = hasUpfrontPaymentItems ? totalAmount : 100; // Full payment for Crugly/Rugly, deposit for Rugly Lux

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const response = await base44.functions.invoke('validateCoupon', {
        code: couponCode.toUpperCase(),
        orderAmount: paymentAmount
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
    
    if (!customerInfo.email || !customerInfo.email.includes('@')) {
      alert('Please provide a valid email address');
      return;
    }

    if (!customerInfo.phone) {
      alert('Please provide your phone number');
      return;
    }

    if (!customerInfo.name) {
      alert('Please provide your full name');
      return;
    }

    if (customerInfo.phone && !smsConsent) {
      alert('Please consent to receive text messages to continue');
      return;
    }

    if (!finalSaleAcknowledged) {
      alert('Please acknowledge that custom rug orders are final sale before proceeding.');
      return;
    }

    // Save customer info for future
    if (!useGuestCheckout) {
      localStorage.setItem('rugly_customer_info', JSON.stringify(customerInfo));
    }

    // Check if running in Base44 preview iframe (not on actual published site)
    try {
      const isPreview = window.self !== window.top && window.location.hostname.includes('base44');
      if (isPreview) {
        alert('⚠️ Checkout only works in the published app. Please visit ruglyfloor.com to complete your purchase.');
        return;
      }
    } catch (e) {
      // Cross-origin iframe — not our preview, let it proceed
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
        couponCode: couponValidation?.valid ? couponCode : null,
        smsConsent
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
      <div className="min-h-screen py-12 px-6 bg-white">
        <SEOHead
          title="Rugly Floors - Cart"
          description="Review your custom rug order and checkout securely."
          url="/cart"
        />
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#343634' }}>Your cart is empty</h2>
          <p className="text-gray-600 mb-8 text-lg">Start designing your custom rug!</p>
          <Button 
            onClick={() => navigate(createPageUrl('CustomBuilder'))}
            className="bg-gray-900 text-white hover:bg-gray-800 font-bold py-6 px-8 text-lg rounded-xl"
          >
            Design a Rug
          </Button>

          {savedItems.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#343634' }}>Saved for Later ({savedItems.length})</h3>
              <div className="space-y-4">
                {savedItems.map((item, index) => {
                  const tierColor = getTierColor(item.qualityTier);
                  return (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-4 flex gap-4 items-center" style={{ border: `3px solid ${tierColor}` }}>
                      {item.previewUrl && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ border: `2px solid ${tierColor}` }}>
                          <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-lg" style={{ color: '#343634' }}>{item.name}</h4>
                        <p className="text-sm font-semibold" style={{ color: tierColor }}>${item.price}</p>
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
                        className="font-bold text-white rounded-lg"
                        style={{ backgroundColor: tierColor }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get tier color for styling
  const getTierColor = (tier) => {
    return tier === 'budget' ? '#24f0a0' : tier === 'good' ? '#4075ff' : '#f04624';
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-white">
      <SEOHead
        title="Rugly Floors - Cart"
        description="Review your custom rug order and checkout securely."
        url="/cart"
      />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 lg:mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 lg:mb-3" style={{ color: '#343634' }}>Your Cart</h1>
          <p className="text-gray-600 text-base lg:text-lg">Review and checkout</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {cart.map((item, index) => {
              const tierColor = getTierColor(item.qualityTier);
              return (
                <div key={index} className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6" style={{ border: `3px lg:border-4 solid ${tierColor}` }}>
                  <div className="flex gap-3 lg:gap-6">
                    {item.previewUrl && (
                      <div className="w-20 lg:w-32 h-20 lg:h-32 rounded-lg lg:rounded-xl overflow-hidden flex-shrink-0" style={{ border: `2px solid ${tierColor}` }}>
                        <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base lg:text-xl mb-1 truncate" style={{ color: '#343634' }}>{item.name}</h3>
                          <div className="inline-block px-2 lg:px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${tierColor}20`, color: tierColor }}>
                            {item.qualityLabel}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {item.type === 'custom' && (
                            <button
                              onClick={() => navigate(createPageUrl('CustomBuilder'))}
                              className="p-2 rounded-lg transition-all hover:bg-gray-100"
                              title="Edit design"
                            >
                              <Pencil className="w-5 h-5" style={{ color: tierColor }} />
                            </button>
                          )}
                          <button
                            onClick={() => saveForLater(index)}
                            className="p-2 rounded-lg transition-all hover:bg-gray-100"
                            title="Save for later"
                          >
                            <BookmarkPlus className="w-5 h-5" style={{ color: tierColor }} />
                          </button>
                          <button
                            onClick={() => removeItem(index)}
                            className="p-2 rounded-lg transition-all hover:bg-red-50"
                            title="Remove"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${tierColor}20` }}>
                            📏
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Size</div>
                            <div className="font-semibold">{item.size}</div>
                          </div>
                        </div>
                        {item.baseColor && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tierColor}20` }}>
                              <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.baseColor.toLowerCase() }}></div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Base</div>
                              <div className="font-semibold text-xs">{item.baseColor}</div>
                            </div>
                          </div>
                        )}
                        {item.paintColor && (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tierColor}20` }}>
                              <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.paintColor.toLowerCase() }}></div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Paint</div>
                              <div className="font-semibold text-xs">{item.paintColor}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: `${tierColor}30` }}>
                        <span className="text-sm text-gray-600">Price</span>
                        <span className="text-2xl font-black" style={{ color: tierColor }}>${item.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Form */}
          <div>
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-xl p-4 lg:p-6 lg:sticky lg:top-6" style={{ border: '3px lg:border-4 solid #343634' }}>
              <div className="mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-bold mb-1 lg:mb-2" style={{ color: '#343634' }}>Checkout</h2>
                <p className="text-xs lg:text-sm text-gray-600">Fast & secure</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Full Name *</Label>
                  <Input 
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="border-2 border-gray-300 focus:border-gray-900 rounded-lg"
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">Email *</Label>
                  <Input 
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="border-2 border-gray-300 focus:border-gray-900 rounded-lg"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">Phone * <span className="text-xs text-gray-500 font-normal">(for order updates)</span></Label>
                  <Input 
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="border-2 border-gray-300 focus:border-gray-900 rounded-lg"
                  />
                </div>

                {/* SMS Consent — always shown once phone is entered */}
                {customerInfo.phone && (
                  <div className="flex items-start space-x-2 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <Checkbox 
                      id="sms-consent" 
                      checked={smsConsent}
                      onCheckedChange={setSmsConsent}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="sms-consent"
                        className="text-xs leading-relaxed cursor-pointer text-gray-700"
                      >
                        I consent to receive text messages from Rugly Floors about my order. Message frequency varies. Message and data rates may apply. Reply STOP to cancel.
                      </label>
                    </div>
                  </div>
                )}

                {/* Master Design Instructions */}
                <div className="border-t-2 pt-6 mt-6" style={{ borderColor: '#343634' }}>
                  <Label className="text-sm mb-3 block font-bold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-900">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    Design Instructions (Optional)
                  </Label>
                  <Textarea
                    value={designInstructions}
                    onChange={(e) => setDesignInstructions(e.target.value)}
                    placeholder="Share any special requests or design details..."
                    className="h-24 text-sm border-2 border-gray-300 focus:border-gray-900 rounded-lg"
                  />
                  
                  <div className="border-2 border-gray-900 p-4 rounded-xl bg-gray-50 mt-4">
                    <p className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Need Help?
                    </p>
                    <div className="flex gap-2">
                      <a href="tel:5177778474" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2 text-xs border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all">
                          <Phone className="w-3 h-3" />
                          Call Us
                        </Button>
                      </a>
                      <a href="sms:5177778474" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-2 text-xs border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-all">
                          <MessageSquare className="w-3 h-3" />
                          Text Us
                        </Button>
                      </a>
                    </div>
                    <p className="text-xs text-center text-gray-600 mt-2 font-semibold">(517) 777-8474</p>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="border-t-2 pt-6 mt-6" style={{ borderColor: '#343634' }}>
                  <Label className="text-sm font-bold mb-3 block">Have a Promo Code?</Label>
                  {!couponValidation?.valid ? (
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        disabled={validatingCoupon}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="border-2 border-gray-300 focus:border-gray-900 rounded-lg"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || validatingCoupon}
                        className="bg-gray-900 text-white hover:bg-gray-800"
                      >
                        {validatingCoupon ? 'Checking...' : 'Apply'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border-2 border-green-500 rounded-xl p-4">
                      <div>
                        <div className="font-bold text-green-800">{couponValidation.coupon.code}</div>
                        <div className="text-xs text-green-600">{couponValidation.coupon.description}</div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t-2 pt-6 mt-6" style={{ borderColor: '#343634' }}>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-bold">FREE</span>
                        ) : (
                          `$${shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {taxRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%)</span>
                        <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {couponValidation?.valid && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({couponValidation.coupon.code})</span>
                        <span className="font-bold">-${couponValidation.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t-2" style={{ borderColor: '#343634' }}>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">{hasUpfrontPaymentItems ? 'Total' : 'Deposit Due'}</span>
                        <span className="text-3xl font-black" style={{ color: '#343634' }}>
                          ${couponValidation?.valid ? couponValidation.final_amount.toFixed(2) : paymentAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    {!useGuestCheckout && taxRate === 0 && customerInfo.state && (
                      <p className="text-xs text-gray-500 text-center">Tax will be calculated at checkout</p>
                    )}
                  </div>
                  
                  {/* Quality Guarantee + Policy Acknowledgment */}
                  <div className="flex items-start space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                    <Checkbox 
                      id="final-sale-ack" 
                      checked={finalSaleAcknowledged}
                      onCheckedChange={setFinalSaleAcknowledged}
                    />
                    <label htmlFor="final-sale-ack" className="text-xs leading-relaxed cursor-pointer text-gray-700">
                      I understand my rug is made to order and hand-painted just for me. If there are any quality issues or damage, I'm covered with a full replacement or refund.{' '}
                      <a href="/Policies" className="underline text-gray-500" target="_blank">See our guarantee</a>
                    </label>
                  </div>

                  <Button 
                    className="w-full text-white font-bold py-5 lg:py-6 text-base lg:text-lg rounded-xl transition-all"
                    style={{ backgroundColor: '#343634', border: 'none' }}
                    onClick={handleCheckout}
                    disabled={submitting || !customerInfo.email || !customerInfo.phone || !customerInfo.name || !finalSaleAcknowledged || (customerInfo.phone && !smsConsent)}
                  >
                    {submitting ? 'Processing...' : `Pay $${couponValidation?.valid ? couponValidation.final_amount.toFixed(2) : paymentAmount.toFixed(2)}`}
                  </Button>
                  
                  {!hasUpfrontPaymentItems && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Balance due before shipping
                    </p>
                  )}
                  
                  {/* Trust Badges */}
                  <TrustBadges className="mt-4" />
                  <p className="text-xs text-center text-gray-400 mt-2">Powered by Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}