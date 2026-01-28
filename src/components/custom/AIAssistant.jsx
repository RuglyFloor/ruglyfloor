import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Copy, Upload, X, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIAssistant({ currentImageUrl, rugSize, onApplyColors, onCopySuggestion }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [inspirationImage, setInspirationImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        imageUrl: inspirationImage?.url
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Design Assistant
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Describe your vision or upload inspiration images, and AI will suggest colors, patterns, and design concepts
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

        <Button 
          onClick={generateSuggestions} 
          disabled={loading || (!prompt.trim() && !inspirationImage) || uploadingImage}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}