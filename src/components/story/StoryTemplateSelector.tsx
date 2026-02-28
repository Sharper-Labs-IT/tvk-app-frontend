import type { StoryTemplate } from '../../types/story';

interface StoryTemplateSelectorProps {
  templates: StoryTemplate[];
  selectedTemplate: StoryTemplate | null;
  onSelect: (template: StoryTemplate) => void;
}

const StoryTemplateSelector = ({
  templates,
  selectedTemplate,
  onSelect,
}: StoryTemplateSelectorProps) => {
  return (
    <div className="bg-tvk-dark-card rounded-2xl shadow-xl p-8 border border-white/5">
      <h2 className="text-3xl font-zentry text-brand-gold mb-8">
        ✨ Story Templates
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`p-4 rounded-xl border-2 transition-all text-left relative group ${
              selectedTemplate?.id === template.id
                ? 'border-brand-gold bg-brand-dark shadow-[0_0_15px_rgba(230,198,91,0.2)]'
                : 'border-white/5 bg-brand-dark/50 hover:border-brand-gold/50'
            }`}
          >
            <div className="mb-4 overflow-hidden rounded-lg">
              <img
                src={template.thumbnail}
                alt={template.name}
                className={`w-full h-32 object-cover transition-transform duration-500 ${selectedTemplate?.id === template.id ? 'scale-105' : 'group-hover:scale-105'}`}
              />
            </div>
            <h3 className={`font-bold text-lg mb-2 ${selectedTemplate?.id === template.id ? 'text-brand-gold' : 'text-white'}`}>
              {template.name}
            </h3>
            <p className="text-sm text-gray-400 mb-4 h-10 overflow-hidden">
              {template.description}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs text-brand-gold font-bold uppercase tracking-wider bg-brand-dark px-2 py-1 rounded border border-brand-gold/20">
                {template.genre}
              </span>
              <span className="text-xs text-brand-gold/80 flex items-center gap-1">
                ⭐ {template.popularity}
              </span>
            </div>
            
            {/* Selection Indicator */}
            {selectedTemplate?.id === template.id && (
              <div className="absolute top-4 right-4 bg-brand-gold text-brand-dark w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg">
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoryTemplateSelector;
