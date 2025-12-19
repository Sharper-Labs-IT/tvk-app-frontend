import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 👈 Needed for the Membership link
import type { IContent } from '../../types/content';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ShieldCheck,
  Download,
  FileText,
  Lock, // 👈 Added Lock icon
  Crown, // 👈 Added Crown icon
} from 'lucide-react';

interface PostCardProps {
  post: IContent;
  isPremiumUser: boolean; // 👈 We need to know if the user paid
}

const PostCard: React.FC<PostCardProps> = ({ post, isPremiumUser }) => {
  const [liked, setLiked] = useState(false);

  // 1. Determine if this specific post is locked for the current user
  const isLocked = Boolean(post.is_premium) && !isPremiumUser;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`bg-[#1E1E1E] rounded-xl border mb-6 overflow-hidden shadow-md transition-colors ${
        isLocked ? 'border-gold/30' : 'border-white/5 hover:border-gold/20'
      }`}
    >
      {/* 1. Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-goldDark to-gold flex items-center justify-center text-black font-bold border-2 border-white/10 shadow-lg">
            TVK
          </div>
          <div>
            <h4 className="text-white font-bold text-sm flex items-center gap-1">
              TVK Admin <ShieldCheck size={14} className="text-gold" />
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatDate(post.created_at)}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <span className="text-gold">{post.category.name}</span>
                </>
              )}
              {/* Premium Badge */}
              {Boolean(post.is_premium) && (
                <span className="bg-gold/20 text-gold px-1.5 py-0.5 rounded text-[10px] font-bold border border-gold/20 ml-2 flex items-center gap-1">
                  <Crown size={10} /> PREMIUM
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* 2. Post Body */}
      <div className="px-4 pb-3 relative">
        {/* Title is always visible */}
        {post.title && (
          <h3 className="text-white font-bold mb-2 text-lg leading-tight">{post.title}</h3>
        )}

        {/* Description: If locked, we blur it */}
        {post.description && (
          <div className={isLocked ? 'blur-sm select-none opacity-50' : ''}>
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
              {post.description}
            </p>
          </div>
        )}
      </div>

      {/* 3. Media Content area (Video/Image/File) */}
      <div className="w-full relative border-y border-white/5 flex justify-center bg-[#111] min-h-[250px]">
        {/* 🔒 LOCKED OVERLAY */}
        {isLocked ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-gold animate-pulse">
              <Lock size={32} />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Premium Content</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              This post is exclusive to our premium members. Upgrade your plan to unlock access.
            </p>
            <Link
              to="/membership"
              className="bg-gold hover:bg-goldDark text-black font-bold py-2.5 px-6 rounded-lg transition transform hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
            >
              Upgrade Plan
            </Link>
          </div>
        ) : (
          /* 🔓 UNLOCKED CONTENT */
          <>
            {post.file_url && (
              <>
                {post.type === 'image' && (
                  <img
                    src={post.file_url}
                    alt={post.title}
                    className="w-full h-auto max-h-[600px] object-cover"
                    loading="lazy"
                  />
                )}

                {post.type === 'video' && (
                  <video controls className="w-full max-h-[600px] bg-black">
                    <source src={post.file_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {post.type === 'file' && (
                  <div className="w-full p-8 flex flex-col items-center justify-center bg-[#252525]">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3 text-gold">
                      <FileText size={32} />
                    </div>
                    <p className="text-gray-400 mb-4 text-sm">Attachment available for download</p>
                    <a
                      href={post.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-gold hover:bg-goldDark text-black px-6 py-2 rounded-lg font-bold transition shadow-lg"
                    >
                      <Download size={18} />
                      Download File
                    </a>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* 4. Action Buttons */}
      <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-gray-400">
        <button
          onClick={() => !isLocked && setLiked(!liked)}
          disabled={isLocked}
          className={`flex items-center gap-2 text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-white/5 ${
            liked
              ? 'text-red-500'
              : isLocked
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:text-red-500'
          }`}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          Like
        </button>

        <button
          disabled={isLocked}
          className={`flex items-center gap-2 text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-white/5 ${
            isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-gold'
          }`}
        >
          <MessageCircle size={20} />
          Comment
        </button>

        <button
          disabled={isLocked}
          className={`flex items-center gap-2 text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-white/5 ${
            isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-400'
          }`}
        >
          <Share2 size={20} />
          Share
        </button>
      </div>
    </div>
  );
};

export default PostCard;
