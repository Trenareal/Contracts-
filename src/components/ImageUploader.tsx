import React, { useState } from 'react';
import { ContractImage } from '../types';
import { Image as ImageIcon, Upload, X, Trash2, Eye, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { compressImageFile } from '../utils/imageUtils';

interface ImageUploaderProps {
  images: ContractImage[];
  onChange: (images: ContractImage[]) => void;
  maxImages?: number;
  readOnly?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images = [],
  onChange,
  maxImages = 20,
  readOnly = false,
}) => {
  const [activeLightboxImage, setActiveLightboxImage] = useState<ContractImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const fileArray: File[] = Array.from(filesList);

    if (images.length + fileArray.length > maxImages) {
      setError(`Maximum limit reached! You can only upload up to ${maxImages} images per contract.`);
      return;
    }

    setIsProcessing(true);
    const newImages: ContractImage[] = [];

    try {
      for (const file of fileArray) {
        // Basic image validation
        if (!file.type.startsWith('image/')) {
          setError('Only image files (JPG, PNG, WEBP) are allowed.');
          continue;
        }

        // Compress and resize for instantaneous Firestore sync & PDF rendering
        const compressedUrl = await compressImageFile(file, 1200, 0.78);

        newImages.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          url: compressedUrl,
          caption: file.name.replace(/\.[^/.]+$/, ''),
          uploadedAt: new Date().toISOString(),
        });
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    } catch (err: any) {
      console.error('Error compressing/uploading image:', err);
      setError('Failed to process one or more images. Please try again.');
    } finally {
      setIsProcessing(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleRemoveImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onChange(
      images.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-sans font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Contract Photos & Visual Assets ({images.length}/{maxImages})
          </label>
          <p className="text-[11px] font-sans text-slate-500 mt-0.5">
            Attach job site photos, design samples, materials, or progress pictures (Up to {maxImages} photos).
          </p>
        </div>

        {!readOnly && images.length < maxImages && (
          <label className={`flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-blue-600 text-xs font-sans font-bold uppercase tracking-wider text-slate-900 hover:text-blue-600 transition-all cursor-pointer shadow-xs rounded-xl ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{isProcessing ? 'Optimizing...' : 'Upload Photos'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isProcessing}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {isProcessing && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2 rounded-xl animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
          <span>Compressing & preparing images for seamless contract attachment and PDF embedding...</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Drop Zone if Empty */}
      {!readOnly && images.length === 0 && (
        <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 hover:bg-white p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            {isProcessing ? (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <span className="text-xs font-sans font-bold text-slate-800">
            {isProcessing ? 'Optimizing & Attaching Images...' : `Click or drag to upload pictures (Up to ${maxImages})`}
          </span>
          <span className="text-[11px] font-sans text-slate-500 mt-1">
            Supports PNG, JPG, WEBP • Auto-compressed for fast loading & PDF export
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={isProcessing}
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="group relative bg-white border border-slate-200 shadow-xs overflow-hidden flex flex-col rounded-2xl"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square bg-slate-100 overflow-hidden">
                <img
                  src={img.url}
                  alt={img.caption || `Photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Number Badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/70 text-white font-mono text-[10px] font-bold rounded-full backdrop-blur-xs">
                  #{idx + 1}
                </span>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveLightboxImage(img)}
                    className="p-2 bg-white text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                    title="View Fullsize Image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-full transition-colors cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Caption Field */}
              <div className="p-2.5 bg-white border-t border-slate-100">
                {readOnly ? (
                  <p className="text-[11px] font-sans text-slate-800 truncate">
                    {img.caption || `Photo #${idx + 1}`}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={img.caption || ''}
                    placeholder="Add photo label..."
                    onChange={(e) => handleCaptionChange(img.id, e.target.value)}
                    className="w-full text-xs font-sans bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none py-0.5"
                  />
                )}
              </div>
            </div>
          ))}

          {/* Add More Button inside grid if not readOnly */}
          {!readOnly && images.length < maxImages && (
            <label className="border-2 border-dashed border-slate-200 hover:border-blue-600 bg-slate-50/50 aspect-square flex flex-col items-center justify-center text-center cursor-pointer transition-all rounded-2xl">
              <Plus className="w-6 h-6 text-slate-400" />
              <span className="text-[10px] font-sans font-bold text-slate-600 mt-1 uppercase">
                Add Photo
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute top-[-40px] right-0 text-white hover:text-slate-300 transition-colors cursor-pointer p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={activeLightboxImage.url}
              alt={activeLightboxImage.caption || 'Contract Picture'}
              className="max-w-full max-h-[80vh] object-contain shadow-2xl border border-white/20 rounded-2xl"
            />

            {activeLightboxImage.caption && (
              <div className="mt-3 px-5 py-2 bg-slate-900/90 text-white font-sans text-xs border border-white/10 rounded-full">
                {activeLightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
