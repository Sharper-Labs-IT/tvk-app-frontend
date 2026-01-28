import { useState } from 'react';
import { ArrowLeft, Save, Globe, Lock, Download, Share2 } from 'lucide-react';
import type { Story, StoryScene } from '../../types/story';

interface StoryPreviewProps {
  story: Story;
  scenes: StoryScene[];
  onSave: (isPublic: boolean) => void;
  onBack: () => void;
}

const StoryPreview = ({ story, scenes, onSave, onBack }: StoryPreviewProps) => {
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(isPublic);
    setSaving(false);
  };

  const readTime = Math.ceil(story.content.split(' ').length / 200);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-purple-200 dark:border-purple-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Edit
            </button>
            <div className="flex items-center gap-3">
              {/* Visibility Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    !isPublic
                      ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-md'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Private
                </button>
                <button
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isPublic
                      ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-md'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Public
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Story'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cover */}
        {story.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Title & Meta */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">
              {story.genre}
            </span>
            <span className="px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-semibold">
              {story.mood}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {readTime} min read
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {story.title}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
              {story.characterName.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Featuring
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {story.characterName}
              </p>
            </div>
          </div>

          {/* Story Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {story.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Scenes with Images */}
        {scenes && scenes.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Story Scenes
            </h2>
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
              >
                {scene.imageUrl && (
                  <div className="h-64">
                    <img
                      src={scene.imageUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Scene {scene.sceneNumber}: {scene.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {scene.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-300 dark:border-gray-600"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
          <button
            onClick={async () => {
              const url = `${window.location.origin}/story/${story._id}`;
              await navigator.clipboard.writeText(url);
              alert('Link copied to clipboard!');
            }}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-300 dark:border-gray-600"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryPreview;
