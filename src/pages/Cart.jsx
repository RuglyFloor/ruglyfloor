import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ShoppingBag, BookmarkPlus, Mail, X, MessageSquare, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import SEOHead from '../components/seo/SEOHead';
import { Textarea } from '@/components/ui/textarea';

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
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitEmail, setExitEmail] = useState('');
  const [exitEmailSent, setExitEmailSent] = useState(false);
  const [designInstructions, setDesignInstructions] = useState('');

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('rugly_cart') || '[]');
    setCart(savedCart);

    // Exit intent detection
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitEmailSent && savedCart.length > 0) {
        const hasSeenPopup = sessionStorage.getItem('exit_popup_shown');
        if (!hasSeenPopup) {
          setShowExitPopup(true);
          sessionStorage.setItem('exit_popup_shown', 'true');
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [exitEmailSent]);

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

  const handleExitEmailCapture = async () => {
    if (!exitEmail) {
      alert('Please enter your email');
      return;
    }

    try {
      await base44.integrations.Core.SendEmail({
        to: exitEmail,
        subject: 'Your Custom Rug is Waiting! 🎨',
        body: `
          <h2>Don't Leave Your Dream Rug Behind!</h2>
          <p>You have ${cart.length} custom rug${cart.length > 1 ? 's' : ''} in your cart totaling $${totalAmount}.</p>
          <p>Your custom designs are waiting for you! Complete your order and bring art to your floor.</p>
          <p><a href="${window.location.origin}${createPageUrl('Cart')}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Your Order</a></p>
          <p style="margin-top: 20px;">Questions? Reply to this email or call us at (517) 777-8474</p>
        `
      });
      setExitEmailSent(true);
      setTimeout(() => setShowExitPopup(false), 2000);
    } catch (error) {
      console.error('Email send error:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.street || !customerInfo.city) {
      alert('Please fill in all required fields');
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
        customerInfo,
        designInstructions 
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

      {/* Exit Intent Popup */}
      <Dialog open={showExitPopup} onOpenChange={setShowExitPopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Wait! Don't Leave Empty-Handed 🎨</DialogTitle>
          </DialogHeader>
          {exitEmailSent ? (
            <div className="text-center py-6">
              <Mail className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <p className="text-lg font-semibold text-green-700">Email sent! Check your inbox.</p>
              <p className="text-sm text-gray-600 mt-2">We've sent your cart details so you can complete your order anytime.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">Get your cart sent to your email so you can finish your order later!</p>
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={exitEmail}
                  onChange={(e) => setExitEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleExitEmailCapture()}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Special Offer:</strong> Complete your order within 24 hours and get free shipping on orders of 2+ rugs!
                </p>
              </div>
              <Button onClick={handleExitEmailCapture} className="w-full">
                Send Me My Cart
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            {/* Email Capture Banner */}
            {!customerInfo.email && (
              <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-blue-900">Get order updates & exclusive offers!</p>
                      <p className="text-xs text-blue-700">Enter your email below to track your order</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  />
                </div>
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
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200 mt-3">
                    <p className="text-xs font-semibold text-gray-900 mb-2">Need to discuss your design?</p>
                    <div className="flex gap-2">
                      <a href="tel:5177778474" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                          <Phone className="w-3 h-3" />
                          Call
                        </Button>
                      </a>
                      <a href="sms:5177778474" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                          <MessageSquare className="w-3 h-3" />
                          Text
                        </Button>
                      </a>
                    </div>
                    <p className="text-xs text-center text-gray-600 mt-1">(517) 777-8474</p>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-3xl font-bold text-blue-600">${totalAmount}</span>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleCheckout}
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Place Order'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    We'll contact you for payment details
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