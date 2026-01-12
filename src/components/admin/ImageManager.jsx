import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Upload, Crop, Trash2, Eye, EyeOff, MoveUp, MoveDown, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImageManager({ images = [], onChange, onGenerateAI }) {
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cropping, setCropping] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newImage = {
        id: Date.now().toString(),
        url: file_url,
        original_url: file_url,
        selected: images.length === 0,
        order: images.length,
        source: 'upload'
      };
      onChange([...images, newImage]);
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const createCroppedImage = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.95);
      };
    });
  };

  const handleCrop = async () => {
    if (!cropImage || !croppedAreaPixels) return;

    setCropping(true);
    try {
      const croppedBlob = await createCroppedImage(cropImage.url, croppedAreaPixels);
      const file = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const updatedImages = images.map(img =>
        img.id === cropImage.id ? { ...img, url: file_url } : img
      );
      onChange(updatedImages);
      setCropImage(null);
    } catch (error) {
      alert('Failed to crop image');
    } finally {
      setCropping(false);
    }
  };

  const toggleSelection = (id) => {
    const updatedImages = images.map(img =>
      img.id === id ? { ...img, selected: !img.selected } : img
    );
    onChange(updatedImages);
  };

  const moveImage = (id, direction) => {
    const index = images.findIndex(img => img.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) return;

    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    // Update order values
    newImages.forEach((img, idx) => {
      img.order = idx;
    });
    
    onChange(newImages);
  };

  const deleteImage = (id) => {
    if (confirm('Delete this image?')) {
      onChange(images.filter(img => img.id !== id));
    }
  };

  const selectedCount = images.filter(img => img.selected).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-manager-upload').click()}
          disabled={uploading}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        <input
          id="image-manager-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
          multiple
        />
        {images.length > 0 && onGenerateAI && (
          <Button
            type="button"
            onClick={onGenerateAI}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI Images
          </Button>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="text-sm text-blue-600 font-semibold">
          {selectedCount} image{selectedCount !== 1 ? 's' : ''} selected for display
        </div>
      )}

      {images.length === 0 ? (
        <Card className="p-8 text-center text-gray-400">
          <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No images yet. Upload your first image.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image, index) => (
            <Card key={image.id} className={`p-3 ${!image.selected ? 'opacity-50' : ''}`}>
              <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2 relative group">
                <img src={image.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setCropImage(image)}
                  >
                    <Crop className="w-3 h-3" />
                  </Button>
                </div>
                {image.source === 'ai' && (
                  <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs px-2 py-0.5 rounded">
                    AI
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={image.selected ? 'default' : 'outline'}
                  onClick={() => toggleSelection(image.id)}
                  className="flex-1 gap-1"
                >
                  {image.selected ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {image.selected ? 'Show' : 'Hide'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => moveImage(image.id, 'up')}
                  disabled={index === 0}
                >
                  <MoveUp className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => moveImage(image.id, 'down')}
                  disabled={index === images.length - 1}
                >
                  <MoveDown className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => deleteImage(image.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={cropImage !== null} onOpenChange={() => setCropImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative h-96 bg-gray-100 rounded">
              {cropImage && (
                <Cropper
                  image={cropImage.url}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCrop} disabled={cropping} className="flex-1">
                {cropping ? 'Cropping...' : 'Apply Crop'}
              </Button>
              <Button variant="outline" onClick={() => setCropImage(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}