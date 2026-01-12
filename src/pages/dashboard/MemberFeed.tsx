import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import type { IContent, IContentResponse } from '../../types/content';
import CreatePostWidget from '../../components/dashboard/CreatePostWidget';
import PostCard from '../../components/dashboard/PostCard';
import { Loader as LoaderIcon, AlertCircle, RefreshCw, X, Clock, CheckCircle } from 'lucide-react';

const MemberFeed: React.FC = () => {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [myPendingCount, setMyPendingCount] = useState(0);

  // Initialize Search Params for Filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    fetchFeed();
    checkUserStatus();
    fetchMyPendingCount();
    
    // Auto-refresh pending count every 10 seconds
    const interval = setInterval(fetchMyPendingCount, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]); // Re-run when the URL category change

  const checkUserStatus = async () => {
    try {
      const response = await api.get('/v1/auth/me');
      const userData = response.data.user;

      // Logic: Plan ID 1 is usually "Free", anything else is Premium
      if (userData && userData.membership && Number(userData.membership.plan_id) !== 1) {
        setIsPremiumUser(true);
      } else {
        setIsPremiumUser(false);
      }
    } catch (err) {
      setIsPremiumUser(false);
    }
  };

  const fetchMyPendingCount = async () => {
    try {
      const response = await api.get('/v1/contents/my-content?page=1');
      if (response.data?.contents?.data) {
        const pendingPosts = response.data.contents.data.filter(
          (post: any) => {
            // Backend uses approval_status field
            const status = post.approval_status || post.status;
            return status === 'pending' || !status;
          }
        );
        setMyPendingCount(pendingPosts.length);
      }
    } catch (err) {
      // Silently fail - this is not critical
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      setContents([]); // Clear list for better UX while loading

      let response;

      // Logic: If category ID exists in URL, use the Filter Endpoint
      if (categoryFilter) {
        response = await api.get<IContentResponse>(`/v1/contents/filter`, {
          params: { category_id: categoryFilter },
        });
      } else {
        // Normal fetch for all community posts
        response = await api.get<IContentResponse>('/v1/contents');
      }

      if (response.data?.contents?.data) {
        // Filter to show only approved content (backend should handle this, but add client-side filtering as safety)
        const approvedContent = response.data.contents.data.filter(
          (post) => post.status === 'approved' || !post.status // Show posts without status for backward compatibility
        );
        setContents(approvedContent);
      } else {
        setContents([]);
      }
    } catch (err) {
      setError('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setSearchParams({}); // Removes the ?category=X from URL
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-zentry tracking-wide">
            {categoryFilter ? 'Filtered Posts' : 'Community Feed'}
          </h1>
          <p className="text-gray-400 text-sm">
            {categoryFilter
              ? 'Showing specific category results'
              : 'Latest updates from the TVK Team.'}
          </p>
        </div>
        <div className="flex gap-2">
          {categoryFilter && (
            <button
              onClick={clearFilter}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full text-xs font-bold transition"
            >
              <X size={16} /> Clear Filter
            </button>
          )}
          <button
            onClick={fetchFeed}
            className="p-2 bg-white/5 hover:bg-gold hover:text-black text-gray-400 rounded-full transition"
            title="Refresh Feed"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Widget to Create Posts */}
      <CreatePostWidget onPostCreated={() => {
        fetchFeed();
        fetchMyPendingCount();
      }} isPremiumUser={isPremiumUser} />

      {/* Pending Content Notification */}
      {myPendingCount > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-orange-500/30">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-orange-300 font-bold text-sm">
                {myPendingCount} Post{myPendingCount > 1 ? 's' : ''} Pending Review
              </h3>
            </div>
            <p className="text-orange-400/80 text-sm mb-3">
              Your content is being reviewed by our moderation team. You'll be notified once it's approved.
            </p>
            <Link
              to="/dashboard/my-content"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-sm font-medium transition-all border border-orange-500/30"
            >
              <CheckCircle className="w-4 h-4" />
              View My Content
            </Link>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
          <AlertCircle size={24} />
          <div className="flex-1">
            <p className="font-bold text-sm">Error</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
          <button onClick={fetchFeed} className="text-sm underline hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <LoaderIcon className="animate-spin text-gold mb-4" size={40} />
          <p className="text-gray-500 animate-pulse">Loading updates...</p>
        </div>
      )}

      {/* The Feed */}
      {!loading && (
        <div className="space-y-6">
          {contents.length > 0 ? (
            contents.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isPremiumUser={isPremiumUser}
                onPostDeleted={fetchFeed} // Refreshes list after a successful delete
              />
            ))
          ) : (
            /* Empty State when no posts match */
            <div className="text-center py-16 bg-[#1E1E1E] rounded-xl border border-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                <RefreshCw size={30} />
              </div>
              <h3 className="text-white font-bold mb-2">No Posts Found</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                {categoryFilter
                  ? 'No posts found in this category.'
                  : 'Check back later for updates.'}
              </p>
              {categoryFilter && (
                <button onClick={clearFilter} className="mt-4 text-gold text-sm underline">
                  View All Posts
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberFeed;
