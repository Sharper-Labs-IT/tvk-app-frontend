// src/components/ai-studio/AIGenerationProgress.tsx

import React, { useEffect, useState } from 'react';

interface Props {
  /** 0-100: real upload progress (from axios); once upload done stays at 100 */
  uploadProgress: number;
}

const STAGES = [
  { label: 'Uploading your selfie',     minProgress: 0  },
  { label: 'Analysing your face',       minProgress: 100 },
  { label: 'Blending VJ into scene', minProgress: 101 },
  { label: 'Adding final touches',      minProgress: 102 },
  { label: 'Almost ready…',            minProgress: 103 },
];

/**
 * Shows an animated progress screen while the AI is working.
 * uploadProgress (0-100) drives the first stage; remaining stages
 * are cycled automatically with a timer to give perceived progress.
 */
const AIGenerationProgress: React.FC<Props> = ({ uploadProgress }) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [dot, setDot] = useState('');

  // Advance through AI processing stages after upload completes
  useEffect(() => {
    if (uploadProgress < 100) {
      setStageIndex(0);
      return;
    }

    setStageIndex(1);
    const intervals = [3000, 6000, 10000, 16000];
    const timers: ReturnType<typeof setTimeout>[] = [];

    intervals.forEach((delay, i) => {
      timers.push(
        setTimeout(() => setStageIndex(i + 2), delay)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [uploadProgress]);

  // Animated dots
  useEffect(() => {
    const timer = setInterval(
      () => setDot((d) => (d.length >= 3 ? '' : d + '.')),
      500
    );
    return () => clearInterval(timer);
  }, []);

  const currentStage = STAGES[Math.min(stageIndex, STAGES.length - 1)];

  // Upload bar percentage: full 0-100 maps to stage 0 progress
  const barPct = uploadProgress < 100 ? uploadProgress : 100;

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      {/* Spinning ring */}
      <div className="relative w-28 h-28">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#E6C65B] animate-spin"
          style={{ animationDuration: '1.4s' }}
        />
        {/* VJ icon placeholder */}
        <div className="absolute inset-3 rounded-full bg-[#E6C65B]/10 flex items-center justify-center">
          <span className="text-3xl">🎬</span>
        </div>
      </div>

      {/* Stage label */}
      <div className="text-center">
        <p className="text-[#E6C65B] font-semibold text-xl tracking-wide">
          {currentStage.label}{dot}
        </p>
        <p className="text-white/40 text-sm mt-2">
          This usually takes 15–40 seconds. Please don't close the page.
        </p>
      </div>

      {/* Upload progress bar (visible only during upload) */}
      {uploadProgress < 100 && (
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Uploading</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-[#E6C65B] h-2 rounded-full transition-all duration-300"
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Step indicators */}
      <div className="flex gap-3 mt-2">
        {STAGES.map((s, i) => (
          <div
            key={s.label}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i <= stageIndex ? 'bg-[#E6C65B]' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AIGenerationProgress;
