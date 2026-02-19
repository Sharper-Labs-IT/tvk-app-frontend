import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveStory } from '../services/storyService';
import { generateStory } from '../services/storyGenerationService';
import { getStoryTemplates } from '../services/storyTemplateService';
import type { StoryPrompt, StoryGenre, StoryMood, StoryLength, StoryTemplate, GenerateStoryResponse } from '../types/story';
import { useAuth } from '../context/AuthContext';
import StoryTemplateSelector from '../components/story/StoryTemplateSelector';
import StoryPreview from '../components/story/StoryPreview';

const GENRES: { value: StoryGenre; label: string; emoji: string }[] = [
  { value: 'adventure', label: 'Adventure', emoji: '🗺️' },
  { value: 'action', label: 'Action', emoji: '⚔️' },
  { value: 'romance', label: 'Romance', emoji: '💕' },
  { value: 'sci-fi', label: 'Sci-Fi', emoji: '🚀' },
  { value: 'fantasy', label: 'Fantasy', emoji: '🧙' },
  { value: 'mystery', label: 'Mystery', emoji: '🔍' },
  { value: 'horror', label: 'Horror', emoji: '👻' },
  { value: 'comedy', label: 'Comedy', emoji: '😂' },
  { value: 'drama', label: 'Drama', emoji: '🎭' },
];

const MOODS: { value: StoryMood; label: string }[] = [
  { value: 'epic', label: 'Epic' },
  { value: 'lighthearted', label: 'Lighthearted' },
  { value: 'dark', label: 'Dark' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'suspenseful', label: 'Suspenseful' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'humorous', label: 'Humorous' },
];

const LENGTHS: { value: StoryLength; label: string; words: string }[] = [
  { value: 'short', label: 'Short', words: '~500 words, 2-3 min read' },
  { value: 'medium', label: 'Medium', words: '~1000 words, 5-7 min read' },
  { value: 'long', label: 'Long', words: '~2000 words, 10-15 min read' },
];

const StoryCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'prompt' | 'generating' | 'preview'>('prompt');
  const [templates, setTemplates] = useState<StoryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate | null>(null);
  
  const [prompt, setPrompt] = useState<StoryPrompt>({
    genre: 'adventure',
    mood: 'epic',
    length: 'medium',
    theme: '',
    customPrompt: '',
  });

  const [characterName, setCharacterName] = useState(user?.nickname || 'Hero');
  const [characterTraits, setCharacterTraits] = useState('');
  const [includeImages, setIncludeImages] = useState(true);
  const [generatedStory, setGeneratedStory] = useState<GenerateStoryResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getStoryTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      setStep('generating');

      const response = await generateStory({
        prompt: {
          genre: prompt.genre,
          mood: prompt.mood,
          length: prompt.length,
          theme: prompt.theme,
          customPrompt: prompt.customPrompt
        },
        characterName: characterName,
        characterTraits: characterTraits.split(',').map(t => t.trim()).filter(Boolean),
        includeImages: includeImages,
      });

      setGeneratedStory(response);
      setStep('preview');
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to generate story. Please try again.';
      setError(errorMessage);
      setStep('prompt');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (isPublic: boolean) => {
    if (!generatedStory?.data?.story) return;

    try {
      const saved = await saveStory({
        ...generatedStory.data.story,
        is_public: isPublic,
      });
      navigate(`/story/${saved.data.id}`);
    } catch (error) {
      console.error('Failed to save story:', error);
      setError('Failed to save story. Please try again.');
    }
  };

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 via-transparent to-brand-goldDark/10 animate-pulse" />
        
        <div className="text-center relative z-10">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-brand-gold/20 blur-3xl animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-brand-gold via-[#fff5c2] to-brand-gold bg-clip-text text-transparent mb-4 drop-shadow-sm">
            AI is crafting your story...
          </h2>
          <p className="text-gray-400 mb-12 text-lg">
            Creating an epic tale for <span className="text-brand-gold font-semibold">{characterName}</span>
          </p>
          <div className="flex justify-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-brand-goldDark to-brand-gold rounded-full animate-bounce shadow-[0_0_10px_rgba(230,198,91,0.5)]" style={{ animationDelay: '0ms' }}></div>
            <div className="w-4 h-4 bg-gradient-to-r from-brand-gold to-brand-goldDark rounded-full animate-bounce shadow-[0_0_10px_rgba(230,198,91,0.5)]" style={{ animationDelay: '150ms' }}></div>
            <div className="w-4 h-4 bg-gradient-to-r from-brand-goldDark to-brand-gold rounded-full animate-bounce shadow-[0_0_10px_rgba(230,198,91,0.5)]" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'preview' && generatedStory) {
    return (
      <StoryPreview
        story={generatedStory.data.story}
        scenes={generatedStory.data.scenes}
        onSave={handleSave}
        onBack={() => setStep('prompt')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-brand-gold via-[#fff5c2] to-brand-gold bg-clip-text text-transparent drop-shadow-sm">
              Create Your AI Story
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Let AI craft an amazing story featuring your character
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Character Setup */}
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-8 mb-6 hover:border-brand-gold/30 transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">👤</span> Your Character
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Character Name
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-[#121212] text-white focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all"
                placeholder="Enter character name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                Character Traits (optional)
              </label>
              <input
                type="text"
                value={characterTraits}
                onChange={(e) => setCharacterTraits(e.target.value)}
                className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-[#121212] text-white focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all"
                placeholder="e.g., brave, intelligent, kind (comma-separated)"
              />
            </div>
          </div>
        </div>

        {/* Story Templates */}
        {templates.length > 0 && (
          <div className="mb-6">
            <StoryTemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelect={(template) => {
                setSelectedTemplate(template);
                setPrompt({ ...prompt, genre: template.genre });
              }}
            />
          </div>
        )}

        {/* Story Settings */}
        <div className="bg-[#1E1E1E] border border-gray-800 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-8 mb-6 hover:border-brand-gold/30 transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">📖</span> Story Settings
          </h2>
          
          {/* Genre */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Genre
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {GENRES.map((genre) => (
                <button
                  key={genre.value}
                  onClick={() => setPrompt({ ...prompt, genre: genre.value })}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    prompt.genre === genre.value
                      ? 'border-brand-gold bg-brand-gold/10 shadow-[0_0_20px_rgba(230,198,91,0.3)]'
                      : 'border-gray-700 bg-[#121212] hover:border-brand-gold/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{genre.emoji}</div>
                  <div className={`text-sm font-bold ${
                    prompt.genre === genre.value ? 'text-brand-gold' : 'text-gray-300'
                  }`}>
                    {genre.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Mood
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setPrompt({ ...prompt, mood: mood.value })}
                  className={`px-4 py-3 rounded-xl border-2 transition-all font-bold transform hover:scale-105 ${
                    prompt.mood === mood.value
                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold shadow-[0_0_15px_rgba(230,198,91,0.2)]'
                      : 'border-gray-700 bg-[#121212] text-gray-300 hover:border-brand-gold/50'
                  }`}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
              Story Length
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LENGTHS.map((length) => (
                <button
                  key={length.value}
                  onClick={() => setPrompt({ ...prompt, length: length.value })}
                  className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    prompt.length === length.value
                      ? 'border-brand-gold bg-brand-gold/10 shadow-[0_0_20px_rgba(230,198,91,0.2)]'
                      : 'border-gray-700 bg-[#121212] hover:border-brand-gold/50'
                  }`}
                >
                  <div className={`text-lg font-bold mb-1 ${
                    prompt.length === length.value ? 'text-brand-gold' : 'text-white'
                  }`}>
                    {length.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {length.words}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Theme (optional)
            </label>
            <input
              type="text"
              value={prompt.theme}
              onChange={(e) => setPrompt({ ...prompt, theme: e.target.value })}
              className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-[#121212] text-white focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all"
              placeholder="e.g., friendship, courage, redemption"
            />
          </div>

          {/* Custom Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
              Custom Story Prompt (optional)
            </label>
            <textarea
              value={prompt.customPrompt}
              onChange={(e) => setPrompt({ ...prompt, customPrompt: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-700 rounded-xl bg-[#121212] text-white focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-all resize-none"
              placeholder="Add any specific details you'd like in your story..."
            />
          </div>

          {/* Include Images */}
          <div className="flex items-center gap-3 p-4 bg-[#121212] border border-gray-700 rounded-xl">
            <input
              type="checkbox"
              id="includeImages"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              className="w-5 h-5 text-brand-gold border-gray-600 rounded focus:ring-brand-gold bg-[#1E1E1E]"
            />
            <label htmlFor="includeImages" className="text-sm font-semibold text-gray-300">
              Generate AI images for story scenes
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/story-studio')}
            className="flex-1 px-8 py-4 bg-gray-800 text-white border border-gray-700 rounded-xl hover:bg-gray-700 hover:border-gray-600 transition-all font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !characterName}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark rounded-xl hover:shadow-[0_0_40px_rgba(230,198,91,0.6)] transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            Generate Story with AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryCreate;
