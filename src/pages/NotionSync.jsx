import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function NotionSync() {
  const [pageId, setPageId] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const statusOptions = [
    'Not started',
    'In Progress',
    'Completed',
    'On hold',
    'Cancelled'
  ];

  const handleUpdate = async () => {
    if (!pageId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Notion page ID' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await base44.functions.invoke('updateNotionStatus', {
        pageId: pageId.trim(),
        status
      });

      setMessage({ 
        type: 'success', 
        text: `✓ Status updated to "${status}"` 
      });
      setPageId('');
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update status' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Notion Project Status</h1>
        <p className="text-gray-600 mb-8">Update project status on your Notion pages in real-time</p>

        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="pageId">Notion Page ID</Label>
              <Input
                id="pageId"
                placeholder="Paste your Notion page ID here (e.g., 123abc45...)"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Find your page ID at the end of the Notion URL (32 character string after the last /)
              </p>
            </div>

            <div>
              <Label htmlFor="status">Project Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {message && (
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </span>
              </div>
            )}

            <Button
              onClick={handleUpdate}
              disabled={loading || !pageId.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">How to find your page ID:</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Open your Notion page in a browser</li>
            <li>Copy the URL from the address bar</li>
            <li>The page ID is the 32-character string after the last slash before any ? symbols</li>
            <li>Example: notion.so/MyProject-<strong>123abc456789...</strong>?v=xyz</li>
          </ol>
        </div>
      </div>
    </div>
  );
}