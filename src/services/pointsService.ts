import axiosClient from '../api/axiosClient';

export interface MonthlyPointsResponse {
  current_month_points: number;
  all_time_total: number;
  month: string;
  year: number;
}

export interface PointTransaction {
  id: number;
  points: number;
  reason: string;
  created_at: string;
}

export interface PointHistoryResponse {
  data: PointTransaction[];
  current_page: number;
  last_page: number;
}

export interface TopFan {
  rank: number;
  user_id: number;
  name: string;
  nickname: string;
  country?: string;
  location?: string;
  mobile?: string;
  user?: {
    country?: string;
    location?: string;
    avatar?: string;
    mobile?: string;
  };
  avatar_url: string | null;
  month_points: number;
  transactions: number;
}

export interface FanOfMonthResponse {
  month: string;
  year: number;
  top_fans: TopFan[];
}

export const pointsService = {
  getMonthlyPoints: async (): Promise<MonthlyPointsResponse> => {
    const response = await axiosClient.get('/user/points/monthly');
    return response.data.data;
  },

  getPointHistory: async (page = 1): Promise<PointHistoryResponse> => {
    const response = await axiosClient.get(`/user/points/history?page=${page}`);
    return response.data.data;
  },

  getFanOfTheMonth: async (): Promise<FanOfMonthResponse> => {
    const response = await axiosClient.get('/user/points/fan-of-month');
    return response.data.data;
  }
};
