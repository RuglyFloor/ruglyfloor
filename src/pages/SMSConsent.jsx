import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, CheckCircle } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';

export default function SMSConsent() {
  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <SEOHead
        title="SMS Text Message Consent - Rugly Floors"
        description="Opt in to receive text message updates about your custom rug order from Rugly Floors."
        url="/sms-consent"
      />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <MessageSquare className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold mb-4">SMS Text Message Consent</h1>
          <p className="text-lg text-gray-600">
            Stay updated on your custom rug order via text message
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How SMS Consent Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                During Checkout
              </h3>
              <p className="mb-3">
                When you place an order on our website, you'll see a consent checkbox if you provide a phone number:
              </p>
              <div className="bg-white border-2 border-gray-300 rounded p-3 text-sm italic">
                "By checking this box, I consent to receive text messages from Rugly Floors at the number provided, 
                including messages sent by autodialer. Consent is not a condition of purchase. Message frequency varies. 
                Message and data rates may apply. Reply STOP to cancel or HELP for help."
              </div>
              <p className="mt-3 text-sm">
                By checking this box, you agree to receive order updates, shipping notifications, and customer service messages via SMS.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">What Messages You'll Receive</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Order confirmation</li>
                <li>Production status updates</li>
                <li>Shipping and delivery notifications</li>
                <li>Customer service responses</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Message & Data Rates</h3>
              <p>
                Message and data rates may apply based on your mobile carrier's plan. Message frequency varies.
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">How to Manage Your Subscription</h3>
              <div className="space-y-2">
                <p>
                  <strong>To Opt-Out:</strong> Reply <span className="font-mono bg-white px-2 py-1 rounded">STOP</span> to any message
                </p>
                <p>
                  <strong>For Help:</strong> Reply <span className="font-mono bg-white px-2 py-1 rounded">HELP</span> to any message
                </p>
                <p>
                  <strong>To Re-Subscribe:</strong> Reply <span className="font-mono bg-white px-2 py-1 rounded">START</span> after opting out
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Privacy & Terms</h3>
              <p>
                Your phone number is kept private and secure. We will never sell or share your information with third parties for marketing purposes.
                For complete details, see our <a href="/Policies" className="text-blue-600 underline">Privacy Policy and SMS Terms</a>.
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-2">Questions?</h3>
              <p>Contact us at:</p>
              <ul className="mt-2 space-y-1">
                <li><strong>Phone:</strong> (517) 777-8474</li>
                <li><strong>Email:</strong> contact@ruglyfloor.com</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Rugly Floors is operated by Homesteads, LLC
          </p>
        </div>
      </div>
    </div>
  );
}