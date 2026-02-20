import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, TrendingUp, Star, Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getUserStories, getFeaturedStories, getUserStoryStats } from '../services/storyService';
import type { Story, StoryStats } from '../types/story';
import StoryCard from '../components/story/StoryCard';
import StoryStatsCard from '../components/story/StoryStatsCard';
import { useAuth } from '../context/AuthContext';

/**
 * Story Studio - Main hub for AI story creation
 */
const StoryStudio = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-stories' | 'featured'>('my-stories');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storiesData, featuredData, statsData] = await Promise.all([
        getUserStories(),
        getFeaturedStories(),
        getUserStoryStats(),
      ]);
      setMyStories(storiesData);
      setFeaturedStories(featuredData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load story data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark">
      <Header />
      {/* Page Content */}
      <div className="bg-[#07091a]/95 backdrop-blur-lg border-b border-brand-gold/20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <span className="bg-gradient-to-r from-brand-gold via-[#fff5c2] to-brand-gold bg-clip-text text-transparent">
                  AI Story Studio
                </span>
              </h1>
              <p className="mt-2 text-gray-400">
                Create epic stories featuring your character with AI
              </p>
            </div>
            <button
              onClick={() => navigate('/story-studio/create')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark rounded-xl font-bold hover:shadow-[0_0_30px_rgba(230,198,91,0.5)] transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Story
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StoryStatsCard
              icon={BookOpen}
              label="Total Stories"
              value={stats.total_stories}
              color="gold"
            />
            <StoryStatsCard
              icon={TrendingUp}
              label="Total Views"
              value={stats.total_views}
              color="gold"
            />
            <StoryStatsCard
              icon={Star}
              label="Total Likes"
              value={stats.total_likes}
              color="gold"
            />
            <StoryStatsCard
              icon={Sparkles}
              label="This Month"
              value={stats.stories_this_month}
              color="gold"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('my-stories')}
            className={`px-6 py-4 font-bold transition-all duration-300 relative text-left sm:text-center ${
              activeTab === 'my-stories'
                ? 'text-brand-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Stories ({myStories.length})
            {activeTab === 'my-stories' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-goldDark via-brand-gold to-brand-goldDark" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-6 py-4 font-bold transition-all duration-300 relative ${
              activeTab === 'featured'
                ? 'text-brand-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Featured Stories
            {activeTab === 'featured' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-goldDark via-brand-gold to-brand-goldDark" />
            )}
          </button>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-gold border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'my-stories' ? (
              myStories.length > 0 ? (
                myStories.map((story) => (
                  <StoryCard key={story.id} story={story} onUpdate={loadData} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-[#1E1E1E]/50 rounded-2xl border border-gray-800">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    No stories yet
                  </h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    Create your first AI-generated story featuring {user?.nickname || 'VJ'}
                  </p>
                  <button
                    onClick={() => navigate('/story-studio/create')}
                    className="px-8 py-4 bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark rounded-xl font-bold hover:shadow-[0_0_30px_rgba(230,198,91,0.5)] transition-all duration-300 transform hover:scale-105"
                  >
                    Create First Story
                  </button>
                </div>
              )
            ) : (
              featuredStories.map((story) => (
                <StoryCard key={story.id} story={story} onUpdate={loadData} />
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default StoryStudio;
