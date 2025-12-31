import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // 1. Import this
import api from '../../utils/api';
import type { IContent, IContentResponse } from '../../types/content';
import CreatePostWidget from '../../components/dashboard/CreatePostWidget';
import PostCard from '../../components/dashboard/PostCard';
import { Loader as LoaderIcon, AlertCircle, RefreshCw, X } from 'lucide-react';

const MemberFeed: React.FC = () => {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // 2. Init Search Params
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    fetchFeed();
    checkUserStatus();
  }, [categoryFilter]); // 3. Re-run when URL changes

  const checkUserStatus = async () => {
    try {
      const response = await api.get('/v1/auth/me');
      const userData = response.data.user;
      if (userData && userData.membership && Number(userData.membership.plan_id) !== 1) {
        setIsPremiumUser(true);
      } else {
        setIsPremiumUser(false);
      }
    } catch (err) {
      setIsPremiumUser(false);
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      setContents([]); // Clear previous list immediately

      let response;

      // 4. Logic: If category ID exists in URL, use Filter Endpoint
      if (categoryFilter) {
        // Using the route: Route::get('contents/filter', ...)
        response = await api.get<IContentResponse>(`/v1/contents/filter`, {
          params: { category_id: categoryFilter },
        });
      } else {
        // Normal fetch
        response = await api.get<IContentResponse>('/v1/contents');
      }

      if (response.data?.contents?.data) {
        setContents(response.data.contents.data);
      } else {
        setContents([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setSearchParams({}); // Remove query params to show all
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
          {/* Show Clear Filter button if category is active */}
          {categoryFilter && (
            <button
              onClick={clearFilter}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full text-xs font-bold transition"
            >
              <X size={16} /> Clear
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

      <CreatePostWidget onPostCreated={fetchFeed} isPremiumUser={isPremiumUser} />

      {/* Error State */}
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

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <LoaderIcon className="animate-spin text-gold mb-4" size={40} />
          <p className="text-gray-500 animate-pulse">Loading updates...</p>
        </div>
      )}

      {/* Feed List */}
      {!loading && (
        <div className="space-y-6">
          {contents.length > 0 ? (
            contents.map((post) => (
              <PostCard key={post.id} post={post} isPremiumUser={isPremiumUser} />
            ))
          ) : (
            /* Empty State */
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
