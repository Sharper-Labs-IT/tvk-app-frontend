import React, { useEffect, useRef, useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. Interface
interface BlogPost {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'video' | 'article' | 'gallery';
}

// 2. Mock Data
const blogPosts: BlogPost[] = [
  {
    id: 1,
    categoryId: 1,
    categoryName: 'ANNOUNCEMENTS',
    title: 'Official Community Guidelines Update',
    description:
      'Important updates regarding community standards and new features coming next month.',
    imageUrl: '/images/blog/globe.webp',
    type: 'article',
  },
  {
    id: 2,
    categoryId: 2,
    categoryName: 'NEWS & UPDATES',
    title: 'Global Release Strategy: New Territories',
    description:
      'Details on the expanded international theatrical release plan for the upcoming film.',
    imageUrl: '/images/blog/chart.webp',
    type: 'article',
  },
  {
    id: 3,
    categoryId: 3,
    categoryName: 'EXCLUSIVE PHOTOS',
    title: 'Character Look Reveal: High Res Gallery',
    description: 'Download 4K wallpapers and see the detailed costume design photos.',
    imageUrl: '/images/blog/sketch.webp',
    type: 'gallery',
  },
  {
    id: 4,
    categoryId: 4,
    categoryName: 'EXCLUSIVE VIDEOS',
    title: 'Making of the Global Anthem: Studio Footage',
    description: 'Get an insider’s look at the recording sessions and creative process.',
    imageUrl: '/images/blog/studio.webp',
    type: 'video',
  },
  {
    id: 5,
    categoryId: 5,
    categoryName: 'BEHIND THE SCENES',
    title: 'On Set: Filming the Climax Action Sequence',
    description: 'Exclusive on-location report and concept art from the final schedule.',
    imageUrl: '/images/blog/camera.webp',
    type: 'article',
  },
  {
    id: 6,
    categoryId: 6,
    categoryName: 'FAN MESSAGES',
    title: 'Fan Art of the Month Showcase',
    description: 'Celebrating the creativity of our community. See if your art made the list!',
    imageUrl: '/images/blog/ticket.webp',
    type: 'gallery',
  },
  {
    id: 7,
    categoryId: 7,
    categoryName: 'INTERVIEWS',
    title: "Director's Vision: Full Interview",
    description:
      'Read the complete, translated interview with the director on the upcoming project.',
    imageUrl: '/images/blog/mic.webp',
    type: 'article',
  },
  {
    id: 8,
    categoryId: 8,
    categoryName: 'EVENTS',
    title: 'TVK Global Fan Meet: Highlights from Dubai',
    description: 'Exclusive photos and reports from the recent international fan gathering.',
    imageUrl: '/images/blog/fan-meet.webp',
    type: 'gallery',
  },
  {
    id: 9,
    categoryId: 9,
    categoryName: 'GAMES & CHALLENGES',
    title: 'Weekly Trivia Challenge: Win Merch',
    description: 'Participate in this week’s quiz and stand a chance to win signed posters.',
    imageUrl: '/images/blog/headphones.webp',
    type: 'article',
  },
];

const MembersExclusiveBlog: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const handleCardClick = (catId: number) => {
    navigate(`/dashboard/feed?category=${catId}`);
    window.scrollTo(0, 0);
  };

  return (
    <section
      ref={sectionRef}
      // ✅ ADDED: flex flex-col justify-center to center content vertically
      className="relative w-full py-16 bg-cover bg-center bg-no-repeat min-h-screen overflow-hidden flex flex-col justify-center"
      style={{
        backgroundImage: "url('/images/BackImg1.png')",
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div
          className={`text-center mb-12 relative transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-yellow-500"></div>
            <h2 className="text-3xl lg:text-5xl font-serif text-yellow-500 tracking-widest uppercase drop-shadow-md">
              Members Exclusive Blog
            </h2>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-yellow-500"></div>
          </div>
          <p className="text-gray-400">
            Unlock premium content, global updates, and behind-the-scenes access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <div
              key={post.id}
              onClick={() => handleCardClick(post.categoryId)}
              className="cursor-pointer"
            >
              <BlogCard post={post} index={index} isVisible={isVisible} />
            </div>
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
      className={`group relative flex items-center p-3 rounded-xl border border-yellow-600/40 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-black shadow-lg hover:border-yellow-500 transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative w-1/3 aspect-square shrink-0 overflow-hidden rounded-lg border border-yellow-500/20">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/400x400/111/gold?text=TVK';
          }}
        />
        <div className="absolute top-0 left-0 w-full p-1">
          <div className="bg-yellow-600/90 text-black text-[9px] font-bold px-1 rounded-sm uppercase">
            {post.categoryName}
          </div>
        </div>
      </div>
      <div className="w-2/3 pl-4 flex flex-col justify-between h-full py-1">
        <div className="flex justify-end mb-1">
          <div className="flex items-center gap-1 text-[10px] text-yellow-500/80">
            <Lock size={12} /> Members Only
          </div>
        </div>
        <div>
          <h3 className="text-yellow-500 font-serif text-sm font-bold line-clamp-2 group-hover:text-white">
            {post.title}
          </h3>
          <p className="text-gray-400 text-[11px] line-clamp-2">{post.description}</p>
        </div>
        <div className="flex justify-end mt-2 pt-2 border-t border-white/5">
          <button className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold uppercase hover:text-white">
            Read More <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembersExclusiveBlog;
