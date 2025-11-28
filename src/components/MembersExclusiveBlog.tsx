import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';

// 1. Interface for TypeScript safety
interface BlogPost {
  id: number;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'video' | 'article' | 'gallery';
}

// 2. Mock Data
const blogPosts: BlogPost[] = [
  {
    id: 1,
    category: 'BEHIND THE SCENES',
    title: 'Making of the Global Anthem: Exclusive Studio Footage',
    description: 'Get an insider’s look at the recording sessions and creative process.',
    imageUrl: '/images/blog/studio.webp',
    type: 'video',
  },
  {
    id: 2,
    category: 'TRANSLATED INTERVIEW',
    title: "Director's Vision: Full Interview (English Translation)",
    description:
      'Read the complete, translated interview with the director on the upcoming project.',
    imageUrl: '/images/blog/mic.webp',
    type: 'article',
  },
  {
    id: 3,
    category: 'FAN EVENT COVERAGE',
    title: 'TVK Global Fan Meet: Highlights from Dubai',
    description: 'Exclusive photos and reports from the recent international fan gathering.',
    imageUrl: '/images/blog/fan-meet.webp',
    type: 'gallery',
  },
  {
    id: 4,
    category: 'INTERNATIONAL UPDATE',
    title: 'Global Release Strategy: New Territories Announced',
    description: 'Details on the expanded international theatrical release plan.',
    imageUrl: '/images/blog/globe.webp',
    type: 'article',
  },
  {
    id: 5,
    category: 'BEHIND THE SCENES',
    title: 'On Set: Filming the Climax Action Sequence',
    description: 'Exclusive on-location report and concept art from the final schedule.',
    imageUrl: '/images/blog/camera.webp',
    type: 'article',
  },
  {
    id: 6,
    category: 'TRANSLATED INTERVIEW',
    title: "Music Director's Insights: The Soundscape of the Film",
    description: 'An in-depth translated conversation about composing the film’s score.',
    imageUrl: '/images/blog/headphones.webp',
    type: 'video',
  },
  {
    id: 7,
    category: 'FAN EVENT COVERAGE',
    title: 'TVK Fan Club: UK Premiere Celebration',
    description: 'Coverage of the special fan screening event in London.',
    imageUrl: '/images/blog/ticket.webp',
    type: 'gallery',
  },
  {
    id: 8,
    category: 'INTERNATIONAL UPDATE',
    title: 'Box Office Report: Opening Weekend Global Numbers',
    description: 'A detailed breakdown of the film’s performance across international markets.',
    imageUrl: '/images/blog/chart.webp',
    type: 'article',
  },
  {
    id: 9,
    category: 'BEHIND THE SCENES',
    title: 'Costume Design: Creating the Iconic Look',
    description: 'Exclusive sketches and details on the character’s wardrobe design.',
    imageUrl: '/images/blog/sketch.webp',
    type: 'article',
  },
];

const MembersExclusiveBlog: React.FC = () => {
  return (
    <section
      className="relative w-full py-16 bg-cover bg-center bg-no-repeat min-h-screen"
      style={{
        backgroundImage: "url('/images/BackImg1.png')",
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-brand-gold"></div>
            <h2 className="text-2xl sm:text-4xl font-serif text-brand-gold tracking-widest uppercase drop-shadow-md">
              Members Exclusive Blog
            </h2>
            <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-brand-gold"></div>
          </div>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Unlock premium content, global updates, and behind-the-scenes access. For TVK Members
            Only.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Sub-component
const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  return (
    <div className="group relative flex h-48 border border-brand-gold/40 bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden hover:border-brand-gold hover:shadow-[0_0_15px_rgba(230,198,91,0.2)] transition-all duration-300">
      {/* Left Side: Image */}
      <div className="w-2/5 relative h-full overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x600/111/gold?text=TVK';
          }}
        />

        {/* Category Tag */}
        <div className="absolute top-2 left-2">
          <span className="bg-brand-gold text-brand-dark text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wider">
            {post.category}
          </span>
        </div>
      </div>

      {/* Right Side: Content */}
      <div className="w-3/5 p-4 flex flex-col justify-between bg-gradient-to-r from-black/80 to-transparent">
        {/* Members Only Badge */}
        <div className="flex justify-end mb-1">
          <div className="flex items-center gap-1 text-xs text-brand-gold/80 font-medium">
            <Lock size={12} />
            <span>Members Only</span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-brand-gold font-serif text-sm sm:text-base font-semibold leading-tight mb-2 line-clamp-2 group-hover:text-white transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{post.description}</p>
        </div>

        {/* Read More */}
        <div className="flex justify-end mt-2">
          <button className="flex items-center gap-1 text-xs text-brand-gold font-bold uppercase tracking-wide hover:text-white transition-colors">
            Read More <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembersExclusiveBlog;
