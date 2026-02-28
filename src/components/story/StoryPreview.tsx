import { useState } from 'react';
import { ArrowLeft, Save, Globe, Lock, Download, Share2, Clock, BookOpen } from 'lucide-react';
import type { Story, StoryScene } from '../../types/story';
import { getStoryImageUrl } from '../../utils/storyUtils';

interface StoryPreviewProps {
  story: Omit<Story, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string };
  scenes: StoryScene[];
  onSave: (isPublic: boolean) => void;
  onBack: () => void;
}

const StoryPreview = ({ story, scenes, onSave, onBack }: StoryPreviewProps) => {
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  // Debug: Log scenes data
  console.log('StoryPreview - scenes:', scenes);
  console.log('StoryPreview - scenes count:', scenes?.length || 0);
  if (scenes && scenes.length > 0) {
    console.log('StoryPreview - first scene:', scenes[0]);
    console.log('StoryPreview - imageUrl fields:', {
      imageUrl: scenes[0].imageUrl,
      image_url: scenes[0].image_url
    });
  }

  const handleSave = async () => {
    setSaving(true);
    await onSave(isPublic);
    setSaving(false);
  };

  const readTime = Math.ceil(story.content.split(' ').length / 200);

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Header */}
      <div className="bg-brand-dark/95 backdrop-blur-lg border-b border-brand-gold/20 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-brand-gold transition-colors font-bold uppercase tracking-wide text-sm self-start sm:self-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Edit
            </button>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              {/* Visibility Toggle */}
              <div className="flex items-center gap-1 bg-black/40 border border-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${
                    !isPublic
                      ? 'bg-gray-800 text-white shadow-lg border border-gray-600'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Private
                </button>
                <button
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm ${
                    isPublic
                      ? 'bg-brand-gold text-brand-dark shadow-lg shadow-brand-gold/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Public
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark rounded-xl font-bold hover:shadow-[0_0_20px_rgba(230,198,91,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-brand-dark/30 border-t-brand-dark rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Story
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cover */}
        {(() => {
          // Prioritize signed URL from backend
          const coverImageUrl = (story as any).cover_image_url || 
                                (story as any).coverImage?.previewUrl || 
                                (story as any).coverImage?.path || 
                                story.cover_image;
          return coverImageUrl ? (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={getStoryImageUrl(coverImageUrl) || ''}
                alt={story.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          ) : null;
        })()}

        {/* Title & Meta */}
        <div className="bg-tvk-dark-card rounded-2xl p-8 mb-6 border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen className="w-32 h-32 text-brand-gold transform rotate-12 translate-x-8 -translate-y-8" />
          </div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <span className="px-4 py-1.5 bg-brand-dark border border-brand-gold/30 text-brand-gold rounded-full text-xs font-bold uppercase tracking-wider">
              {story.genre}
            </span>
            <span className="px-4 py-1.5 bg-brand-dark border border-brand-gold/30 text-brand-gold rounded-full text-xs font-bold uppercase tracking-wider">
              {story.mood}
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <Clock className="w-4 h-4 text-brand-gold" />
              {readTime} min read
            </span>
          </div>

          <h1 className="text-5xl font-zentry text-brand-gold mb-6 leading-tight drop-shadow-md">
            {story.title}
          </h1>

          <div className="flex items-center gap-4 mb-8 bg-brand-dark/50 p-4 rounded-xl border border-white/5">
            <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-brand-dark font-black text-xl shadow-lg shadow-brand-gold/20">
              {story.character_name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-brand-gold/70 uppercase tracking-widest font-bold mb-0.5">
                Featuring
              </p>
              <p className="font-bold text-white text-lg">
                {story.character_name}
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
             {scenes && scenes.length > 0 ? (
                 <>
                   {/* Debug info - remove after testing */}
                   <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-sm">
                     <p className="text-blue-300">
                       📊 Debug: Found {scenes.length} scene(s) with {scenes.filter(s => s.imageUrl || s.image_url).length} image(s)
                     </p>
                   </div>
                   
                   <div className="space-y-12">
                   {scenes.map((scene, index) => {
                     // Support nested image object and legacy fields
                     const imageUrl = scene.image?.previewUrl || scene.image?.path || scene.imageUrl || scene.image_url;
                     const sceneImg = imageUrl ? getStoryImageUrl(imageUrl) : null;
                     
                     console.log(`🎬 Scene ${index + 1} Image Check:`, {
                       title: scene.title,
                       'scene.image': scene.image,
                       'scene.image?.previewUrl': scene.image?.previewUrl,
                       'scene.image?.path': scene.image?.path,
                       'extracted imageUrl': imageUrl,
                       'final sceneImg': sceneImg
                     });
                     
                     return (
                       <div key={scene.id || index} className="animate-fadeIn">
                         <h3 className="text-2xl font-zentry text-brand-gold mb-4">
                           {scene.title || `Scene ${index + 1}`}
                         </h3>
                         <div className="mb-8">
                            {scene.content.split('\n\n').map((para, idx) => (
                              <p key={idx} className="text-gray-300 text-lg leading-relaxed font-light mb-4">
                                {para}
                              </p>
                            ))}
                         </div>
                         {sceneImg ? (
                           <div className="my-8 rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                              <div className="relative">
                                <img 
                                  src={sceneImg} 
                                  alt={scene.title || 'Scene illustration'} 
                                  className="w-full h-auto max-h-[600px] object-cover"
                                  onError={(e) => {
                                    console.error('Image failed to load:', sceneImg);
                                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23222" width="400" height="300"/%3E%3Ctext fill="%23888" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                           </div>
                         ) : (
                           <div className="my-8 p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
                             ⚠️ No image URL available for this scene
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
                 </>
             ) : (
                story.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-300 text-lg leading-relaxed font-light mb-4">
                    {paragraph}
                  </p>
                ))
             )}
          </div>
        </div>

        {/* Scenes (Legacy/Fallbacks - Removed since integrated above) */}
        {/* End of Preview */}

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-tvk-dark-card text-brand-gold rounded-xl hover:bg-brand-dark transition-all border border-brand-gold/20 hover:border-brand-gold group"
          >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold uppercase tracking-wide">Download Story</span>
          </button>
          
          {story.id && (
            <button
              onClick={async () => {
                const url = `${window.location.origin}/story/${story.id}`;
                await navigator.clipboard.writeText(url);
                alert('Link copied to clipboard!');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-tvk-dark-card text-brand-gold rounded-xl hover:bg-brand-dark transition-all border border-brand-gold/20 hover:border-brand-gold group"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-bold uppercase tracking-wide">Share Story</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryPreview;
