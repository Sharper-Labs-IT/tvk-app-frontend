import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getStoryFeed } from '../services/storyService';
import type { Story, StoryGenre, StoryFeedFilter } from '../types/story';
import StoryCard from '../components/story/StoryCard';

const GENRES: StoryGenre[] = [
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

const StoryFeed = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StoryFeedFilter>({
    sort_by: 'recent',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStories();
  }, [filter, page]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const apiFilter: StoryFeedFilter = {
        ...filter,
        page,
        limit: 12,
        search: searchQuery || undefined
      };
      const response = await getStoryFeed(apiFilter);
      setStories(response.data.stories);
      setTotalPages(response.data.pagination.total_pages);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilter({ ...filter }); // Trigger effect
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans pb-20">
      <Header />
      
      {/* Hero Section / Header */}
      <div className="relative bg-brand-dark border-b border-gray-800 pt-16 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-gold/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-brand-goldDark/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
             <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-brand-gold/10 to-transparent border border-brand-gold/20 text-brand-gold mb-8 animate-fade-in-up backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
              <span className="text-sm font-bold tracking-widest uppercase font-zentry">AI-Powered Storytelling</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-8 uppercase font-zentry leading-none drop-shadow-2xl">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFE587] via-brand-gold to-[#B8860B]">Epic Tales</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto font-light">
              Dive into a universe of <span className="text-white font-medium">AI-generated masterpieces</span>. 
              Adventure, mystery, and endless imagination await.
            </p>
          </div>

          {/* Search & Main Filters Bar */}
          <div className="max-w-4xl mx-auto bg-tvk-dark-card border border-gray-800 rounded-2xl p-4 shadow-xl shadow-black/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Search Input */}
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500 group-focus-within:text-brand-gold transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search stories by title or author..."
                  className="block w-full pl-11 pr-4 py-3 bg-[#111111] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                />
              </div>

              {/* Sort Options */}
              <div className="flex bg-[#111111] rounded-xl p-1 border border-gray-700 overflow-x-auto no-scrollbar">
                {(['recent', 'popular', 'trending'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setFilter({ ...filter, sort_by: option })}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                      filter.sort_by === option
                        ? 'bg-brand-gold text-brand-dark shadow-md'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Genre Filter Scroller */}
      <div className="border-b border-gray-800 bg-[#111111] sticky top-[0px] z-[50] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 pr-4 text-gray-400 text-sm font-medium uppercase tracking-wider whitespace-nowrap">
              <Filter className="w-4 h-4" /> Filter by:
            </div>
            
            <button
              onClick={() => setFilter({ ...filter, genre: undefined })}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                !filter.genre
                  ? 'bg-brand-gold/10 border-brand-gold text-brand-gold'
                  : 'bg-[#222222] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
              }`}
            >
              All Genres
            </button>
            
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setFilter({ ...filter, genre })}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                  filter.genre === genre
                  ? 'bg-brand-gold/10 border-brand-gold text-brand-gold'
                  : 'bg-[#222222] border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                }`}
              >
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-800 border-t-brand-gold rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
              </div>
            </div>
            <p className="mt-6 text-gray-400 font-medium animate-pulse">Loading amazing stories...</p>
          </div>
        ) : stories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} onUpdate={loadStories} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-16">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-tvk-dark-card border border-white/5 text-gray-300 rounded-xl hover:bg-brand-dark hover:border-brand-gold/50 hover:text-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2 px-4">
                  <span className="text-brand-gold font-bold text-lg">{page}</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-gray-500 text-lg">{totalPages}</span>
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-3 bg-tvk-dark-card border border-white/5 text-gray-300 rounded-xl hover:bg-brand-dark hover:border-brand-gold/50 hover:text-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-tvk-dark-card rounded-3xl border border-white/5">
            <div className="bg-brand-dark w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <BookOpen className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-200 mb-3">
              No stories found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              We couldn't find any stories matching your criteria. Try adjusting your filters or search for something else.
            </p>
            <button 
              onClick={() => {
                setFilter({ sort_by: 'recent' });
                setSearchQuery('');
              }}
              className="px-8 py-3 bg-brand-gold text-brand-dark rounded-xl font-bold hover:bg-brand-goldDark transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default StoryFeed;
