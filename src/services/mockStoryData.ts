/**
 * Mock Story Data for Frontend-Only Testing
 * 
 * This file provides mock data to test the Story feature without backend.
 * To use: Set USE_MOCK_DATA=true in .env or localStorage
 */

import type { 
  Story, 
  StoryStats, 
  StoryTemplate, 
  GenerateStoryResponse 
} from '../types/story';

// Mock Stories
export const mockStories: Story[] = [
  {
    _id: '1',
    userId: '1',
    userName: 'Shadow Master',
    userAvatar: 'https://ui-avatars.com/api/?name=Shadow+Master&background=8B5CF6&color=fff',
    title: 'The Shadow Knight\'s Quest',
    content: `In a realm where darkness threatened to consume all light, a lone warrior known as the Shadow Knight emerged from the forgotten lands of Eldoria.

With a blade forged from starlight and a heart hardened by countless battles, the Shadow Knight embarked on an epic journey to restore balance to the world. Along the way, they encountered mystical creatures, ancient prophecies, and challenges that tested not just their strength, but their very soul.

Through valleys of shadow and peaks of light, the hero pressed on, driven by an unwavering determination to protect those who could not protect themselves. Each step brought new allies and new enemies, but the Shadow Knight never wavered.

In the final confrontation atop the Crimson Citadel, face to face with the source of all darkness, the true test began. Not a test of might, but of character. Would vengeance rule the day, or would mercy light the path forward?

The choice made in that moment would echo through eternity, shaping not just one world, but countless others beyond.`,
    genre: 'adventure',
    mood: 'epic',
    length: 'medium',
    characterName: 'Shadow Knight',
    coverImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800',
    likes: 42,
    likedBy: [],
    comments: [
      {
        _id: 'c1',
        userId: '2',
        userName: 'Story Lover',
        userAvatar: 'https://ui-avatars.com/api/?name=Story+Lover&background=EC4899&color=fff',
        content: 'Amazing story! The plot twist at the end was incredible!',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: 'c2',
        userId: '3',
        userName: 'Epic Reader',
        userAvatar: 'https://ui-avatars.com/api/?name=Epic+Reader&background=3B82F6&color=fff',
        content: 'Love the character development! Shadow Knight is such a cool protagonist.',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ],
    views: 156,
    shares: 12,
    isPublic: true,
    isFeatured: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tags: ['adventure', 'hero', 'quest', 'epic'],
    scenes: [
      {
        id: 's1',
        sceneNumber: 1,
        title: 'The Awakening',
        content: 'In the depths of the forgotten forest, the Shadow Knight opened their eyes for the first time...',
        imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800'
      },
      {
        id: 's2',
        sceneNumber: 2,
        title: 'The First Battle',
        content: 'Under the crimson moon, enemies surrounded the lone warrior. It was time to fight.',
        imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800'
      }
    ]
  },
  {
    _id: '2',
    userId: '1',
    userName: 'Shadow Master',
    userAvatar: 'https://ui-avatars.com/api/?name=Shadow+Master&background=8B5CF6&color=fff',
    title: 'Starship Destiny',
    content: `Commander Nova stood on the bridge of the Destiny, watching stars blur past at impossible speeds. Three years into their mission to find a new home for humanity, and they were no closer to their goal.

"Captain, we're detecting an anomaly ahead," called out the navigator. On the viewscreen, a swirling vortex of energy materialized, unlike anything in their databases.

The crew held their breath as Nova made the decision that would change everything. "Take us in."

What they found beyond the anomaly was a civilization that shouldn't exist, technology that defied physics, and a mystery that spanned galaxies. The journey home would have to wait—if they could survive what came next.`,
    genre: 'sci-fi',
    mood: 'suspenseful',
    length: 'short',
    characterName: 'Commander Nova',
    coverImage: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
    likes: 28,
    likedBy: [],
    comments: [],
    views: 89,
    shares: 7,
    isPublic: true,
    isFeatured: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    tags: ['sci-fi', 'space', 'adventure'],
    scenes: []
  },
  {
    _id: '3',
    userId: '1',
    userName: 'Shadow Master',
    userAvatar: 'https://ui-avatars.com/api/?name=Shadow+Master&background=8B5CF6&color=fff',
    title: 'The Dragon\'s Heart',
    content: `In the kingdom of Aethermoor, dragons were thought to be extinct. But when young mage Lyra discovered an ancient egg hidden in the palace catacombs, everything changed.

The dragon that hatched was unlike any from the old tales—small, silver-scaled, with eyes that held ancient wisdom. It bonded with Lyra instantly, sharing visions of a time when dragons and humans lived in harmony.

But dark forces were stirring. The same enemies that drove dragons to extinction were returning, and only Lyra and her dragon could stop them. Their journey would take them across magical realms, through trials of fire and ice, to unlock the true power of the Dragon's Heart—a legendary artifact that could restore balance to the world.

As bonds deepened and powers awakened, Lyra realized the greatest magic wasn't in spells or artifacts, but in the courage to stand for what's right.`,
    genre: 'fantasy',
    mood: 'inspirational',
    length: 'medium',
    characterName: 'Lyra',
    coverImage: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=800',
    likes: 67,
    likedBy: [],
    comments: [
      {
        _id: 'c3',
        userId: '4',
        userName: 'Dragon Fan',
        userAvatar: 'https://ui-avatars.com/api/?name=Dragon+Fan&background=10B981&color=fff',
        content: 'Dragons! Love it! The bond between Lyra and the dragon is so touching.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ],
    views: 234,
    shares: 19,
    isPublic: true,
    isFeatured: false,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    tags: ['fantasy', 'dragons', 'magic', 'adventure'],
    scenes: []
  }
];

// Mock User Stats
export const mockStats: StoryStats = {
  totalStories: 3,
  totalViews: 479,
  totalLikes: 137,
  favoriteGenre: 'adventure',
  storiesThisMonth: 2,
  avgReadTime: 6
};

// Mock Templates
export const mockTemplates: StoryTemplate[] = [
  {
    id: '1',
    name: 'Hero\'s Journey',
    description: 'Classic adventure where your character becomes a legendary hero',
    genre: 'adventure',
    promptTemplate: 'Create an epic hero\'s journey story...',
    thumbnail: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400',
    popularity: 245
  },
  {
    id: '2',
    name: 'Space Odyssey',
    description: 'Journey through the cosmos discovering alien worlds',
    genre: 'sci-fi',
    promptTemplate: 'Create a space exploration story...',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400',
    popularity: 198
  },
  {
    id: '3',
    name: 'Dragon Rider',
    description: 'Bond with dragons and save the magical realm',
    genre: 'fantasy',
    promptTemplate: 'Create a dragon rider fantasy story...',
    thumbnail: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=400',
    popularity: 312
  },
  {
    id: '4',
    name: 'Mystery Manor',
    description: 'Solve the dark mystery of the haunted manor',
    genre: 'mystery',
    promptTemplate: 'Create a mystery detective story...',
    thumbnail: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=400',
    popularity: 167
  },
  {
    id: '5',
    name: 'Time Traveler',
    description: 'Journey through time to fix the past',
    genre: 'sci-fi',
    promptTemplate: 'Create a time travel story...',
    thumbnail: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400',
    popularity: 223
  },
  {
    id: '6',
    name: 'Love at First Sight',
    description: 'A heartwarming romantic tale',
    genre: 'romance',
    promptTemplate: 'Create a romantic love story...',
    thumbnail: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
    popularity: 189
  }
];

// Mock Story Generation Response
export const generateMockStory = (
  characterName: string,
  genre: string,
  mood: string
): GenerateStoryResponse => {
  const titles: Record<string, string[]> = {
    adventure: [
      `${characterName}'s Epic Quest`,
      `The Adventures of ${characterName}`,
      `${characterName} and the Lost Treasure`
    ],
    'sci-fi': [
      `${characterName}: Beyond the Stars`,
      `${characterName}'s Quantum Mission`,
      `${characterName} in Space`
    ],
    fantasy: [
      `${characterName} and the Magic Stone`,
      `The Chronicles of ${characterName}`,
      `${characterName}: The Chosen One`
    ],
    romance: [
      `${characterName}'s Heart`,
      `Love Found: ${characterName}'s Story`,
      `${characterName} and True Love`
    ],
    mystery: [
      `${characterName}: The Case of...`,
      `${characterName} Solves the Mystery`,
      `The ${characterName} Files`
    ]
  };

  const title = titles[genre]?.[Math.floor(Math.random() * 3)] || `${characterName}'s Story`;

  return {
    story: {
      _id: `generated-${Date.now()}`,
      userId: '1',
      userName: 'Current User',
      title,
      content: `This is the beginning of an ${mood} ${genre} story featuring ${characterName}.

The story unfolds in an extraordinary way, taking ${characterName} on a journey that will test their courage, wit, and determination. Along the way, they encounter challenges that seem insurmountable, allies that prove invaluable, and discoveries that change everything.

Through valleys and peaks, darkness and light, ${characterName} perseveres. Each decision shapes not just their own fate, but the destiny of all those around them. The path is treacherous, but the goal is worth every sacrifice.

In moments of doubt, ${characterName} remembers why they started this journey. The faces of those counting on them, the dreams that drive them forward, and the unshakeable belief that good will triumph over evil.

As the story reaches its climax, ${characterName} faces their greatest challenge yet. But armed with newfound strength, wisdom gained from the journey, and the support of true friends, victory is within reach.

The conclusion brings not just resolution, but transformation. ${characterName} emerges changed, stronger, ready for whatever adventures lie ahead.`,
      genre: genre as any,
      mood: mood as any,
      length: 'medium',
      characterName,
      coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800',
      likes: 0,
      likedBy: [],
      comments: [],
      views: 0,
      shares: 0,
      isPublic: false,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [genre, mood, 'generated'],
      scenes: [
        {
          id: 'scene1',
          sceneNumber: 1,
          title: 'The Beginning',
          content: `${characterName}'s journey begins in an unexpected way...`,
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
        },
        {
          id: 'scene2',
          sceneNumber: 2,
          title: 'The Challenge',
          content: `A great challenge appears before ${characterName}...`,
          imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800'
        },
        {
          id: 'scene3',
          sceneNumber: 3,
          title: 'The Victory',
          content: `${characterName} triumphs in an epic finale...`,
          imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800'
        }
      ]
    },
    scenes: [],
    estimatedReadTime: 7
  };
};

// Delay helper for realistic API simulation
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
