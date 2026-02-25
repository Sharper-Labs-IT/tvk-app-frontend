import React, { useState, useEffect } from 'react';
import { formatStoryContent, getStoryImageUrl } from '../../utils/storyUtils';
import type { Story } from '../../types/story';

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
}

const StoryReader: React.FC<StoryReaderProps> = ({ story, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const authorName = story.userName || story.user_name || 'Anonymous';

  // Helper to render page content (text or image)
  const renderPageContent = (content: string, isFirstPage: boolean) => {
    if (content.startsWith('IMAGE:')) {
      const raw = content.substring(6);
      const lastColon = raw.lastIndexOf(':');
      const url = raw.substring(0, lastColon);
      
      return (
         <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative">
            {/* Elegant Book-Style Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-[#fdfbf7] to-amber-50/20"></div>
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #8b7355 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            {/* Premium Frame Container */}
            <div className="relative w-full max-w-sm md:max-w-md mx-auto">
              {/* Outer Gold Frame with Enhanced Shadow */}
              <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-br from-amber-800 via-amber-600 to-amber-800 rounded-lg opacity-95 shadow-[0_8px_30px_rgba(180,83,9,0.4)]"></div>
              
              {/* Inner Frame */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3 sm:p-4 rounded-lg shadow-inner">
                {/* Image Container with Premium Matting */}
                <div className="bg-gradient-to-br from-[#f8f4ed] via-[#f0e8d8] to-[#e8dcc8] p-4 sm:p-6 rounded shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded shadow-2xl">
                    <img 
                      src={url} 
                      alt="Scene Illustration" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23f0e6d6" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="%238b7355" text-anchor="middle" dy=".3em" font-family="serif"%3EScene Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {/* Enhanced vignette for depth */}
                    <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.2)] pointer-events-none"></div>
                    {/* Subtle gloss overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/5 pointer-events-none"></div>
                  </div>
                  
                  {/* Elegant Corner Flourishes */}
                  <div className="absolute top-1 left-1 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-t-2 border-amber-700/50 rounded-tl"></div>
                  <div className="absolute top-1 right-1 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-t-2 border-amber-700/50 rounded-tr"></div>
                  <div className="absolute bottom-1 left-1 w-6 h-6 sm:w-8 sm:h-8 border-l-2 border-b-2 border-amber-700/50 rounded-bl"></div>
                  <div className="absolute bottom-1 right-1 w-6 h-6 sm:w-8 sm:h-8 border-r-2 border-b-2 border-amber-700/50 rounded-br"></div>
                </div>
                
                {/* Fine line detail */}
                <div className="absolute inset-2 border border-amber-600/20 rounded-lg pointer-events-none"></div>
              </div>
              
              {/* Decorative hanging element */}
              <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-6 sm:h-8">
                <div className="w-full h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-amber-700/60 to-transparent rounded-full shadow-sm"></div>
              </div>
            </div>
         </div>
      );
    }
    
    return (
         <div className="prose prose-p:mb-5 prose-p:indent-8 max-w-none text-gray-900 font-serif leading-loose text-base sm:text-lg">
            {content.split('\n\n').map((para, i) => (
                <p key={i} className={isFirstPage && i===0 ? "first-letter:text-6xl sm:first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-2 sm:first-letter:mr-3 first-letter:mt-[-5px] first-letter:font-zentry text-gray-900 drop-shadow-sm" : "text-gray-900 drop-shadow-sm"}>
                    {para}
                </p>
            ))}
        </div>
    );
  };

  // Split content into pages
  useEffect(() => {
    if (!story.content && (!story.scenes || story.scenes.length === 0)) return;
    
    const newPages: string[] = [];
    const CHARS_PER_PAGE = 800; // Approximate characters per page

    // Use scenes_with_urls if available (has full AWS URLs), otherwise use scenes
    const scenesToUse = story.scenes_with_urls || story.scenes || [];

    if (scenesToUse && scenesToUse.length > 0) {
      // Scene-based pagination
      scenesToUse.forEach((scene) => {
          // 1. Text Pages
          let currentSceneContent = '';
          const paragraphs = formatStoryContent(scene.content || '');
          
          paragraphs.forEach(para => {
              if ((currentSceneContent.length + para.length) > CHARS_PER_PAGE && currentSceneContent.length > 0) {
                  newPages.push(currentSceneContent);
                  currentSceneContent = para;
              } else {
                  currentSceneContent = currentSceneContent ? `${currentSceneContent}\n\n${para}` : para;
              }
          });
          if (currentSceneContent) {
              newPages.push(currentSceneContent);
          }

          // 2. Image Page (if exists) - support nested image object and legacy fields
          const imageUrl = scene.image?.previewUrl || scene.image?.path || scene.imageUrl || scene.image_url;
          const imagePrompt = scene.imagePrompt || scene.image_prompt;
          
          if (imageUrl) {
              const imgUrl = getStoryImageUrl(imageUrl);
              if (imgUrl) {
                  newPages.push(`IMAGE:${imgUrl}:${imagePrompt || ''}`);
              }
          }
      });
    } else {
      // Classic Content-based pagination
      const paragraphs = formatStoryContent(story.content);
      let currentPageContent = '';

      paragraphs.forEach((para) => {
        if ((currentPageContent.length + para.length) > CHARS_PER_PAGE && currentPageContent.length > 0) {
          newPages.push(currentPageContent);
          currentPageContent = para;
        } else {
          currentPageContent = currentPageContent ? `${currentPageContent}\n\n${para}` : para;
        }
      });
      if (currentPageContent) {
        newPages.push(currentPageContent);
      }
    }

    setPages(newPages);
  }, [story.content, story.scenes, story.scenes_with_urls]);

  // Turn Page Handler
  const turnPage = (direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    if (direction === 'next' && currentPage < pages.length - 1) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(p => p + 1);
        setIsFlipping(false);
      }, 300); // Sync with CSS animation
    } else if (direction === 'prev' && currentPage > 0) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(p => p - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') turnPage('next');
      if (e.key === 'ArrowLeft') turnPage('prev');
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, pages.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }} />

      {/* Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-4">
        <button 
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 backdrop-blur-md transition-all md:p-3"
          aria-label="Close Reader"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Book Container */}
      <div className="relative w-full max-w-6xl aspect-[4/3] md:aspect-[3/2] perspective-[1500px] flex items-center justify-center">
        
        {/* The Book */}
        <div className="relative w-full h-full max-h-[85vh] bg-[#fdfbf7] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-r-lg rounded-l-md flex overflow-hidden book-spine">
            
            {/* Texture/Grain */}
            <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply"
                 style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />
            
            {/* Center Indent (Spine Shadow) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-transparent via-black/10 to-transparent z-20 pointer-events-none hidden md:block" />

            {/* Left Page (Previous/Current content based on layout) */}
            <div className="hidden md:flex flex-1 flex-col p-8 md:p-12 border-r border-[#e3dccb] relative">
                {/* Header */}
                <div className="text-center text-gray-400 text-xs font-serif uppercase tracking-widest mb-8 opacity-60">
                    {story.title} • {authorName}
                </div>
                
                {/* Content */}
                <div className="flex-1 font-serif text-lg leading-relaxed overflow-hidden">
                    {currentPage > 0 ? (
                        pages[currentPage - 1] && renderPageContent(pages[currentPage - 1], currentPage - 1 === 0)
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="mb-4 text-4xl opacity-20">❦</div>
                            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{story.title}</h1>
                            <p className="text-gray-500 italic">by {authorName}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-auto pt-8 text-gray-400 font-serif text-sm">
                    {currentPage > 0 ? currentPage : ''}
                </div>
            </div>

            {/* Right Page (Active Page) */}
            <div className="flex-1 flex flex-col p-8 md:p-12 relative bg-[#fdfbf7]">
                 {/* Header */}
                 <div className="text-center text-gray-400 text-xs font-serif uppercase tracking-widest mb-8 opacity-60 md:hidden">
                    {story.title}
                </div>

                 {/* Content */}
                 <div className="flex-1 font-serif text-lg leading-relaxed overflow-hidden">
                        {pages[currentPage] ? (
                             renderPageContent(pages[currentPage], currentPage === 0)
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                                <p className="italic text-gray-400">The End</p>
                            </div>
                        )}
                 </div>

                 {/* Footer */}
                 <div className="text-center mt-auto pt-8 text-gray-400 font-serif text-sm">
                    {currentPage + 1}
                </div>

                 {/* Page Turn Overlay (Animation) */}
                 {isFlipping && (
                    <div className="absolute inset-0 bg-gradient-to-l from-black/10 to-transparent z-10 transition-opacity duration-300" />
                 )}
            </div>
        </div>

        {/* Navigation Arrows */}
        <button 
            onClick={() => turnPage('prev')}
            disabled={currentPage === 0}
            className="absolute left-2 md:-left-16 bg-white/10 hover:bg-white/20 disabled:opacity-0 text-white rounded-full p-3 backdrop-blur-md transition-all"
        >
             ←
        </button>
        <button 
            onClick={() => turnPage('next')}
            disabled={currentPage >= pages.length - 1}
            className="absolute right-2 md:-right-16 bg-white/10 hover:bg-white/20 disabled:opacity-0 text-white rounded-full p-3 backdrop-blur-md transition-all"
        >
             →
        </button>
      </div>

        {/* CSS for 3D effect */}
        <style>{`
            .book-spine {
                box-shadow: 
                    inset 20px 0 50px rgba(0,0,0,0.1),
                    0 20px 50px rgba(0,0,0,0.5);
            }
        `}</style>
    </div>
  );
};

export default StoryReader;
