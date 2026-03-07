'use client';

import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
  aspectRatio?: string; // e.g. "16/9" for banner, "1/1" for avatar
}

export default function ImageUpload({
  onUpload,
  currentImage,
  label = 'upload image',
  aspectRatio
}: ImageUploadProps) {
  const { user } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      setError('You must be logged in to upload images');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Create unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${user.id}/${filename}`;

      // Upload via API route (uses service role key, bypasses RLS)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'creator-assets');
      formData.append('path', filePath);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();

      if (!res.ok) {
        console.error('Upload error:', result.error);
        setError('Failed to upload image. Please try again.');
        return;
      }

      const publicUrl = result.url;
      
      if (publicUrl) {
        onUpload(publicUrl);
        setUploadProgress(100);
      } else {
        setError('Failed to get image URL');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => ACCEPTED_TYPES.includes(file.type));
    
    if (imageFile) {
      uploadFile(imageFile);
    } else {
      setError('Please drop a valid image file');
    }
  }, [user]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleRemove = () => {
    onUpload('');
    setError(null);
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
          ${isDragOver 
            ? 'border-emerald-500 bg-emerald-500/5' 
            : currentImage 
              ? 'border-white/20' 
              : 'border-white/10 hover:border-white/20'
          }
          ${isUploading ? 'cursor-not-allowed' : ''}
        `}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {currentImage ? (
          // Image Preview
          <div className="relative w-full h-full min-h-[120px] flex items-center justify-center">
            <img
              src={currentImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          // Upload Placeholder
          <div className="text-center">
            <div className="mx-auto mb-3 p-3 rounded-full bg-white/5 w-fit">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-white/40" />
              )}
            </div>
            
            <p className="text-white text-sm font-medium mb-1 lowercase">
              {isUploading ? 'uploading...' : label}
            </p>
            
            <p className="text-white/40 text-xs">
              {isUploading 
                ? `${uploadProgress}%` 
                : 'drag & drop or click to browse'
              }
            </p>
            
            <p className="text-white/30 text-xs mt-2">
              max 5mb • jpeg, png, webp, gif
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="w-full bg-white/10 rounded-full h-1">
              <div 
                className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}