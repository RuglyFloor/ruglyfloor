import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Pencil, Lightbulb, Image } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DrawingCanvas from '../custom/DrawingCanvas';
import DesignLibrary from '../custom/DesignLibrary';
import AIAssistant from '../custom/AIAssistant';
import StencilCreator from '../custom/StencilCreator';

export default function DesignTools({ onDesignSelect }) {
  const [activeTab, setActiveTab] = useState('library');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onDesignSelect(file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg mt-6">
      <h3 className="text-lg font-bold mb-4">Design Your Rug</h3>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="library" className="text-xs">
            <Image className="w-4 h-4 mr-1" />
            Library
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            <Lightbulb className="w-4 h-4 mr-1" />
            AI
          </TabsTrigger>
          <TabsTrigger value="draw" className="text-xs">
            <Pencil className="w-4 h-4 mr-1" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs">
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          <DesignLibrary onSelectDesign={onDesignSelect} />
        </TabsContent>

        <TabsContent value="ai">
          <AIAssistant
            currentImageUrl={null}
            rugSize="medium"
            onApplyColors={() => {}}
            onCopySuggestion={() => {}}
          />
        </TabsContent>

        <TabsContent value="draw">
          <DrawingCanvas
            onSaveDrawing={async (file) => {
              setUploading(true);
              try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                onDesignSelect(file_url);
              } catch (error) {
                console.error('Save failed:', error);
              } finally {
                setUploading(false);
              }
            }}
            availableColors={[
              { name: 'Black', hex: '#000000' },
              { name: 'White', hex: '#ffffff' }
            ]}
            size="medium"
          />
        </TabsContent>

        <TabsContent value="upload">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="design-upload"
                disabled={uploading}
              />
              <label
                htmlFor="design-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {uploading ? 'Uploading...' : 'Click to upload your design'}
                </p>
              </label>
            </div>

            <StencilCreator
              paintColor="#000000"
              baseColor="#86cb92"
              onSaveStencil={onDesignSelect}
              onConfigChange={() => {}}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}