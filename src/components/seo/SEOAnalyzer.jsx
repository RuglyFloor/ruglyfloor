import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function SEOAnalyzer({ content, title, description, keywords = [] }) {
  const analyzeContent = () => {
    const results = [];
    
    // Title Length Check
    const titleLength = title?.length || 0;
    results.push({
      name: 'Title Length',
      status: titleLength >= 50 && titleLength <= 60 ? 'good' : titleLength > 0 ? 'warning' : 'error',
      message: titleLength >= 50 && titleLength <= 60 
        ? `Perfect length (${titleLength} chars)` 
        : titleLength > 60 
        ? `Too long (${titleLength} chars, aim for 50-60)` 
        : `Too short (${titleLength} chars, aim for 50-60)`
    });

    // Description Length Check
    const descLength = description?.length || 0;
    results.push({
      name: 'Meta Description',
      status: descLength >= 150 && descLength <= 160 ? 'good' : descLength > 0 ? 'warning' : 'error',
      message: descLength >= 150 && descLength <= 160 
        ? `Perfect length (${descLength} chars)` 
        : descLength > 160 
        ? `Too long (${descLength} chars, aim for 150-160)` 
        : `Too short (${descLength} chars, aim for 150-160)`
    });

    // Keywords Check
    results.push({
      name: 'Keywords',
      status: keywords.length >= 5 && keywords.length <= 8 ? 'good' : keywords.length > 0 ? 'warning' : 'error',
      message: keywords.length >= 5 && keywords.length <= 8 
        ? `Good keyword count (${keywords.length})` 
        : keywords.length > 8 
        ? `Too many keywords (${keywords.length}, aim for 5-8)` 
        : `Add more keywords (${keywords.length}, aim for 5-8)`
    });

    // Keyword Density in Content
    if (content && keywords.length > 0) {
      const wordCount = content.split(/\s+/).length;
      const keywordOccurrences = keywords.reduce((count, keyword) => {
        const regex = new RegExp(keyword, 'gi');
        return count + (content.match(regex) || []).length;
      }, 0);
      const density = ((keywordOccurrences / wordCount) * 100).toFixed(2);
      
      results.push({
        name: 'Keyword Density',
        status: density >= 1 && density <= 3 ? 'good' : density > 0 ? 'warning' : 'error',
        message: density >= 1 && density <= 3 
          ? `Optimal density (${density}%)` 
          : density > 3 
          ? `Too high (${density}%, aim for 1-3%)` 
          : `Too low (${density}%, aim for 1-3%)`
      });
    }

    // Header Structure (H1 count)
    if (content) {
      const h1Count = (content.match(/<h1/gi) || []).length;
      results.push({
        name: 'H1 Headers',
        status: h1Count === 1 ? 'good' : h1Count === 0 ? 'error' : 'warning',
        message: h1Count === 1 
          ? 'One H1 tag (perfect)' 
          : h1Count === 0 
          ? 'Missing H1 tag' 
          : `Multiple H1 tags (${h1Count}, should have only 1)`
      });
    }

    return results;
  };

  const results = analyzeContent();
  const score = Math.round((results.filter(r => r.status === 'good').length / results.length) * 100);

  const getStatusIcon = (status) => {
    if (status === 'good') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === 'warning') return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusColor = (status) => {
    if (status === 'good') return 'bg-green-50 border-green-200';
    if (status === 'warning') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>SEO Analysis</span>
          <Badge className={score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-600' : 'bg-red-600'}>
            Score: {score}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((result, idx) => (
          <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${getStatusColor(result.status)}`}>
            {getStatusIcon(result.status)}
            <div className="flex-1">
              <div className="font-semibold text-sm">{result.name}</div>
              <div className="text-sm text-gray-600">{result.message}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}