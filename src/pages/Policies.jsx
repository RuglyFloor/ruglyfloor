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
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Damage or Quality Concerns</h3>
              <p>
                If your rug arrives damaged or with legitimate quality concerns, you may return it within 24 hours of delivery for a full refund. 
                The rug must be returned in its original condition. Please contact us immediately at orders@ruglyfloor.com with photos of the damage or quality issue.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Other Returns & Replacements</h3>
              <p>
                For reasons other than damage or quality defects (such as change of mind, incorrect size ordered, etc.), 
                we offer replacements within 7 days of delivery. Original shipping costs are non-refundable. 
                The rug must be unused and in original condition.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Custom Orders</h3>
              <p>
                Due to the custom, hand-painted nature of our work, all custom rug orders (Cruglys) are final sale. 
                We provide realistic previews during the design process to ensure you're satisfied before production begins.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Return Process</h3>
              <p>
                To initiate a return, contact us at orders@ruglyfloor.com or call (517) 777-8474 within the applicable timeframe. 
                Include your order number and reason for return. We will provide return shipping instructions. 
                Refunds will be processed within 5-7 business days after we receive and inspect the returned item.
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
              <p>
                Each rug is made to order and hand-painted in our studio. Production time varies based on complexity:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Standard custom rugs: 2-4 weeks</li>
                <li>Complex designs or premium effects: 4-6 weeks</li>
                <li>Original Ruglys (in stock): 3-5 business days</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Shipping Costs</h3>
              <p>
                Shipping costs are calculated at checkout based on size and destination. 
                We ship via ground shipping within the continental United States. 
                International shipping is available upon request with additional fees.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Order Tracking</h3>
              <p>
                You will receive email updates throughout the production process and a tracking number when your rug ships.
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
                Vacuum regularly using a low-pile setting. For spills, blot immediately with a clean cloth. 
                Spot clean with mild soap and water as needed. Professional cleaning recommended for deep cleaning.
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
              <p><strong>Email:</strong> orders@ruglyfloor.com</p>
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