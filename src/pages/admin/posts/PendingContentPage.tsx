import React, { useEffect, useState } from 'react';
import { contentService } from '../../../services/contentService';
import type { IContent } from '../../../types/content';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Image as ImageIcon, 
  Video, 
  FileText,
  AlertCircle,
  User,
  Calendar,
  RefreshCw
} from 'lucide-react';
import RejectContentModal from '../../../components/admin/RejectContentModal';
import ContentPreviewModal from '../../../components/admin/ContentPreviewModal';

const PendingContentPage: React.FC = () => {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<IContent | null>(null);

  // Processing states
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingContents();
  }, [currentPage]);

  const fetchPendingContents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const paginatedData = await contentService.getPending(currentPage);
      
      // Handle different response structures - getPending returns the pagination object directly
      if (paginatedData && typeof paginatedData === 'object' && 'data' in paginatedData) {
        const contentsList = paginatedData.data || [];
        setContents(contentsList);
        setTotalPages(paginatedData.last_page || 1);
        setTotalItems(paginatedData.total || 0);
      } else {
        setContents([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err: any) {
      let errorMessage = 'Failed to load pending contents.';
      
      // More detailed error messages
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view pending content.';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check backend configuration.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this content?')) return;

    try {
      setProcessingId(id);
      const result = await contentService.approve(id);
      setContents(contents.filter((c) => c.id !== id));
      setTotalItems((prev) => prev - 1);
      alert('Content approved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve content.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (content: IContent) => {
    setSelectedContent(content);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedContent) return;

    try {
      setProcessingId(selectedContent.id);
      const result = await contentService.reject(selectedContent.id, { reason });
      setContents(contents.filter((c) => c.id !== selectedContent.id));
      setTotalItems((prev) => prev - 1);
      setRejectModalOpen(false);
      setSelectedContent(null);
      alert('Content rejected successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject content.');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePreview = (content: IContent) => {
    setSelectedContent(content);
    setPreviewModalOpen(true);
  };

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && contents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-tvk-accent-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading pending content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchPendingContents}
            className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif flex items-center gap-3">
            <Clock className="w-8 h-8 text-tvk-accent-gold" />
            Pending Content Review
          </h1>
          <p className="text-gray-400 mt-2">
            Review and moderate user-submitted content before it goes live
          </p>
        </div>
        <button
          onClick={fetchPendingContents}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-400" />
            <div>
              <p className="text-sm text-orange-300/70">Pending Review</p>
              <p className="text-2xl font-bold text-orange-300">{totalItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content List */}
      {contents.length === 0 ? (
        <div className="bg-tvk-dark-card rounded-xl border border-white/10 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
          <p className="text-gray-400">No pending content to review at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contents.map((content) => (
            <div
              key={content.id}
              className="bg-tvk-dark-card border border-white/10 rounded-xl p-6 hover:border-tvk-accent-gold/30 transition-all group"
            >
              <div className="flex items-start gap-6">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {content.file_url ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-black/40 border border-white/10">
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
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {getTypeIcon(content.type)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      {getTypeIcon(content.type)}
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                        {content.title}
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30">
                          Pending
                        </span>
                      </h3>
                      {content.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {content.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {content.user?.nickname || content.user?.name || `User #${content.created_by}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(content.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(content.type)}
                          {content.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={() => handlePreview(content)}
                    disabled={processingId === content.id}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/20 transition-all text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleApprove(content.id)}
                    disabled={processingId === content.id}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-300 rounded-lg border border-green-500/20 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processingId === content.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleRejectClick(content)}
                    disabled={processingId === content.id}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg border border-red-500/20 transition-all text-sm font-medium disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {rejectModalOpen && selectedContent && (
        <RejectContentModal
          content={selectedContent}
          onConfirm={handleRejectConfirm}
          onCancel={() => {
            setRejectModalOpen(false);
            setSelectedContent(null);
          }}
        />
      )}

      {previewModalOpen && selectedContent && (
        <ContentPreviewModal
          content={selectedContent}
          onClose={() => {
            setPreviewModalOpen(false);
            setSelectedContent(null);
          }}
          onApprove={() => {
            handleApprove(selectedContent.id);
            setPreviewModalOpen(false);
          }}
          onReject={() => {
            setPreviewModalOpen(false);
            handleRejectClick(selectedContent);
          }}
        />
      )}
    </div>
  );
};

export default PendingContentPage;
