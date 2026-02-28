import React, { useState } from 'react';
import { XCircle, X, AlertTriangle } from 'lucide-react';
import type { IContent } from '../../types/content';

interface RejectContentModalProps {
  content: IContent;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const RejectContentModal: React.FC<RejectContentModalProps> = ({
  content,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onConfirm(reason);
    setIsSubmitting(false);
  };

  const predefinedReasons = [
    'Content does not meet community guidelines',
    'Inappropriate or offensive content',
    'Poor quality or irrelevant content',
    'Copyright or trademark violation',
    'Spam or promotional content',
    'Contains personal or sensitive information',
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-tvk-dark-card border border-red-500/30 rounded-2xl max-w-2xl w-full shadow-2xl shadow-red-500/20 animate-fadeIn my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Reject Content</h2>
              <p className="text-sm text-gray-400">Provide a reason for rejection</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-grow">
          {/* Content Preview */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
              {content.file_url && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/40 flex-shrink-0">
                  {content.type === 'image' && (
                    <img
                      src={content.file_url}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {content.type === 'video' && (
                    <video
                      src={content.file_url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              <div className="flex-grow">
                <h3 className="text-white font-semibold mb-1">{content.title}</h3>
                {content.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{content.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Submitted by: {content.user?.nickname || content.user?.name || `User #${content.created_by}`}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {/* Warning */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-orange-300 font-medium mb-1">Important</p>
                <p className="text-xs text-orange-400/80">
                  The user will be notified about this rejection. Please provide a clear and constructive reason to help them improve their future submissions.
                </p>
              </div>
            </div>

            {/* Predefined Reasons */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select a reason (optional)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {predefinedReasons.map((preReason) => (
                  <button
                    key={preReason}
                    onClick={() => setReason(preReason)}
                    className={`text-left px-4 py-2.5 rounded-lg border transition-all text-sm ${
                      reason === preReason
                        ? 'bg-red-500/20 border-red-500/40 text-red-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {preReason}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Or provide a custom reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter a detailed reason for rejection..."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Providing a reason helps users understand what went wrong and how to improve.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-white/5 flex-shrink-0">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            {isSubmitting ? 'Rejecting...' : 'Reject Content'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectContentModal;
