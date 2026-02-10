import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AdminProtected from '@/components/AdminProtected';

export default function AdminNotionSync() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await base44.functions.invoke('syncCatalogFromNotion', {});
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Notion Catalog Sync</CardTitle>
              <CardDescription>
                Sync your catalog data from Notion database to Base44
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleSync}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Sync from Notion
                  </>
                )}
              </Button>

              {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Success!</p>
                    <p className="text-sm text-green-700">{result.message}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 space-y-2 mt-6">
                <p className="font-semibold">Before syncing:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Make sure your Notion database is shared with the Base44 integration</li>
                  <li>Verify NOTION_DATABASE_ID is set correctly</li>
                  <li>This will replace all existing catalog data</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminProtected>
  );
}