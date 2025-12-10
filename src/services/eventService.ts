import api from '../utils/api';

export interface Event {
  id: number;
  title: string;
  description: string;
  rules?: string;
  start_date: string;
  end_date: string;
  reward_points: number;
  poster?: string;
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
}

export interface EventScoreboardEntry {
  user_id: number;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
}

export const eventService = {
  // GET /api/v1/events
  getAllEvents: async () => {
    const response = await api.get<Event[]>('/v1/events');
    return response.data;
  },

  // GET /api/v1/events/{id}
  getEvent: async (eventId: number) => {
    const response = await api.get<Event>(`/v1/events/${eventId}`);
    return response.data;
  },

  // POST /api/v1/events/{id}/participate
  participateInEvent: async (eventId: number, submission: string) => {
    const response = await api.post(`/v1/events/${eventId}/participate`, { submission });
    return response.data;
  },

  // GET /api/v1/events/{id}/scoreboard
  getEventScoreboard: async (eventId: number) => {
    const response = await api.get<EventScoreboardEntry[]>(`/v1/events/${eventId}/scoreboard`);
    return response.data;
  }
};
