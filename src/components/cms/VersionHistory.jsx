import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, RotateCcw, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function VersionHistory({ versions = [], currentVersion, onRestore }) {
  const [previewVersion, setPreviewVersion] = useState(null);

  if (!versions || versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No version history available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History ({versions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[...versions].reverse().map((version, idx) => (
              <div key={idx} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={version.version === currentVersion ? 'default' : 'outline'}>
                      v{version.version}
                    </Badge>
                    {version.version === currentVersion && (
                      <span className="text-xs text-green-600 font-semibold">Current</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{version.change_note || 'No description'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {version.updated_by} • {format(new Date(version.updated_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewVersion(version)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {version.version !== currentVersion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(version)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!previewVersion} onOpenChange={() => setPreviewVersion(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version {previewVersion?.version} Preview</DialogTitle>
          </DialogHeader>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewVersion?.body }} />
        </DialogContent>
      </Dialog>
    </>
  );
}