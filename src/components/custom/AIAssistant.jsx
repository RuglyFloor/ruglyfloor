import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Palette, LayoutDashboard, Copy, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AIAssistant({ currentImageUrl, rugSize, onApplyColors, onCopySuggestion }) {
    const [prompt, setPrompt] = useState('');
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerateSuggestions = async () => {
        setLoading(true);
        setError(null);
        setSuggestions(null);

        try {
            const response = await base44.functions.invoke('aiAssistant', {
                prompt: prompt,
                imageUrl: currentImageUrl,
                rugSize: rugSize
            });

            if (response.data && !response.data.error) {
                setSuggestions(response.data);
            } else {
                setError(response.data?.error || "Failed to get AI suggestions.");
            }
        } catch (err) {
            console.error("Error invoking AI assistant:", err);
            setError("An unexpected error occurred while generating suggestions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" /> AI Design Assistant
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        Describe your vision and get personalized color palettes, pattern ideas, and layout suggestions.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Example: 'I want a cozy rug for my modern living room with warm earthy tones' or 'A playful geometric pattern inspired by nature for a child's bedroom' or 'Abstract art style with bold contrasting colors'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        className="resize-none bg-white"
                    />
                    {currentImageUrl && (
                        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                            <ImageIcon className="w-4 h-4" /> 
                            <span>AI will analyze your uploaded image for inspiration</span>
                        </div>
                    )}
                    <Button
                        onClick={handleGenerateSuggestions}
                        disabled={loading || !prompt}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Ideas...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Design Ideas
                            </>
                        )}
                    </Button>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            {suggestions && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Color Palettes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-purple-600" /> Color Palettes
                            </CardTitle>
                            <p className="text-sm text-gray-600">Click to apply a palette to your rug</p>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {suggestions.palettes?.map((palette, index) => (
                                <button
                                    key={index}
                                    onClick={() => onApplyColors(palette.colors)}
                                    className="border-2 border-gray-200 hover:border-purple-400 p-4 rounded-lg space-y-3 transition-all hover:shadow-lg cursor-pointer text-left"
                                >
                                    <h4 className="font-semibold text-base">{palette.name}</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {palette.colors?.map((color, colorIndex) => (
                                            <div
                                                key={colorIndex}
                                                className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            ></div>
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium pt-2 border-t">
                                        Click to apply →
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Pattern Ideas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-green-600" /> Pattern Ideas
                            </CardTitle>
                            <p className="text-sm text-gray-600">Creative pattern suggestions for your rug</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {suggestions.patterns?.map((pattern, index) => (
                                <div key={index} className="flex items-start justify-between gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                                Pattern {index + 1}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{pattern}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(pattern);
                                            onCopySuggestion(pattern, 'pattern');
                                        }}
                                        className="flex-shrink-0"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Layout Suggestions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5 text-orange-600" /> Layout Suggestions
                            </CardTitle>
                            <p className="text-sm text-gray-600">How to arrange your design elements</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {suggestions.layouts?.map((layout, index) => (
                                <div key={index} className="flex items-start justify-between gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                                Layout {index + 1}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">{layout}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(layout);
                                            onCopySuggestion(layout, 'layout');
                                        }}
                                        className="flex-shrink-0"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}