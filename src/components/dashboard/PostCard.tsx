import React, { useState } from 'react';
// 👇 Ensure this matches your actual type file path
import type { IContent } from '../../types/content';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ShieldCheck,
  Download,
  FileText,
} from 'lucide-react';

interface PostCardProps {
  post: IContent;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);

  // Helper to format time relative to now
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-[#1E1E1E] rounded-xl border border-white/5 mb-6 overflow-hidden shadow-md hover:border-gold/20 transition-colors">
      {/* 1. Post Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Admin Avatar */}
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
                <span className="bg-gold/20 text-gold px-1.5 py-0.5 rounded text-[10px] font-bold border border-gold/20 ml-2">
                  PREMIUM
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* 2. Post Body (Title & Text) */}
      <div className="px-4 pb-3">
        {post.title && (
          <h3 className="text-white font-bold mb-2 text-lg leading-tight">{post.title}</h3>
        )}
        {post.description && (
          <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
            {post.description}
          </p>
        )}
      </div>

      {/* 3. Media Content (FIXED FOR SIZING) */}
      {post.file_url && (
        // 👇 Removed 'bg-black' to avoid black bars.
        // 👇 Added 'flex justify-center' to center content.
        <div className="w-full relative border-y border-white/5 flex justify-center bg-[#111]">
          {/* CASE: IMAGE */}
          {post.type === 'image' && (
            <img
              src={post.file_url}
              alt={post.title}
              // 👇 FIXED CSS:
              // w-full: Always take full width
              // h-auto: Adjust height automatically to maintain aspect ratio
              // max-h-[600px]: Don't let it get too tall (scrolling issue)
              // object-cover: If it hits max-height, crop it cleanly instead of squashing/letterboxing
              className="w-full h-auto max-h-[600px] object-cover"
              loading="lazy"
            />
          )}

          {/* CASE: VIDEO */}
          {post.type === 'video' && (
            <video
              controls
              // Videos behave better with max-height to prevent layout shifts
              className="w-full max-h-[600px] bg-black"
            >
              <source src={post.file_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          {/* CASE: FILE / ATTACHMENT */}
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
        </div>
      )}

      {/* 4. Action Buttons (Like/Comment/Share) */}
      <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between text-gray-400">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors px-2 py-1 rounded hover:bg-white/5 ${
            liked ? 'text-red-500' : 'hover:text-red-500'
          }`}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          Like
        </button>

        <button className="flex items-center gap-2 text-sm font-medium hover:text-gold transition-colors px-2 py-1 rounded hover:bg-white/5">
          <MessageCircle size={20} />
          Comment
        </button>

        <button className="flex items-center gap-2 text-sm font-medium hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-white/5">
          <Share2 size={20} />
          Share
        </button>
      </div>
    </div>
  );
};

export default PostCard;
