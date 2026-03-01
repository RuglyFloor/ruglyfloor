import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Copy, Upload, X, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIAssistant({ currentImageUrl, rugSize, qualityTier, baseColor, paintColor, secondPaintColor, onApplyColors, onCopySuggestion, onGenerateDesign }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [inspirationImage, setInspirationImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setInspirationImage({ url: file_url, name: file.name });
    } catch (error) {
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const generateSuggestions = async () => {
    if (!prompt.trim() && !inspirationImage) {
      setError('Please enter a design prompt or upload an inspiration image');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('aiAssistant', {
        prompt: prompt || 'Analyze this image and suggest rug design elements including colors, patterns, and style',
        rugSize: rugSize,
        imageUrl: inspirationImage?.url,
        qualityTier: qualityTier,
        generateVariations: qualityTier === 'highend',
        baseColor: baseColor,
        paintColor: paintColor,
        secondPaintColor: secondPaintColor
      });
      
      if (response.data) {
        setSuggestions(response.data);
        setError(null);
      } else {
        setError('Failed to generate suggestions');
      }
    } catch (err) {
      console.error('AI Assistant error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateDesignImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a design prompt to generate an image');
      return;
    }
    
    setGeneratingImage(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('aiAssistant', {
        prompt: prompt,
        rugSize: rugSize,
        imageUrl: inspirationImage?.url,
        qualityTier: qualityTier,
        generateVariations: true,
        referenceImages: inspirationImage?.url ? [inspirationImage.url] : [],
        baseColor: baseColor,
        paintColor: paintColor,
        secondPaintColor: secondPaintColor
      });
      
      if (response.data?.designImage && onGenerateDesign) {
        onGenerateDesign(response.data.designImage);
        setActiveTab('preview');
        setError(null);
      } else if (response.data?.error) {
        setError(response.data.error);
      } else {
        setError('The AI returned an unexpected response. Please try again with a different prompt.');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate design image. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const generateVariations = async () => {
    if (!currentImageUrl) {
      setError('Please generate or upload a design first to create variations');
      return;
    }
    
    setGeneratingImage(true);
    setError(null);
    try {
      const colorList = [paintColor, secondPaintColor].filter(Boolean).join(' and ');
      const variationPrompt = `Create a variation of this hand-painted stencil rug design. Keep the same general style and theme but alter the patterns and composition.

STRICT COLOR RULES: This is a stencil-painted rug. Use ONLY these exact colors:
- Base rug (background): ${baseColor || 'neutral'}
- Paint color(s): ${colorList || 'primary paint color'}
NO other colors, NO gradients, NO photographic shading, NO full-color imagery.

The result should look like a flat overhead photo of a real stencil-painted rug using only the above colors. Suitable for a ${rugSize || 'medium'} rug.`;
      
      const response = await base44.integrations.Core.GenerateImage({
        prompt: variationPrompt,
        existing_image_urls: [currentImageUrl]
      });
      
      if (response?.url && onGenerateDesign) {
        onGenerateDesign(response.url);
        setError(null);
      } else {
        setError('Variation returned no image. Please try again with a different prompt.');
      }
    } catch (err) {
      console.error('Variation generation error:', err);
      setError(err.message || 'Failed to generate variation. Please try again.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const isLuxTier = qualityTier === 'highend';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Design Assistant {isLuxTier && <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Lux Premium</span>}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {isLuxTier 
            ? 'Generate complete AI designs, variations, and get expert suggestions for your luxury rug'
            : 'Get AI-powered color palettes, patterns, and layout suggestions for your rug design'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block font-semibold">Design Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Create a bohemian style rug with floral patterns and earthy tones' or 'Modern geometric design with bold colors' or 'Vintage Persian inspired with rich jewel tones'"
            className="min-h-[120px]"
          />
        </div>

        <div>
          <Label className="mb-2 block font-semibold">Upload Inspiration Image (Optional)</Label>
          <div className="space-y-3">
            {inspirationImage ? (
              <div className="relative border-2 border-blue-500 rounded-lg p-3 bg-blue-50">
                <button
                  onClick={() => setInspirationImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X size={16} />
                </button>
                <img
                  src={inspirationImage.url}
                  alt="Inspiration"
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <p className="text-sm text-gray-700 font-medium">{inspirationImage.name}</p>
              </div>
            ) : (
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                )}
                <span className="text-sm text-gray-600 text-center">
                  {uploadingImage ? 'Uploading...' : 'Click to upload inspiration image'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  AI will analyze colors, patterns, and style
                </span>
              </label>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-2">
          <Button 
            onClick={generateSuggestions} 
            disabled={loading || (!prompt.trim() && !inspirationImage) || uploadingImage || generatingImage}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Design Suggestions
              </>
            )}
          </Button>

          {isLuxTier && (
            <>
              <Button 
                onClick={generateDesignImage} 
                disabled={generatingImage || loading || !prompt.trim() || uploadingImage}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                {generatingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Design...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    ✨ Generate Complete Design (Lux)
                  </>
                )}
              </Button>

              {currentImageUrl && (
                <Button 
                  onClick={generateVariations} 
                  disabled={generatingImage || loading || uploadingImage}
                  variant="outline"
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  {generatingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Variation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Design Variation
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>

        {currentImageUrl && isLuxTier && (
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                ✨ AI Generated Design Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={currentImageUrl} 
                alt="Generated Design" 
                className="w-full rounded-lg shadow-lg mb-3"
              />
              <p className="text-xs text-gray-600 text-center">
                This AI-generated design is ready to use. You can generate variations or continue to customize.
              </p>
            </CardContent>
          </Card>
        )}

        {suggestions && (
          <div className="space-y-4 mt-6">
            {/* Color Palettes */}
            {suggestions.palettes && suggestions.palettes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  🎨 Color Palettes
                </h3>
                {suggestions.palettes.map((palette, idx) => (
                  <Card key={idx} className="border-2 border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{palette.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {palette.colors.map((color, colorIdx) => (
                          <div key={colorIdx} className="flex flex-col items-center gap-1">
                            <div
                              className="w-14 h-14 rounded-lg shadow-md border-2 border-white"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs font-mono">{color}</span>
                          </div>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onApplyColors(palette.colors)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Apply This Palette
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pattern Ideas */}
            {suggestions.patterns && suggestions.patterns.length > 0 && (
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    ✨ Pattern Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {suggestions.patterns.map((pattern, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 font-bold">{idx + 1}.</span>
                        <span className="text-gray-700">{pattern}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopySuggestion(suggestions.patterns.join('\n\n'), 'Pattern Ideas')}
                    className="w-full"
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy All to Instructions
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Layout Suggestions */}
            {suggestions.layouts && suggestions.layouts.length > 0 && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    📐 Layout Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {suggestions.layouts.map((layout, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1 font-bold">{idx + 1}.</span>
                        <span className="text-gray-700">{layout}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopySuggestion(suggestions.layouts.join('\n\n'), 'Layout Suggestions')}
                    className="w-full"
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy All to Instructions
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Luxury Techniques (Lux tier only) */}
            {isLuxTier && suggestions.techniques && suggestions.techniques.length > 0 && (
              <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    ✨ Premium Finishing Techniques
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full ml-2">Lux Exclusive</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {suggestions.techniques.map((technique, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1 font-bold">{idx + 1}.</span>
                        <span className="text-gray-700">{technique}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCopySuggestion(suggestions.techniques.join('\n\n'), 'Premium Techniques')}
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy All to Instructions
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}