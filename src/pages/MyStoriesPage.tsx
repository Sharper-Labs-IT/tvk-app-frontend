import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import type { Story, StoryStats } from '../types/story';
import { getUserStories, deleteStory, getUserStoryStats } from '../services/storyService';
import { getErrorMessage } from '../utils/storyErrorHandling';
import { formatStoryDate, truncateContent, getStoryImageUrl } from '../utils/storyUtils';

/**
 * My Stories Page
 * 
 * User's personal story dashboard:
 * - List of user's stories (drafts + published)
 * - Story statistics
 * - Quick actions (edit, delete, view)
 * - Generation quota display
 */

const MyStoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [storiesData, statsData] = await Promise.all([
          getUserStories(),
          getUserStoryStats(),
        ]);
        
        setStories(storiesData || []);
        setStats(statsData);
        
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle delete
  const handleDelete = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteStory(storyId);
      setStories(stories.filter(s => s.id !== storyId));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          total_stories: stats.total_stories - 1,
        });
      }
    } catch (err) {
      alert('Failed to delete story: ' + getErrorMessage(err));
    }
  };
  
  // Filter stories
  const filteredStories = (stories || []).filter(story => {
    if (filter === 'all') return true;
    return story.status === filter;
  });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg" />
              ))}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-gray-800 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-zentry tracking-wide">
            MY <span className="text-brand-gold">CHRONICLES</span>
          </h1>
          <p className="text-gray-400">Manage your AI-generated story collection</p>
        </div>
        <Link
          to="/ai-studio/stories/create"
          className="px-8 py-3 bg-brand-gold text-brand-dark font-bold rounded hover:bg-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
        >
         Create New Story
        </Link>
      </div>
      
      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 text-center">
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      )}
      
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <StatCard
            icon="📚"
            label="Total Stories"
            value={stats.total_stories}
            gradient="from-blue-600/20 to-blue-900/20"
            borderColor="border-blue-500/30"
            textColor="text-blue-400"
          />
          <StatCard
            icon="❤️"
            label="Total Likes"
            value={stats.total_likes}
             gradient="from-red-600/20 to-red-900/20"
            borderColor="border-red-500/30"
            textColor="text-red-400"
          />
          <StatCard
            icon="👁️"
            label="Total Views"
            value={stats.total_views}
             gradient="from-purple-600/20 to-purple-900/20"
            borderColor="border-purple-500/30"
            textColor="text-purple-400"
          />
          
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-tvk-dark-card border border-gray-800 rounded-xl p-4 mb-8 flex flex-wrap gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
            filter === 'all'
              ? 'bg-brand-gold text-brand-dark shadow-[0_0_15px_rgba(230,198,91,0.3)]'
              : 'bg-black/30 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          All ({stories.length})
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
            filter === 'published'
              ? 'bg-brand-gold text-brand-dark shadow-[0_0_15px_rgba(230,198,91,0.3)]'
              : 'bg-black/30 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Published ({stories.filter(s => s.status === 'published').length})
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
            filter === 'draft'
              ? 'bg-brand-gold text-brand-dark shadow-[0_0_15px_rgba(230,198,91,0.3)]'
              : 'bg-black/30 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Drafts ({stories.filter(s => s.status === 'draft').length})
        </button>
      </div>
      
      {/* Stories List */}
      {filteredStories.length === 0 ? (
        <div className="bg-tvk-dark-card border border-gray-800 rounded-xl p-16 text-center">
          <div className="text-6xl mb-6 opacity-50 grayscale">📖</div>
          <h3 className="text-3xl font-zentry text-white mb-4">
            {filter === 'all' ? 'THE LIBRARY IS EMPTY' : `NO ${filter.toUpperCase()} STORIES FOUND`}
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {filter === 'all'
              ? 'Your journey has not yet begun. Use the AI Story Studio to create your first masterpiece.'
              : `You don't have any ${filter} stories in your collection yet.`}
          </p>
          {filter === 'all' && (
            <Link
              to="/ai-studio/stories/create"
              className="inline-block px-8 py-3 bg-brand-gold text-brand-dark font-bold rounded hover:bg-white transition-colors uppercase tracking-wider"
            >
              Create Your First Story
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  gradient: string;
  borderColor: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, gradient, borderColor, textColor }) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} border ${borderColor} rounded-xl p-6 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-3xl">{icon}</div>
        <div className={`text-3xl font-zentry ${textColor}`}>{value}</div>
      </div>
      <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
};

// Story Card Component
interface StoryCardProps {
  story: Story;
  onDelete: (id: string) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Support nested cover image object and legacy fields - PRIORITIZE signed URL
  const coverImageUrl = getStoryImageUrl(
    (story as any).cover_image_url ||           // Signed URL from backend (PRIORITY)
    (story as any).coverImage?.previewUrl || 
    (story as any).coverImage?.path || 
    story.cover_image || 
    (story as any).coverImage
  );

  return (
    <div className="bg-tvk-dark-card border border-gray-800 rounded-xl overflow-hidden hover:border-brand-gold/30 hover:shadow-[0_0_20px_rgba(230,198,91,0.1)] transition-all duration-300 group flex flex-col h-full">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden bg-gray-900 border-b border-gray-800">
        {coverImageUrl && !imageError ? (
          <img
            src={coverImageUrl}
            alt={story.title || 'Story Cover'}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                 <span className="text-6xl opacity-20 filter grayscale">📖</span>
            </div>
        )}
        
        {/* Status Badge */}
         <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
            story.status === 'published'
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
          }`}>
            {story.status === 'published' ? 'Published' : 'Draft'}
          </span>
         </div>

        {/* Menu */}
         <div className="absolute top-4 right-4 z-10">
            <div className="relative">
                <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-brand-gold hover:text-black transition-colors"
                >
                ⋮
                </button>
                {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                    <Link
                    to={`/stories/${story.id}`}
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
                    onClick={() => setShowMenu(false)}
                    >
                    👁️ View Story
                    </Link>
                    <Link
                    to={`/stories/${story.id}/edit`}
                     className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white text-sm"
                     onClick={() => setShowMenu(false)}
                    >
                    ✏️ Edit Details
                    </Link>
                    <button
                    onClick={() => {
                        onDelete(story.id);
                        setShowMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/20 text-sm border-t border-gray-800"
                    >
                    🗑️ Delete Story
                    </button>
                </div>
                )}
            </div>
         </div>
         
         {/* Gradient Overlay */}
         <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-tvk-dark-card to-transparent" />
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow relative">
        
        {/* Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
            {story.genre || 'Adventure'}
          </span>
          <span className="bg-white/10 text-gray-300 border border-white/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
            {story.mood || 'Epic'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 font-zentry leading-tight group-hover:text-brand-gold transition-colors line-clamp-2">
          {story.title || 'Untitled Story'}
        </h3>
        
        {/* Excerpt */}
        <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
          {truncateContent(story.content || '', 120)}
        </p>
        
        {/* Footer Stats */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-3">
                 <span className="flex items-center gap-1"><span className="text-red-500">❤️</span> {story.likes_count || 0}</span>
                 <span className="flex items-center gap-1"><span>👁️</span> {story.views || 0}</span>
                 <span className="flex items-center gap-1"><span>💬</span> {story.comments_count || 0}</span>
            </div>
             <span className="text-gray-600">{formatStoryDate(story.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default MyStoriesPage;
