import React, { useState } from 'react';
import { X, Facebook, MessageCircle, Twitter, Link2, CheckCircle2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle: string;
  postId: number;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, postTitle, postId }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/dashboard/feed?post=${postId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1E1E1E] border border-white/10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-bold">Share this post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <div className="bg-[#1877F2] p-3 rounded-full text-white group-hover:scale-110 transition shadow-lg shadow-blue-500/20">
                <Facebook size={24} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Facebook</span>
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                postTitle + ' ' + shareUrl
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <div className="bg-[#25D366] p-3 rounded-full text-white group-hover:scale-110 transition shadow-lg shadow-green-500/20">
                <MessageCircle size={24} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">WhatsApp</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl
              )}&text=${encodeURIComponent(postTitle)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <div className="bg-black p-3 rounded-full text-white group-hover:scale-110 transition shadow-lg shadow-white/5">
                <Twitter size={24} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">X (Twitter)</span>
            </a>
          </div>
          <div className="relative">
            <input
              readOnly
              value={shareUrl}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-[10px] text-gray-500 outline-none focus:border-gold/50 transition-colors"
            />
            <button
              onClick={copyToClipboard}
              className="absolute right-2 top-2 p-1.5 bg-white/5 hover:bg-gold hover:text-black rounded-lg text-gold transition-all"
            >
              {copied ? <CheckCircle2 size={18} /> : <Link2 size={18} />}
            </button>
          </div>
          {copied && (
            <p className="text-center text-gold text-[10px] mt-2 animate-pulse">
              Copied to clipboard!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
