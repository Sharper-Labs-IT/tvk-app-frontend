import React, { useState, useEffect } from 'react';
import { useStoryGeneration } from '../../context/StoryGenerationContext';
import type { StoryFormData, StoryGenre, StoryMood, StoryLength } from '../../types/story';
import { validateCharacterName } from '../../utils/storyUtils';

/**
 * Story Generation Form Component
 * 
 * Multi-step wizard for creating AI stories:
 * Step 1: Character Details
 * Step 2: Story Parameters (genre, mood, length)
 * Step 3: Review & Generate
 */

const StoryGenerationForm: React.FC = () => {
  const {
    generateNewStory,
    fetchQuota,
    quota,
    canGenerate,
    isGenerating,
  } = useStoryGeneration();
  
  const [step, setStep] = useState(1);
  const VIJAY_TRAIT_PRESETS = [
    'Mass Hero', 'Justice Fighter', 'Fearless', 'Stylish', 'Compassionate',
    'People\'s Leader', 'Witty', 'Determined',
  ];

  const VIJAY_BACKGROUND_PRESETS = [
    { label: 'Revolutionary', value: 'A common man turned revolutionary who fights for the oppressed and stands against the system.' },
    { label: 'Undercover Cop', value: 'A stylish undercover cop who dismantles corruption from within the system with wit and raw power.' },
    { label: 'Mass Leader', value: 'A charismatic mass leader who sacrifices everything for the welfare of the people around him.' },
    { label: 'Street Fighter', value: 'A fearless street-level hero who rises from humble origins to take on powerful enemies threatening the weak.' },
  ];

  const [formData, setFormData] = useState<StoryFormData>({
    character_name: 'VJ',
    character_traits: [],
    character_background: '',
    genre: 'adventure',
    mood: 'epic',
    length: 'medium',
    theme: '',
    custom_prompt: '',
    include_images: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch quota on mount
  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);
  
  // Genre options
  const genres: { value: StoryGenre; label: string; icon: string }[] = [
    { value: 'adventure', label: 'Adventure', icon: '⚔️' },
    { value: 'action', label: 'Action', icon: '💥' },
    { value: 'romance', label: 'Romance', icon: '❤️' },
    { value: 'sci-fi', label: 'Sci-Fi', icon: '🚀' },
    { value: 'fantasy', label: 'Fantasy', icon: '🐉' },
    { value: 'mystery', label: 'Mystery', icon: '🔍' },
    { value: 'horror', label: 'Horror', icon: '👻' },
    { value: 'comedy', label: 'Comedy', icon: '😂' },
    { value: 'drama', label: 'Drama', icon: '🎭' },
  ];
  
  // Mood options
  const moods: { value: StoryMood; label: string }[] = [
    { value: 'epic', label: 'Epic' },
    { value: 'lighthearted', label: 'Lighthearted' },
    { value: 'dark', label: 'Dark' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'suspenseful', label: 'Suspenseful' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'humorous', label: 'Humorous' },
  ];
  
  // Length options
  const lengths: { value: StoryLength; label: string; words: string; time: string }[] = [
    { value: 'short', label: 'Short', words: '~500 words', time: '2-3 minutes' },
    { value: 'medium', label: 'Medium', words: '~1000 words', time: '4-5 minutes' },
    { value: 'long', label: 'Long', words: '~2000 words', time: '7-10 minutes' },
  ];
  
  // Handle input change
  const handleChange = (field: keyof StoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Add character trait
  const addTrait = (trait: string) => {
    if (trait.trim() && formData.character_traits.length < 5) {
      handleChange('character_traits', [...formData.character_traits, trait.trim()]);
    }
  };
  
  // Remove character trait
  const removeTrait = (index: number) => {
    handleChange(
      'character_traits',
      formData.character_traits.filter((_, i) => i !== index)
    );
  };
  
  // Validate step
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      const nameError = validateCharacterName(formData.character_name);
      if (nameError) {
        newErrors.character_name = nameError;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Next step
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };
  
  // Previous step
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canGenerate) {
      return;
    }
    
    if (!validateStep(step)) {
      return;
    }
    
    try {
      await generateNewStory({
        characterName: formData.character_name,
        characterTraits: formData.character_traits.length > 0 ? formData.character_traits : undefined,
        characterBackground: formData.character_background || undefined,
        prompt: {
          genre: formData.genre,
          mood: formData.mood,
          length: formData.length,
          theme: formData.theme || '',
          customPrompt: formData.custom_prompt || '',
        },
        includeImages: formData.include_images,
      });
    } catch (err) {
      // Error is handled by context
      console.error('Generation failed:', err);
    }
  };
  
  // Render quota warning
  const renderQuotaWarning = () => {
    if (!quota) return null;
    
    if (quota.remaining === 0) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold">Generation Limit Reached</p>
              <p className="text-sm">You've used all 10 story generations this hour. Limit resets soon.</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (quota.remaining <= 3) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-semibold">{quota.remaining} {quota.remaining === 1 ? 'Story' : 'Stories'} Remaining</p>
              <p className="text-sm">You have {quota.remaining} generations left this hour.</p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="max-w-4xl mx-auto py-4 px-4 text-white">
      {/* Page Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-zentry tracking-wide">
          CREATE YOUR <span className="text-brand-gold">VJ STORY</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Let AI craft an epic tale set in the Thalapathy universe.
        </p>
      </div>
      
      {/* Quota Warning */}
      {renderQuotaWarning()}

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex justify-between relative">
          {/* Progress Bar Background */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 rounded-full" />
          
          {/* Active Progress Bar */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-brand-goldDark to-brand-gold -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />

          {/* Steps */}
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                  s <= step 
                    ? 'bg-brand-gold border-brand-gold text-brand-dark scale-110 shadow-[0_0_15px_rgba(230,198,91,0.5)]' 
                    : 'bg-brand-dark border-gray-700 text-gray-500'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              <span className={`text-xs mt-2 uppercase font-bold tracking-wider transition-colors duration-300 ${
                s <= step ? 'text-brand-gold' : 'text-gray-600'
              }`}>
                {s === 1 ? 'Character' : s === 2 ? 'Settings' : 'Review'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-tvk-dark-card border border-brand-gold/10 p-8 rounded-2xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Character Details */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 font-zentry text-brand-gold border-b border-gray-800 pb-2">
                CHARACTER DETAILS
              </h2>
              
              {/* Character Name */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Character Name <span className="text-brand-gold">*</span>
                </label>
                <input
                  type="text"
                  value={formData.character_name}
                  readOnly
                  className="w-full px-5 py-4 bg-black/30 border border-brand-gold/30 rounded-lg text-brand-gold font-bold text-lg cursor-not-allowed opacity-80"
                />
              </div>
              
              {/* Character Traits */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Character Traits (Max 5)
                </label>
                {/* Vijay Preset Trait Chips */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Quick Add — VJ Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {VIJAY_TRAIT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={formData.character_traits.includes(preset) || formData.character_traits.length >= 5}
                        onClick={() => addTrait(preset)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          formData.character_traits.includes(preset)
                            ? 'bg-brand-gold/30 text-brand-gold border-brand-gold/40 opacity-50 cursor-not-allowed'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-brand-gold/50 hover:text-brand-gold cursor-pointer'
                        }`}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Or type a custom trait and press Enter..."
                    className="flex-1 px-5 py-3 bg-black/30 border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 text-white placeholder-gray-600"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTrait((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.character_traits.length === 0 && (
                     <span className="text-gray-600 text-sm italic">No traits added yet. Pick a preset or type your own.</span>
                  )}
                  {formData.character_traits.map((trait, index) => (
                    <span
                      key={index}
                      className="bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2"
                    >
                      {trait}
                      <button
                        type="button"
                        onClick={() => removeTrait(index)}
                        className="text-brand-gold hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Character Background */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Backstory (Optional)
                </label>
                {/* Vijay Archetype Presets */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Quick Pick — VJ Archetypes</p>
                  <div className="grid grid-cols-2 gap-2">
                    {VIJAY_BACKGROUND_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleChange('character_background', preset.value)}
                        className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${
                          formData.character_background === preset.value
                            ? 'bg-brand-gold/20 border-brand-gold/50 text-brand-gold'
                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-brand-gold/40 hover:text-gray-200'
                        }`}
                      >
                        <span className="font-bold block mb-0.5">{preset.label}</span>
                        <span className="opacity-70 line-clamp-2">{preset.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={formData.character_background}
                  onChange={(e) => handleChange('character_background', e.target.value)}
                  placeholder="Or write a custom backstory for your character..."
                  rows={3}
                  className="w-full px-5 py-3 bg-black/30 border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 text-white placeholder-gray-600 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Story Parameters */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 font-zentry text-brand-gold border-b border-gray-800 pb-2">
                STORY SETTINGS
              </h2>
              
              {/* Genre Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                  Genre <span className="text-brand-gold">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre.value}
                      type="button"
                      onClick={() => handleChange('genre', genre.value)}
                      className={`p-4 border rounded-lg transition-all duration-200 flex flex-col items-center gap-2 ${
                        formData.genre === genre.value
                          ? 'bg-brand-gold text-brand-dark border-brand-gold shadow-[0_0_10px_rgba(230,198,91,0.3)] transform scale-105'
                          : 'bg-black/30 border-gray-800 text-gray-400 hover:border-brand-gold/50 hover:text-brand-gold'
                      }`}
                    >
                      <span className="text-2xl">{genre.icon}</span>
                      <span className="font-bold text-sm uppercase tracking-wide">{genre.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                  Mood <span className="text-brand-gold">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => handleChange('mood', mood.value)}
                      className={`px-4 py-2 border rounded-lg transition-all font-bold text-sm uppercase tracking-wide ${
                        formData.mood === mood.value
                         ? 'bg-brand-gold text-brand-dark border-brand-gold shadow-[0_0_10px_rgba(230,198,91,0.3)]'
                         : 'bg-black/30 border-gray-800 text-gray-400 hover:border-brand-gold/50 hover:text-brand-gold'
                      }`}
                    >
                      {mood.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Length Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wide">
                  Story Length <span className="text-brand-gold">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {lengths.map((length) => (
                    <button
                      key={length.value}
                      type="button"
                      onClick={() => handleChange('length', length.value)}
                      className={`p-4 border rounded-lg transition-all flex flex-col items-center ${
                         formData.length === length.value
                          ? 'bg-brand-gold text-brand-dark border-brand-gold shadow-[0_0_10px_rgba(230,198,91,0.3)] transform scale-105'
                          : 'bg-black/30 border-gray-800 text-gray-400 hover:border-brand-gold/50 hover:text-brand-gold'
                      }`}
                    >
                      <div className="font-bold text-lg mb-1">{length.label}</div>
                      <div className="text-xs opacity-80">{length.words}</div>
                      <div className="text-[10px] opacity-60 mt-1 uppercase">
                        {length.time}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Include Images */}
              <div 
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  formData.include_images 
                    ? 'bg-brand-gold/10 border-brand-gold/50' 
                    : 'bg-black/20 border-gray-800'
                }`}
                onClick={() => handleChange('include_images', !formData.include_images)}
              >
                <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                  formData.include_images ? 'bg-brand-gold border-brand-gold' : 'border-gray-600'
                }`}>
                  {formData.include_images && <span className="text-brand-dark font-bold">✓</span>}
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${formData.include_images ? 'text-brand-gold' : 'text-gray-400'}`}>
                    Include AI-Generated Images
                  </div>
                  <div className="text-xs text-gray-500">
                    Add beautiful cover art and scene illustrations (+1 min gen time)
                  </div>
                </div>
              </div>
              
              {/* Optional Theme */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Theme (Optional)
                </label>
                {/* Vijay Theme Quick Chips */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Social Justice', 'Mass Action', "People's Hero", 'Political Revolution', 'Thalapathy Style', 'Common Man Rises', 'Redemption'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleChange('theme', t)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                        formData.theme === t
                          ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/50'
                          : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-brand-gold/40 hover:text-brand-gold'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  placeholder="e.g., social justice, mass action, people's hero..."
                  className="w-full px-5 py-3 bg-black/30 border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold/50 text-white placeholder-gray-600"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review & Generate */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 font-zentry text-brand-gold border-b border-gray-800 pb-2">
                REVIEW & GENERATE
              </h2>
              
              <div className="bg-black/30 border border-gray-800 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Character</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-2xl">👤</div>
                    <div>
                      <p className="text-xl font-bold text-white mb-1">{formData.character_name}</p>
                      {formData.character_traits.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.character_traits.map((t, i) => (
                            <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-800 pt-4">
                    <div>
                         <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Genre</h3>
                         <p className="text-brand-gold font-bold">{genres.find(g => g.value === formData.genre)?.label}</p>
                    </div>
                    <div>
                         <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Mood</h3>
                         <p className="text-brand-gold font-bold">{moods.find(m => m.value === formData.mood)?.label}</p>
                    </div>
                    <div>
                         <h3 className="text-xs font-bold text-gray-500 uppercase mb-1">Length</h3>
                         <p className="text-brand-gold font-bold">{lengths.find(l => l.value === formData.length)?.label}</p>
                    </div>
                </div>
                
                {formData.include_images && (
                    <div className="border-t border-gray-800 pt-4 flex items-center gap-2">
                        <span className="text-green-400">🖼️</span>
                        <span className="text-gray-300 text-sm">Includes <span className="text-white font-bold">AI-generated illustrations</span></span>
                    </div>
                )}
                
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <span>⏱️</span>
                    Estimated time: 
                    <span className="text-white font-bold">
                        {lengths.find(l => l.value === formData.length)?.time}
                        {formData.include_images && ' (+ images)'}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  value={formData.custom_prompt}
                  onChange={(e) => handleChange('custom_prompt', e.target.value)}
                  placeholder="e.g., VJ uncovers corruption and rallies the people, epic mass action climax, stylish slow-motion entry..."
                  rows={3}
                  className="w-full px-5 py-3 bg-black/30 border border-brand-gold/30 rounded-lg focus:ring-2 focus:ring-brand-gold/50 text-white placeholder-gray-600 resize-none"
                />
              </div>
              
              {/* Warning */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
                <span className="text-blue-400 text-xl mt-0.5">ℹ️</span>
                <p className="text-sm text-blue-200/80 leading-relaxed">
                  <strong>Heads up:</strong> Story generation runs on complex AI models and may take a few minutes. 
                  Please keep this tab open.
                </p>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-gray-800">
            <button
                type="button"
                onClick={prevStep}
                disabled={step === 1 || isGenerating}
                className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all w-full sm:w-auto ${
                step === 1 
                    ? 'opacity-0 pointer-events-none hidden sm:block' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
                ← Back
            </button>

            <div className="w-full sm:w-auto flex justify-end">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full sm:w-auto px-8 py-3 bg-white text-black font-extrabold rounded-lg hover:bg-gray-200 transform transition-all hover:scale-105 active:scale-95 uppercase tracking-wider shadow-lg"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canGenerate || isGenerating}
                  className={`w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-brand-goldDark to-brand-gold text-brand-dark font-extrabold rounded-lg transform transition-all hover:scale-105 active:scale-95 uppercase tracking-widest shadow-[0_0_20px_rgba(246,168,0,0.4)] flex items-center justify-center gap-3 ${
                    isGenerating || !canGenerate ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(246,168,0,0.6)]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-brand-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Weaving Story...</span>
                    </>
                  ) : (
                    <>
                      <span>✨ Generate Story</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryGenerationForm;
