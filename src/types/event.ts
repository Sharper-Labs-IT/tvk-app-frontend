export interface EventMedia {
  path: string;
  url?: string; // Added by the backend controller
  type?: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  rules?: string;
  start_date: string;
  end_date: string;
  reward_points?: number;
  is_cancelled: boolean | number;
  media?: EventMedia[];
  participations_count?: number; // Added by withCount in controller
}

export interface EventFormData {
  title: string;
  description: string;
  rules: string;
  start_date: string;
  end_date: string;
  reward_points: string; // Keep as string for input, convert to number for API
  media?: File | null; // For the file upload
}
