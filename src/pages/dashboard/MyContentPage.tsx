import React, { useEffect, useState } from 'react';
import { contentService } from '../../services/contentService';
import type { IContent } from '../../types/content';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Image as ImageIcon, 
  Video, 
  FileText,
  AlertCircle,
  Calendar,
  RefreshCw,
  Upload,
  MessageSquare,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MyContentPage: React.FC = () => {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchMyContent();
    
    // Auto-refresh every 10 seconds to catch status updates from admin
    const interval = setInterval(fetchMyContent, 10000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const fetchMyContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const paginatedData = await contentService.getMyContent(currentPage);
      setContents(paginatedData.data || []);
      setTotalPages(paginatedData.last_page || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your content.');
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-300 text-xs font-medium rounded-full border border-red-500/30">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 text-orange-300 text-xs font-medium rounded-full border border-orange-500/30">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      default:
        // Backend doesn't return status field yet, show info badge
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/30">
            <AlertCircle className="w-3 h-3" />
            Status Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredContents = contents.filter((content) => {
    if (statusFilter === 'all') return true;
    // Treat undefined/null status as 'pending'
    const actualStatus = content.status || 'pending';
    return actualStatus === statusFilter;
  });

  const statusCounts = {
    all: contents.length,
    pending: contents.filter((c) => c.status === 'pending' || !c.status).length,
    approved: contents.filter((c) => c.status === 'approved').length,
    rejected: contents.filter((c) => c.status === 'rejected').length,
  };

  if (loading && contents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-tvk-accent-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your content...</p>
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
            onClick={fetchMyContent}
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif">My Content</h1>
          <p className="text-gray-400 mt-2">
            View and manage all your submitted content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMyContent}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/dashboard/feed"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-tvk-accent-gold-dark to-tvk-accent-gold hover:from-tvk-accent-gold hover:to-[#FFC43A] text-black rounded-lg font-bold shadow-lg shadow-gold/20 transition-all transform hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            Upload New Content
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-tvk-dark-card rounded-xl border border-white/10 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'all', label: 'All Content', icon: FileText },
            { key: 'pending', label: 'Pending', icon: Clock },
            { key: 'approved', label: 'Approved', icon: CheckCircle },
            { key: 'rejected', label: 'Rejected', icon: XCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key as any)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                statusFilter === key
                  ? 'bg-tvk-accent-gold text-black'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                statusFilter === key ? 'bg-black/20' : 'bg-white/10'
              }`}>
                {statusCounts[key as keyof typeof statusCounts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content List */}
      {filteredContents.length === 0 ? (
        <div className="bg-tvk-dark-card rounded-xl border border-white/10 p-12 text-center">
          <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Content Found</h3>
          <p className="text-gray-400 mb-6">
            {statusFilter === 'all' 
              ? "You haven't uploaded any content yet." 
              : `You don't have any ${statusFilter} content.`}
          </p>
          <Link
            to="/dashboard/feed"
            className="inline-flex items-center gap-2 px-6 py-3 bg-tvk-accent-gold hover:bg-tvk-accent-gold/90 text-black rounded-lg font-bold transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Your First Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content) => (
            <div
              key={content.id}
              className="bg-tvk-dark-card border border-white/10 rounded-xl overflow-hidden hover:border-tvk-accent-gold/30 transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-black/40">
                {content.file_url ? (
                  <>
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
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getTypeIcon(content.type)}
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(content.status)}
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-lg border border-white/20 flex items-center gap-1">
                    {getTypeIcon(content.type)}
                    {content.type}
                  </span>
                </div>
              </div>

              {/* Content Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                  {content.title}
                </h3>
                {content.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {content.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(content.created_at)}
                  </span>
                  {content.status === 'approved' && (
                    <>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {content.reactions_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {content.comments_count || 0}
                      </span>
                    </>
                  )}
                </div>

                {/* Rejection Reason */}
                {content.status === 'rejected' && content.rejection_reason && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-300 font-medium mb-1">Rejection Reason:</p>
                    <p className="text-xs text-red-400">{content.rejection_reason}</p>
                  </div>
                )}

                {/* Status Info */}
                {content.status === 'pending' && (
                  <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-xs text-orange-300">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Your content is being reviewed by our moderation team.
                    </p>
                  </div>
                )}
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
    </div>
  );
};

export default MyContentPage;
