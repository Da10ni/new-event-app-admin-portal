import type { DragEvent } from 'react';
import { useState, useRef, useCallback } from 'react';
import { MdCloudUpload, MdClose, MdImage } from 'react-icons/md';

interface ImageFile {
  id: string;
  file?: File;
  preview: string;
  progress?: number;
  uploaded?: boolean;
}

interface ImageUploaderProps {
  images: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  className?: string;
}

const ImageUploader = ({
  images,
  onChange,
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      setError(null);

      const remainingSlots = maxFiles - images.length;
      if (remainingSlots <= 0) {
        setError(`Maximum of ${maxFiles} images allowed`);
        return;
      }

      const newImages: ImageFile[] = [];
      const files = Array.from(fileList).slice(0, remainingSlots);

      for (const file of files) {
        if (!acceptedFormats.includes(file.type)) {
          setError(`Invalid format: ${file.name}. Accepted: JPEG, PNG, WebP`);
          continue;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File too large: ${file.name}. Max ${maxSizeMB}MB`);
          continue;
        }

        const preview = URL.createObjectURL(file);
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview,
          progress: 100,
          uploaded: false,
        });
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    },
    [images, onChange, maxFiles, maxSizeMB, acceptedFormats]
  );

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img?.preview) {
      URL.revokeObjectURL(img.preview);
    }
    onChange(images.filter((i) => i.id !== id));
    setError(null);
  };

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'
          }
          ${images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={images.length >= maxFiles}
        />
        <MdCloudUpload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-primary-500' : 'text-neutral-300'}`} />
        <p className="text-sm font-medium text-neutral-500">
          {isDragging ? 'Drop images here' : 'Drag and drop images, or click to browse'}
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          JPEG, PNG, WebP up to {maxSizeMB}MB ({images.length}/{maxFiles} uploaded)
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-error-500">{error}</p>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100"
            >
              {img.preview ? (
                <img
                  src={img.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MdImage className="w-8 h-8 text-neutral-300" />
                </div>
              )}

              {/* Progress overlay */}
              {img.progress !== undefined && img.progress < 100 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-3/4 bg-white/30 rounded-full h-1.5">
                    <div
                      className="bg-white rounded-full h-1.5 transition-all"
                      style={{ width: `${img.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(img.id);
                }}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MdClose className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
