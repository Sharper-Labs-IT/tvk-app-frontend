// src/pages/AIStudioPage.tsx

import React, { useCallback, useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import SelfieUpload from '../components/ai-studio/SelfieUpload';
import AIGenerationProgress from '../components/ai-studio/AIGenerationProgress';
import GeneratedImageResult from '../components/ai-studio/GeneratedImageResult';
import { generateSelfiWithVJ, fetchSelfieQuota } from '../services/aiStudioService';
import type { AIStudioState, GeneratedSelfie, SelfieQuota } from '../types/aiStudio';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if the user holds a Super Fan membership tier */
const checkIsSuperFan = (user: any): boolean => {
  if (!user) return false;
  const tier = (user.membership_tier || '').toLowerCase();
  const planName = (user.membership?.plan?.name || '').toLowerCase();
  return tier === 'super_fan' || planName.includes('super fan') || planName.includes('superfan');
};

// ── Component ────────────────────────────────────────────────────────────────

const AIStudioPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperFan = checkIsSuperFan(user);

  // Workflow state
  const [state, setState] = useState<AIStudioState>('IDLE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<GeneratedSelfie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<SelfieQuota | null>(null);

  // Fetch quota on mount
  useEffect(() => {
    fetchSelfieQuota()
      .then(setQuota)
      .catch(() => { /* quota is optional */ });
  }, []);

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleImageSelected = useCallback((file: File, preview: string) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
    setState('PREVIEWING');
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedFile) return;
    setState('GENERATING');
    setError(null);
    setUploadProgress(0);

    try {
      const response = await generateSelfiWithVJ(
        { file: selectedFile },
        (pct) => setUploadProgress(pct)
      );

      if (response.success && response.data) {
        setResult(response.data);
        if (response.quota) setQuota(response.quota);
        setState('SUCCESS');
      } else {
        throw new Error(response.message || 'Generation failed.');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.';
      setError(msg);
      setState('ERROR');
    }
  }, [selectedFile]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
    setState('IDLE');
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        {/* ── Page hero ─────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#E6C65B]/10 border border-[#E6C65B]/30 rounded-full px-4 py-1.5 text-[#E6C65B] text-sm font-medium mb-4">
             AI Studio
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Take a Selfie with{' '}
            <span className="text-[#E6C65B]">VJ</span>
          </h1>
          <p className="text-white/50 mt-3 text-base max-w-xl mx-auto">
            Upload your photo and our AI will create a realistic composite of you alongside VJ.
            Share it with your friends, family, and the whole fandom!
          </p>

          {/* Quota pill */}
          {quota && state === 'IDLE' && (
            <div className="inline-flex items-center gap-2 mt-4 text-xs text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <span className={quota.remaining > 0 ? 'text-green-400' : 'text-red-400'}>●</span>
              {quota.remaining > 0
                ? `${quota.remaining} generation${quota.remaining !== 1 ? 's' : ''} remaining today`
                : 'Daily limit reached — try again tomorrow'}
            </div>
          )}
        </div>

        {/* ── Workflow panel ─────────────────────────────────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10">

          {/* IDLE: Upload prompt */}
          {state === 'IDLE' && (
            <SelfieUpload onImageSelected={handleImageSelected} />
          )}

          {/* PREVIEWING: Preview + confirm */}
          {state === 'PREVIEWING' && previewUrl && (
            <PreviewConfirm
              previewUrl={previewUrl}
              onConfirm={handleGenerate}
              onCancel={handleReset}
            />
          )}

          {/* GENERATING: Progress display */}
          {state === 'GENERATING' && (
            <AIGenerationProgress uploadProgress={uploadProgress} />
          )}

          {/* SUCCESS: Show result */}
          {state === 'SUCCESS' && result && (
            <GeneratedImageResult
              result={result}
              isSuperFan={isSuperFan}
              onGenerateAnother={handleReset}
            />
          )}

          {/* ERROR: Error message + retry */}
          {state === 'ERROR' && (
            <ErrorDisplay message={error} onRetry={handleReset} />
          )}
        </div>

        {/* ── Feature info cards ─────────────────────────────────────────── */}
        {state === 'IDLE' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              {
                icon: '🤖',
                title: 'Powered by AI',
                desc: 'Advanced face-blend technology creates ultra-realistic results.',
              },
              {
                icon: '⚡',
                title: 'Fast Results',
                desc: 'Your image is ready in under 40 seconds.',
              },
              {
                icon: '👑',
                title: 'Super Fan Perks',
                desc: 'Unlock watermark-free HD downloads with a Super Fan membership.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex flex-col gap-2"
              >
                <span className="text-2xl">{icon}</span>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// ── Preview Confirm sub-component ────────────────────────────────────────────

interface PreviewConfirmProps {
  previewUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const PreviewConfirm: React.FC<PreviewConfirmProps> = ({ previewUrl, onConfirm, onCancel }) => (
  <div className="flex flex-col items-center gap-6">
    <p className="text-white/60 text-sm">
      Looks good? Hit <span className="text-[#E6C65B] font-semibold">Generate</span> to create your AI photo.
    </p>

    {/* Preview image */}
    <div className="relative w-56 h-56 rounded-2xl overflow-hidden border-2 border-[#E6C65B]/40 shadow-lg">
      <img src={previewUrl} alt="Your selfie preview" className="w-full h-full object-cover" />
    </div>

    {/* Consent note */}
    <p className="text-white/30 text-xs text-center max-w-sm">
      By proceeding you confirm this is your own photo and you consent to AI processing.
    </p>

    {/* Actions */}
    <div className="flex gap-3 w-full max-w-sm">
      <button
        onClick={onCancel}
        className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/10 transition-colors font-medium"
      >
        Change Photo
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 py-3 rounded-xl bg-[#E6C65B] hover:bg-[#B68D40] text-black font-bold transition-colors"
      >
        Generate
      </button>
    </div>
  </div>
);

// ── Error Display sub-component ──────────────────────────────────────────────

interface ErrorDisplayProps {
  message: string | null;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center gap-5 py-8 text-center">
    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>
    <div>
      <p className="text-white font-semibold text-lg">Generation Failed</p>
      <p className="text-white/50 text-sm mt-1 max-w-sm">
        {message || 'Something went wrong. Please try again.'}
      </p>
    </div>
    <button
      onClick={onRetry}
      className="bg-[#E6C65B] hover:bg-[#B68D40] text-black font-bold px-8 py-3 rounded-xl transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default AIStudioPage;
