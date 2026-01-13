import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ImageUploader({ onImageSelect, accept = 'image/*' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    onImageSelect(preview);
    setShowPreview(false);
    setPreview(null);
  };

  if (showPreview) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <img src={preview} alt="Preview" className="w-full max-h-96 object-contain" />
          </div>
          <div className="text-sm text-gray-600">
            Preview looks good? We'll transform this into a beautiful stencil design.
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
            >
              <Check className="w-4 h-4" />
              Use This Image
            </Button>
            <Button
              onClick={() => setShowPreview(false)}
              variant="outline"
              className="flex-1"
            >
              Try Another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-12">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-12 cursor-pointer text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-100 rounded-full">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Drop Your Image Here</h3>
          <p className="text-gray-600 mb-4">
            Or click to browse your files (PNG, JPG, GIF, etc.)
          </p>
          <Button type="button">Choose Image</Button>
          <p className="text-xs text-gray-500 mt-4">
            💡 Pro tip: Logos, photos, and artwork all work great!
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileInput}
        />
      </CardContent>
    </Card>
  );
}