import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SMSComplianceSample() {
  const sampleText = `Would you like to receive updates by text about your custom rug order? By providing your phone number and checking the consent box, you agree to receive text messages from Rugly Floors (Homesteads, LLC) at the number provided, including messages sent by autodialer. 

Sign up for order updates and production information. Message frequency varies. Message and data rates may apply. 

Text HELP for help. You can opt out at any time by replying "STOP".

For our Privacy Policy and SMS Terms, visit: https://ruglyfloors.com/Policies

Contact us: (517) 777-8474 | contact@ruglyfloor.com`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleText);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">SMS Compliance Sample Text</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Complete SMS Consent Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-6 rounded-lg border-2 border-gray-300 relative">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {sampleText}
              </pre>
              <Button 
                onClick={copyToClipboard}
                size="sm"
                className="absolute top-2 right-2"
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Compliance Checklist ✓</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <strong>SMS Opt-in:</strong>
                  <p className="text-sm text-gray-600">"Would you like to receive updates by text about your custom rug order?"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <strong>SMS Purpose:</strong>
                  <p className="text-sm text-gray-600">"Sign up for order updates and production information"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <strong>Business Name:</strong>
                  <p className="text-sm text-gray-600">"From Rugly Floors (Homesteads, LLC)"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                <div>
                  <strong>Data Rates:</strong>
                  <p className="text-sm text-gray-600">"Message and data rates may apply"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">5</div>
                <div>
                  <strong>Text Frequency:</strong>
                  <p className="text-sm text-gray-600">"Message frequency varies"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">6</div>
                <div>
                  <strong>How to Get Help:</strong>
                  <p className="text-sm text-gray-600">"Text HELP for help"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">7</div>
                <div>
                  <strong>Opt-out Method:</strong>
                  <p className="text-sm text-gray-600">"You can opt out at any time by replying 'STOP'"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">8</div>
                <div>
                  <strong>Link to Privacy Policy:</strong>
                  <p className="text-sm text-gray-600">
                    <a href="https://ruglyfloors.com/Policies" className="text-blue-600 underline">
                      https://ruglyfloors.com/Policies
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Where this appears:</strong> This disclosure is shown on the checkout form at 
              <a href="https://ruglyfloors.com/Cart" className="text-blue-600 underline ml-1">
                ruglyfloors.com/Cart
              </a> when a customer provides a phone number.
            </p>
            <p>
              <strong>How it works:</strong> Customers must check a consent box to agree to receive text messages. 
              The checkbox is required if a phone number is entered.
            </p>
            <p>
              <strong>Full policy:</strong> Complete SMS terms and privacy policy are available at 
              <a href="https://ruglyfloors.com/Policies" className="text-blue-600 underline ml-1">
                ruglyfloors.com/Policies
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}