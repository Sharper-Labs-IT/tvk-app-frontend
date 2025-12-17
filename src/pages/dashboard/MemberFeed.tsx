import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
// 👇 FIXED: Added 'type' keyword here
import type { IContent, IContentResponse } from '../../types/content';
import CreatePostWidget from '../../components/dashboard/CreatePostWidget';
import PostCard from '../../components/dashboard/PostCard';
import { Loader as LoaderIcon, AlertCircle, RefreshCw } from 'lucide-react';

const MemberFeed: React.FC = () => {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call your backend endpoint
      const response = await api.get<IContentResponse>('/v1/contents');

      // Access the nested pagination data: response.data.contents.data
      if (response.data?.contents?.data) {
        setContents(response.data.contents.data);
      } else {
        setContents([]);
      }
    } catch (err) {
      setError('Failed to load feed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-zentry tracking-wide">
            Community Feed
          </h1>
          <p className="text-gray-400 text-sm">Latest updates from the TVK Team.</p>
        </div>
        <button
          onClick={fetchFeed}
          className="p-2 bg-white/5 hover:bg-gold hover:text-black text-gray-400 rounded-full transition"
          title="Refresh Feed"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Create Post Widget */}
      <CreatePostWidget />

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
      {loading && contents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <LoaderIcon className="animate-spin text-gold mb-4" size={40} />
          <p className="text-gray-500 animate-pulse">Loading updates...</p>
        </div>
      )}

      {/* Feed List */}
      <div className="space-y-6">
        {contents.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Empty State */}
      {!loading && !error && contents.length === 0 && (
        <div className="text-center py-16 bg-[#1E1E1E] rounded-xl border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
            <RefreshCw size={30} />
          </div>
          <h3 className="text-white font-bold mb-2">No Posts Yet</h3>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Check back later for exclusive updates, videos, and news from TVK.
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberFeed;
