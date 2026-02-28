import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';
import type { Story, StoryFeedFilter, StoryGenre, SortOption } from '../../types/story';
import { getStoryFeed } from '../../services/storyService';
import { getErrorMessage } from '../../utils/storyErrorHandling';
import { formatStoryDate, truncateContent, getStoryImageUrl } from '../../utils/storyUtils';

/**
 * Story Feed Component
 * 
 * Browse and discover stories with:
 * - Infinite scroll/pagination
 * - Genre filtering
 * - Sort options (recent, popular, trending, featured)
 * - Search
 * - Skeleton loaders
 */

const StoryFeed: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [selectedGenre, setSelectedGenre] = useState<StoryGenre | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch stories
  const fetchStories = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const filter: StoryFeedFilter = {
        genre: selectedGenre,
        sort_by: sortBy,
        search: debouncedSearch || undefined,
        page,
        limit: 10,
      };
      
      const response = await getStoryFeed(filter);
      
      // Robustly handle different API response structures
      let storiesData: Story[] = [];
      let paginationData: any = {};

      // Case 1: Nested { data: { stories: [] } } (Expected by type)
      if (response.data && 'stories' in response.data) {
        storiesData = response.data.stories;
        paginationData = response.data.pagination;
      }
      // Case 2: Flat { stories: [] }
      // @ts-ignore
      else if (response.stories) {
        // @ts-ignore
        storiesData = response.stories;
        // @ts-ignore
        paginationData = response.pagination;
      }
      // Case 3: Laravel Default Pagination { data: [] }
      // @ts-ignore
      else if (Array.isArray(response.data)) {
         // @ts-ignore
         storiesData = response.data;
         // Pagination usually at root or meta
         paginationData = response;
      }
      // Case 4: Deeply nested Laravel Resource { data: { data: [] } }
      // @ts-ignore
      else if (response.data && Array.isArray(response.data.data)) {
         // @ts-ignore
         storiesData = response.data.data;
         paginationData = response.data;
      }

      // Fallback
      storiesData = storiesData || [];
      
      if (append) {
        setStories(prev => [...prev, ...storiesData]);
      } else {
        setStories(storiesData);
      }
      
      // Handle pagination variations
      const hasMore = 
        paginationData?.has_more || 
        (paginationData?.next_page_url !== null && paginationData?.next_page_url !== undefined) || 
        (paginationData?.current_page < paginationData?.last_page);

      setHasMore(!!hasMore);
      setCurrentPage(page);
      
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedGenre, sortBy, debouncedSearch]);
  
  // Initial load and filter changes
  useEffect(() => {
    fetchStories(1, false);
  }, [fetchStories]);
  
  // Load more
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchStories(currentPage + 1, true);
    }
  };
  
  // Clear filters
  const clearFilters = () => {
    setSelectedGenre(undefined);
    setSortBy('recent');
    setSearchQuery('');
  };
  
  const genres: StoryGenre[] = [
    'adventure',
    'action',
    'romance',
    'sci-fi',
    'fantasy',
    'mystery',
    'horror',
    'comedy',
    'drama',
  ];
  
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Recent' },
    { value: 'popular', label: 'Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'featured', label: 'Featured' },
  ];
  
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-zentry tracking-wide text-white">
            STORY <span className="text-brand-gold">FEED</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover amazing AI-generated stories from the community. immerses yourself in infinite worlds created by fans.
          </p>
        </div>
      
        {/* Filters */}
        <div className="bg-brand-dark/50 border border-brand-gold/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories..."
              className="w-full px-5 py-3 bg-black/30 border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 text-white placeholder-gray-400 transition-all"
            />
          </div>
        
          {/* Genre & Sort */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Genre Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-wider">Genre</label>
              <select
                value={selectedGenre || ''}
                onChange={(e) => setSelectedGenre(e.target.value as StoryGenre || undefined)}
                className="w-full px-4 py-3 bg-black/30 border border-brand-gold/30 rounded-lg text-white focus:ring-2 focus:ring-brand-gold/50"
              >
                <option value="">ALL GENRES</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          
            {/* Sort */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-bold text-brand-gold mb-2 uppercase tracking-wider">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-3 bg-black/30 border border-brand-gold/30 rounded-lg text-white focus:ring-2 focus:ring-brand-gold/50"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        
          {/* Clear Filters */}
          {(selectedGenre || sortBy !== 'recent' || searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-gray-400 hover:text-brand-gold text-sm font-medium transition-colors flex items-center gap-1 mt-4"
            >
              <span>✕</span> Clear Filters
            </button>
          )}
        </div>
      
        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      
        {/* Stories Grid */}
        {!loading && (stories || []).length === 0 ? (
          <div className="text-center py-20 bg-brand-dark/50 rounded-xl border border-dashed border-gray-700">
            <p className="text-gray-400 text-xl">No stories found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(stories || []).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          
            {/* Skeleton Loaders */}
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
      
        {/* Load More */}
        {hasMore && !loading && stories.length > 0 && (
          <div className="text-center mt-12 mb-8">
            <button
              onClick={loadMore}
              className="px-10 py-4 bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-bold rounded-lg hover:opacity-90 transform shadow-lg hover:shadow-brand-gold/20 transition-all uppercase tracking-widest"
            >
              Load More Stories
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Story Card Component
const StoryCard: React.FC<{ story: Story }> = ({ story }) => {
  // Helpers
  const charAt = (str: string | undefined) => (str || '').charAt(0);
  // Support nested cover image object and legacy fields - PRIORITIZE signed URL
  const coverImageUrl = getStoryImageUrl(
    (story as any).cover_image_url ||           // Signed URL from backend (PRIORITY)
    (story as any).coverImage?.previewUrl || 
    (story as any).coverImage?.path || 
    story.cover_image || 
    (story as any).coverImage
  );
  const [imageError, setImageError] = useState(false);

  // Safe property extraction
  const userName = story.userName || story.user_name || 'Anonymous';
  const userAvatar = story.userAvatar || story.user_avatar;
  const likesCount = story.likes !== undefined ? story.likes : (story.likes_count || 0);

  return (
    <Link
      to={`/stories/${story.id}`}
      className="group bg-black/40 border border-gray-800 rounded-xl overflow-hidden hover:border-brand-gold/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-gold/10 flex flex-col h-full"
    >
      {/* Cover Image */}
      {coverImageUrl && !imageError ? (
        <div className="h-56 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-60" />
          <img
            src={coverImageUrl}
            alt={story.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          {/* Genre Badge */}
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-black/60 backdrop-blur-md border border-brand-gold/30 text-brand-gold px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
              {story.genre || 'Adventure'}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-56 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center border-b border-gray-800 relative group-hover:bg-gray-900 transition-colors">
          <span className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity">📖</span>
          <div className="absolute top-4 left-4">
            <span className="bg-black/60 backdrop-blur-md border border-brand-gold/30 text-brand-gold px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
              {story.genre || 'Adventure'}
            </span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
           {story.is_featured && (
            <span className="inline-block bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2">
              ⭐ Featured
            </span>
          )}
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors font-zentry tracking-wide">
            {story.title || 'Untitled'}
          </h3>
          
          {/* Excerpt */}
          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {truncateContent(story.content || '', 120)}
          </p>
        </div>
        
        <div className="mt-auto">
          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
              {story.mood || 'Epic'}
            </span>
          </div>
          
          <div className="h-px bg-gray-800 my-4" />
          
          {/* Stats & Author */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="text-red-500">❤️</span> {likesCount}</span>
              <span className="flex items-center gap-1"><span>👁️</span> {story.views || 0}</span>
            </div>
            <span>{formatStoryDate(story.created_at)}</span>
          </div>
          
          {/* Author */}
          <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center gap-2">
            {userAvatar ? (
               /* Ensure avatar is not a broken URL - simplistic check */
              <img
                src={userAvatar}
                alt={userName}
                className="w-6 h-6 rounded-full border border-gray-700 object-cover"
                onError={(e) => {
                   // Fallback on error
                   e.currentTarget.style.display = 'none';
                   e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`${userAvatar ? 'hidden' : 'block'} w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center`}>
                <span className="text-xs text-brand-gold font-bold">{charAt(userName)}</span>
            </div>
            <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">By {userName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Skeleton Loader
const SkeletonCard: React.FC = () => (
   <div className="bg-black/40 border border-gray-800 rounded-xl overflow-hidden h-96 animate-pulse">
    <div className="h-56 bg-gray-800/50" />
    <div className="p-6">
      <div className="h-6 bg-gray-800/50 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-800/50 rounded w-full mb-2" />
      <div className="h-4 bg-gray-800/50 rounded w-5/6 mb-2" />
      <div className="h-4 bg-gray-800/50 rounded w-full mb-6" />
      <div className="h-8 bg-gray-800/50 rounded w-1/3" />
    </div>
  </div>
);



export default StoryFeed;
