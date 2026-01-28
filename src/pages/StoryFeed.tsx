import { useState, useEffect } from 'react';
import { Sparkles, Search, Filter, BookOpen } from 'lucide-react';
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
    sortBy: 'recent',
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
      const data = await getStoryFeed(filter, page, 12);
      setStories(data.stories);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilter({ ...filter, searchQuery });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-100 font-sans pb-20">
      <Header />
      
      {/* Hero Section / Header */}
      <div className="relative bg-[#1A1A1A] border-b border-gray-800 pt-12 pb-12 sm:pt-16 sm:pb-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-2/3 bg-brand-goldDark/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold mb-6 animate-fade-in-up">
              <span className="text-sm font-medium tracking-wide uppercase">AI-Powered Storytelling</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 uppercase">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-400 to-brand-goldDark">Epic Tales</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-8">
              Explore a universe of AI-generated stories created by the TVK community. 
              Step into worlds of adventure, mystery, and endless imagination.
            </p>
          </div>

          {/* Search & Main Filters Bar */}
          <div className="max-w-4xl mx-auto bg-[#222222] border border-gray-700 rounded-2xl p-4 shadow-xl shadow-black/50 backdrop-blur-sm">
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
                  className="block w-full pl-11 pr-4 py-3 bg-[#111111] border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                />
              </div>

              {/* Sort Options */}
              <div className="flex bg-[#111111] rounded-xl p-1 border border-gray-700 overflow-x-auto no-scrollbar">
                {(['recent', 'popular', 'trending'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setFilter({ ...filter, sortBy: option })}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                      filter.sortBy === option
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
                <Sparkles className="w-6 h-6 text-brand-gold animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-gray-400 font-medium animate-pulse">Loading amazing stories...</p>
          </div>
        ) : stories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <StoryCard key={story._id} story={story} onUpdate={loadStories} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-[#222222] border border-gray-700 text-gray-300 rounded-xl hover:bg-[#333333] hover:border-gray-600 hover:text-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
                  className="px-6 py-3 bg-[#222222] border border-gray-700 text-gray-300 rounded-xl hover:bg-[#333333] hover:border-gray-600 hover:text-brand-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-[#1A1A1A] rounded-3xl border border-gray-800">
            <div className="bg-[#222222] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
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
                setFilter({ sortBy: 'recent' });
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
