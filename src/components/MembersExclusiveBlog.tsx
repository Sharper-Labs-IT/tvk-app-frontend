import React, { useEffect, useRef, useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

// 1. Interface
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
  // Animation State
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for Scroll Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } // Trigger when 10% visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 bg-cover bg-center bg-no-repeat min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/images/BackImg1.png')",
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section - Animated */}
        <div
          className={`text-center mb-12 relative transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <h2 className="text-2xl sm:text-4xl font-serif text-yellow-500 tracking-widest uppercase drop-shadow-md">
              Members Exclusive Blog
            </h2>
            <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Unlock premium content, global updates, and behind-the-scenes access. For TVK Members
            Only.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Sub-component
const BlogCard: React.FC<{ post: BlogPost; index: number; isVisible: boolean }> = ({
  post,
  index,
  isVisible,
}) => {
  return (
    <div
      className={`group relative flex items-center p-3 rounded-xl border border-yellow-600/40 
        bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-black 
        shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:border-yellow-500 
        transition-all duration-700 ease-out transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
      `}
      style={{ transitionDelay: `${index * 150}ms` }} // Staggered animation delay
    >
      {/* Image Container - Square 1:1, Padded inside Card */}
      <div className="relative w-1/3 aspect-square shrink-0 overflow-hidden rounded-lg border border-yellow-500/20 group-hover:border-yellow-500/60 transition-colors">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x400/111/gold?text=TVK';
          }}
        />

        {/* Category Tag - Absolute on Image */}
        <div className="absolute top-0 left-0 w-full p-1">
          <div className="bg-yellow-600/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider text-center shadow-md whitespace-nowrap overflow-hidden text-ellipsis">
            {post.category}
          </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="w-2/3 pl-4 flex flex-col justify-between h-full py-1">
        {/* Top: Members Only Badge */}
        <div className="flex justify-end mb-1">
          <div className="flex items-center gap-1 text-[10px] text-yellow-500/80 font-medium">
            <Lock size={10} />
            <span>Members Only</span>
          </div>
        </div>

        {/* Middle: Title & Desc */}
        <div className="flex-grow flex flex-col justify-center">
          <h3 className="text-yellow-500 font-serif text-sm font-bold leading-tight mb-1.5 line-clamp-2 group-hover:text-white transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-2">
            {post.description}
          </p>
        </div>

        {/* Bottom: Read More */}
        <div className="flex justify-end mt-2 pt-2 border-t border-white/5">
          <button className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold uppercase tracking-wide hover:text-white transition-colors">
            Read More <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembersExclusiveBlog;
