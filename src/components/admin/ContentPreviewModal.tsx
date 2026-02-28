import React from 'react';
import { X, CheckCircle, XCircle, Image as ImageIcon, Video, FileText, Calendar, User } from 'lucide-react';
import type { IContent } from '../../types/content';

interface ContentPreviewModalProps {
  content: IContent;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const ContentPreviewModal: React.FC<ContentPreviewModalProps> = ({
  content,
  onClose,
  onApprove,
  onReject,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-400" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-tvk-dark-card border border-white/10 rounded-2xl max-w-4xl w-full shadow-2xl animate-fadeIn my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-tvk-accent-gold/20 rounded-xl flex items-center justify-center border border-tvk-accent-gold/30">
              {getTypeIcon(content.type)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Content Preview</h2>
              <p className="text-sm text-gray-400">Review content before approval</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Media Preview */}
          {content.file_url && (
            <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/10">
              {content.type === 'image' && (
                <img
                  src={content.file_url}
                  alt={content.title}
                  className="w-full max-h-[500px] object-contain mx-auto"
                />
              )}
              {content.type === 'video' && (
                <video
                  src={content.file_url}
                  controls
                  className="w-full max-h-[500px] object-contain mx-auto"
                />
              )}
            </div>
          )}

          {/* Content Details */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                Title
              </label>
              <h3 className="text-2xl font-bold text-white">{content.title}</h3>
            </div>

            {content.description && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                  Description
                </label>
                <p className="text-gray-300 leading-relaxed">{content.description}</p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Type</label>
                <div className="flex items-center gap-2 text-white">
                  {getTypeIcon(content.type)}
                  <span className="capitalize">{content.type}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Category</label>
                <p className="text-white">{content.category?.name || 'Uncategorized'}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Submitted By</label>
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span>{content.user?.name || `User #${content.created_by}`}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Submitted On</label>
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(content.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Premium Badge */}
            {content.is_premium && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-tvk-accent-gold-dark to-tvk-accent-gold text-black rounded-lg font-semibold">
                <span className="text-sm">Premium Content</span>
              </div>
            )}
          </div>

          {/* Moderation Guidelines */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Moderation Guidelines</h4>
            <ul className="text-xs text-blue-400/80 space-y-1">
              <li>• Ensure content is appropriate and follows community guidelines</li>
              <li>• Check for copyright violations or unauthorized use</li>
              <li>• Verify content quality and relevance to Thalapathy VJ</li>
              <li>• Look for spam, promotional, or misleading content</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
          >
            Close
          </button>
          <button
            onClick={onReject}
            className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-medium transition-all border border-red-500/30 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={onApprove}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentPreviewModal;
