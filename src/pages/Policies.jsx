import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Policies() {
  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Policies & Terms</h1>

        {/* Return & Refund Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Return & Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p className="font-semibold">Effective Date: January 9, 2026</p>

            <p>
              We stand behind every rug we make. If something goes wrong during shipping or doesn't meet your expectations,
              we want to make it right. Here's how our return policy works depending on which product you ordered:
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-green-800">Crugly — 14-Day Shipping Damage Return</h3>
              <p>
                We want you to love your Crugly. If your rug arrives damaged due to shipping, you have <strong>14 days from delivery</strong> to
                contact us and initiate a return. To qualify, simply send us a photo of the damage at info@ruglyfloor.com within that window.
              </p>
              <p className="mt-2">
                <strong>Return shipping is the customer's responsibility.</strong> Once we receive and inspect your returned rug,
                we'll process your refund within 5–7 business days. Refunds are issued to your original payment method.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-blue-800">Rugly — 30-Day Satisfaction Return</h3>
              <p>
                Rugly-tier rugs come with a <strong>30-day return window</strong>. Whether your rug arrived damaged in shipping
                or it just isn't the right fit for your space, we've got you covered.
              </p>
              <p className="mt-2">
                Contact us at info@ruglyfloor.com or (517) 777-8474 within 30 days of delivery. The rug must be returned
                in its original, unused condition. <strong>Return shipping is the customer's responsibility.</strong> Once we receive and inspect
                the rug, your refund will be issued within 5–7 business days.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-amber-800">Rugly LX — Satisfaction Guarantee</h3>
              <p>
                Rugly LX is our top-tier, artist-crafted rug — and we guarantee you'll love it. If for any reason you're not
                completely satisfied, reach out and we'll work with you personally to make it right. Every LX order comes
                with a Certificate of Authenticity and our full satisfaction guarantee.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">How to Start a Return</h3>
              <ol className="list-decimal ml-6 space-y-1">
                <li>Email <strong>info@ruglyfloor.com</strong> with your order number and a brief description (photos of any damage are always helpful).</li>
                <li>We'll confirm your return is eligible and send you return instructions.</li>
                <li>Ship the rug back to us — <strong>return shipping costs are the customer's responsibility.</strong></li>
                <li>Once we receive and inspect the rug, your refund will be processed within <strong>5–7 business days</strong>.</li>
              </ol>
              <p className="mt-3 text-sm text-gray-500">
                No refund will be issued until the returned item has been received and inspected at our studio.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Shipping Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Production Time</h3>
              <p>Every rug is handcrafted in our studio after you order. Here's what to expect:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Crugly:</strong> 10–14 business days</li>
                <li><strong>Rugly:</strong> 14–21 business days</li>
                <li><strong>Rugly LX:</strong> 3–6 weeks (artist-level detail)</li>
                <li><strong>Original Ruglys (in stock):</strong> Ships within 3–5 business days</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-green-800">🚚 Crugly — FREE Shipping</h3>
              <p>
                Every Crugly ships <strong>completely free</strong> within the continental United States.
                Rugs are carefully folded and packaged in a sealed box to arrive safely at your door.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-blue-800">📦 Rugly — Flat Rate Shipping</h3>
              <p>Rugly shipping is a flat rate based on rug size:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Small (2×3, 3×5): <strong>$15</strong></li>
                <li>Medium (4×6, 5×7): <strong>$29</strong></li>
                <li>Large (6×9, 8×10): <strong>$59</strong></li>
                <li>Huge (9×12 and up): <strong>$99</strong></li>
              </ul>
              <p className="mt-2 text-sm">Ships via ground carrier within the continental US. International shipping available on request.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-amber-800">✨ Rugly LX — Specified Shipping</h3>
              <p>
                Due to the size and artisan nature of Rugly LX pieces, shipping costs are quoted individually at the
                time of completion. We work with white-glove and freight carriers to make sure your piece arrives
                safely and in perfect condition. You'll be notified of the exact shipping cost before we ship.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Order Tracking</h3>
              <p>
                You'll receive email and/or text updates throughout production. Once your rug ships, we'll send you
                a tracking number so you can follow it every step of the way.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SMS/Text Messaging Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>SMS/Text Messaging Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p className="font-semibold">Effective Date: January 19, 2026</p>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Consent to Receive Text Messages</h3>
              <p>
                By providing your phone number and consenting to receive text messages from Rugly Floors (Homesteads, LLC), 
                you agree to receive text messages at the phone number provided. Messages may be sent using an autodialer or prerecorded voice. 
                Consent is not required as a condition of purchase.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Message Frequency & Content</h3>
              <p>
                Message frequency varies depending on your order status and communications. You may receive:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Order confirmation messages</li>
                <li>Production status updates</li>
                <li>Shipping and delivery notifications</li>
                <li>Customer service responses</li>
                <li>Occasional promotional messages (if opted in)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Message & Data Rates</h3>
              <p>
                Message and data rates may apply based on your mobile carrier's plan. Please contact your wireless carrier for details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">How to Opt-Out</h3>
              <p>
                You may opt-out of receiving text messages at any time by replying <strong>STOP</strong> to any message. 
                After opting out, you will receive one final confirmation message. You may also contact us at (517) 777-8474 or 
                info@ruglyfloor.com to be removed from our text messaging list.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Help & Support</h3>
              <p>
                For help or questions about text messages, reply <strong>HELP</strong> to any message, or contact us at:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Phone: (517) 777-8474</li>
                <li>Email: info@ruglyfloor.com</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Supported Carriers</h3>
              <p>
                Supported carriers include AT&T, T-Mobile, Verizon, Sprint, and most major U.S. carriers. 
                Message delivery is subject to carrier availability and service.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Privacy</h3>
              <p>
                Your phone number and text message data are subject to our Privacy Policy. 
                We will never sell or share your phone number with third parties for marketing purposes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Age Restriction</h3>
              <p>
                You must be 18 years or older to consent to receive text messages from Rugly Floors.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Terms of Service */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              By placing an order with Rugly (operated by Homesteads, LLC), you agree to the following terms:
            </p>

            <div>
              <h3 className="font-semibold text-lg mb-2">Product Information</h3>
              <p>
                All rugs are hand-painted artworks. While we provide realistic previews and maintain high quality standards, 
                slight variations in color, texture, and detail are inherent to handmade products and are part of their unique character.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Payment</h3>
              <p>
                Payment is processed securely through Stripe at the time of order. 
                We accept all major credit cards. Your payment authorizes us to begin production.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Order Cancellations</h3>
              <p>
                Orders may be cancelled within 24 hours of purchase for a full refund, provided production has not yet begun. 
                After production begins, orders cannot be cancelled.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Intellectual Property</h3>
              <p>
                By uploading designs or images to our platform, you confirm that you own the rights to the content or have permission to use it. 
                Rugly is not responsible for copyright infringement related to customer-provided designs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Limitation of Liability</h3>
              <p>
                Rugly's liability is limited to the purchase price of the product. 
                We are not liable for any indirect, incidental, or consequential damages arising from the use of our products.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Information We Collect</h3>
              <p>
                We collect information necessary to process your order, including:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Contact information (name, email, phone)</li>
                <li>Shipping address</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Design files and preferences you provide</li>
                <li>SMS opt-in status (if you consent to text messages)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">How We Use Your Information</h3>
              <p>
                Your information is used solely to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Process and fulfill your order</li>
                <li>Communicate order updates and shipping information</li>
                <li>Provide customer support</li>
                <li>Send text message updates (only if you've opted in)</li>
                <li>Improve our products and services</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Data Security</h3>
              <p>
                We implement industry-standard security measures to protect your personal information. 
                Payment data is processed through Stripe and never stored on our servers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Third-Party Sharing</h3>
              <p>
                We do not sell or share your personal information with third parties except as necessary to process payments 
                (Stripe) and shipping (shipping carriers). We may share information if required by law.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Your Rights</h3>
              <p>
                You have the right to access, correct, or delete your personal information. 
                Contact us at info@ruglyfloor.com to exercise these rights.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Care Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Care Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Cleaning</h3>
              <p>
                Most Cruglys are machine washable. Woven Ruglys are machine washable and most can be wet vacuumed. 
                For spills, blot immediately with a clean cloth. Spot clean with mild soap and water as needed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Maintenance</h3>
              <p>
                Rotate your rug periodically to ensure even wear. Keep out of direct sunlight to prevent fading. 
                Use a rug pad underneath to prevent slipping and extend the life of your rug.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-700">
            <p className="mb-2">
              For questions about our policies or your order, please contact:
            </p>
            <div className="space-y-1">
              <p><strong>Email:</strong> info@ruglyfloor.com</p>
              <p><strong>Phone:</strong> (517) 777-8474</p>
              <p><strong>Website:</strong> www.ruglyfloor.com</p>
              <p><strong>Business:</strong> Homesteads, LLC</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}