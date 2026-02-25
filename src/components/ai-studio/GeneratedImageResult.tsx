// src/components/ai-studio/GeneratedImageResult.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GeneratedSelfie } from '../../types/aiStudio';
import { downloadCleanSelfie } from '../../services/aiStudioService';

interface Props {
  result: GeneratedSelfie;
  isSuperFan: boolean;
  onGenerateAnother: () => void;
}

const GeneratedImageResult: React.FC<Props> = ({ result, isSuperFan, onGenerateAnother }) => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  // ── Download handler ──────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!isSuperFan) {
      // Watermarked download: just open the URL
      const a = document.createElement('a');
      a.href = result.image_url;
      a.download = `tvk-selfie-${result.id}.jpg`;
      a.target = '_blank';
      a.click();
      return;
    }

    // Super Fan: fetch clean image from backend
    try {
      setDownloading(true);
      const blob = await downloadCleanSelfie(result.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tvk-selfie-clean-${result.id}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Share handler ─────────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareData: ShareData = {
      title: 'I met VJ! 🎬',
      text: 'Check out my AI photo with VJ on TVK Fans Hub!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setShareMsg('Link copied to clipboard!');
      setTimeout(() => setShareMsg(null), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* ── Generated image ───────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <img
          src={result.image_url}
          alt="AI generated selfie with VJ"
          className="w-full object-cover"
          loading="lazy"
        />

        {/* Watermark badge for free users */}
        {!isSuperFan && !result.is_watermark_removed && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-[#E6C65B] text-xs font-bold px-3 py-1 rounded-full border border-[#E6C65B]/30">
            TVK Fans Hub
          </div>
        )}

        {/* Super Fan crown badge */}
        {isSuperFan && (
          <div className="absolute top-3 right-3 bg-[#E6C65B]/90 text-black text-xs font-bold px-3 py-1 rounded-full">
            ✨ Super Fan
          </div>
        )}
      </div>

      {/* ── Upsell banner for free users ─────────────────────────────────── */}
      {!isSuperFan && (
        <div className="w-full bg-gradient-to-r from-[#E6C65B]/10 to-[#B68D40]/10 border border-[#E6C65B]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Want a watermark-free image?</p>
            <p className="text-white/50 text-xs mt-0.5">
              Upgrade to <span className="text-[#E6C65B] font-semibold">Super Fan</span> membership
              to download clean, high-resolution photos instantly.
            </p>
          </div>
          <button
            onClick={() => navigate('/membership')}
            className="shrink-0 bg-[#E6C65B] hover:bg-[#B68D40] text-black font-bold text-sm px-5 py-2 rounded-xl transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 bg-[#E6C65B] hover:bg-[#B68D40] disabled:opacity-60 text-black font-bold py-3 rounded-xl transition-colors"
        >
          {downloading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Downloading…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {isSuperFan ? 'Download (HD Clean)' : 'Download'}
            </>
          )}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl border border-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share
        </button>

        {/* Try again */}
        <button
          onClick={onGenerateAnother}
          className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 font-semibold py-3 rounded-xl border border-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Try Another
        </button>
      </div>

      {/* Clipboard confirmation toast */}
      {shareMsg && (
        <p className="text-[#E6C65B] text-sm bg-[#E6C65B]/10 border border-[#E6C65B]/20 rounded-lg px-4 py-2">
          {shareMsg}
        </p>
      )}
    </div>
  );
};

export default GeneratedImageResult;
