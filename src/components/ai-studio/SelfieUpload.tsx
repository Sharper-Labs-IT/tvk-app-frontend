// src/components/ai-studio/SelfieUpload.tsx

import React, { useCallback, useRef, useState } from 'react';

interface Props {
  onImageSelected: (file: File, previewUrl: string) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_SIZE_MB = 10;

const SelfieUpload: React.FC<Props> = ({ onImageSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, WEBP or HEIC image.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Image must be smaller than ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      const previewUrl = URL.createObjectURL(file);
      onImageSelected(file, previewUrl);
    },
    [onImageSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so user can re-select same file
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Upload box */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`
          relative w-full max-w-lg border-2 border-dashed rounded-2xl cursor-pointer
          flex flex-col items-center justify-center gap-4 p-10 transition-all duration-200
          ${dragOver
            ? 'border-[#E6C65B] bg-[#E6C65B]/10'
            : 'border-white/20 bg-white/5 hover:border-[#E6C65B]/60 hover:bg-white/10'
          }
        `}
      >
        {/* Camera icon */}
        <div className="w-16 h-16 rounded-full bg-[#E6C65B]/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#E6C65B]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-lg">
            {dragOver ? 'Drop it here!' : 'Upload your selfie'}
          </p>
          <p className="text-white/50 text-sm mt-1">
            Drag & drop or click to browse
          </p>
          <p className="text-white/30 text-xs mt-2">
            JPG · PNG · WEBP · HEIC &nbsp;|&nbsp; Max {MAX_SIZE_MB} MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {/* Validation error */}
      {error && (
        <p className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2 w-full max-w-lg">
          {error}
        </p>
      )}

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-xs text-white/50 text-center">
        {[
          { icon: '😊', tip: 'Clear face, good lighting' },
          { icon: '🚫', tip: 'Single face only (no groups)' },
          { icon: '📸', tip: 'Front-facing works best' },
        ].map(({ icon, tip }) => (
          <div
            key={tip}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2"
          >
            <span className="text-base">{icon}</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelfieUpload;
