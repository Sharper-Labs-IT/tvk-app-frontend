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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        ✨ Story Templates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              selectedTemplate?.id === template.id
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
            }`}
          >
            <div className="mb-3">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {template.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                {template.genre}
              </span>
              <span className="text-xs text-gray-500">
                ⭐ {template.popularity}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StoryTemplateSelector;
