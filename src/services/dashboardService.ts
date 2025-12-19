import api from '../utils/api';
import type {
  DashboardData,
  LaravelPagination,
  User,
  Content,
  Game,
  ActivityItem,
} from '../types/dashboard';

export const dashboardService = {
  getStats: async (): Promise<DashboardData> => {
    try {
      // FIX: Added '/v1' to all paths to match your api.php
      const [usersRes, contentRes, gamesRes] = await Promise.all([
        api.get<{ users: LaravelPagination<User> }>('/v1/admin/users'),
        api.get<{ contents: LaravelPagination<Content> }>('/v1/contents'),
        api.get<{ games: LaravelPagination<Game> }>('/v1/admin/games'),
      ]);

      const users = usersRes.data.users;
      const contents = contentRes.data.contents;
      const games = gamesRes.data.games || { total: 0, data: [] };

      // --- Calculate Recent Activity ---

      // 1. Map Users to Activity Items
      const userActivities: ActivityItem[] = users.data.slice(0, 5).map((u) => ({
        id: `user-${u.id}`,
        message: `New member joined: ${u.name}`,
        time: u.created_at,
        type: 'user',
      }));

      // 2. Map Content to Activity Items
      const contentActivities: ActivityItem[] = contents.data.slice(0, 5).map((c) => ({
        id: `content-${c.id}`,
        message: `New ${c.type} uploaded: ${c.title}`,
        time: c.created_at,
        type: 'content',
      }));

      // 3. Combine and Sort by Date (Newest first)
      const allActivities = [...userActivities, ...contentActivities]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

      return {
        totalMembers: users.total,
        totalPosts: contents.total,
        totalGames: games.total || 0,
        recentActivities: allActivities,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      throw error;
    }
  },
};
