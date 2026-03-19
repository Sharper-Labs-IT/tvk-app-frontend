import axiosClient from '../api/axiosClient';
import { 
    type UsageStatusResponse, 
    type GenerateSelfieResponse, 
    type MySelfiesResponse, 
    type FanSelfie, 
    type ToggleVisibilityResponse,
    type PublicFeedResponse
} from '../types/fanSelfie';

export const fanSelfieService = {
    // Get paginated public selfies feed. No authentication required.
    getPublicFeed: async (limit: number = 12, page: number = 1): Promise<PublicFeedResponse> => {
        const response = await axiosClient.get<PublicFeedResponse>(`/fan-selfies/public-feed?limit=${limit}&page=${page}`);
        return response.data;
    },

    // Check if user is a Super Fan member and how many selfies they have generated today.
    checkUsageStatus: async (): Promise<UsageStatusResponse> => {
        const response = await axiosClient.get<UsageStatusResponse>('/fan-selfies/usage-status');
        return response.data;
    },

    // Generate a new AI fan selfie. Must be a Super Fan member.
    generateSelfie: async (photoFile: File): Promise<GenerateSelfieResponse> => {
        const formData = new FormData();
        formData.append('photo', photoFile);

        // Explicitly unset Content-Type so the browser automatically sets it with the boundary
        const response = await axiosClient.post<GenerateSelfieResponse>('/fan-selfies/generate', formData, {
            headers: {
                'Content-Type': undefined,
            } as any, // Cast to any to bypass strict type checking if necessary
        });
        return response.data;
    },

    // Get all selfies belonging to the authenticated user.
    getMySelfies: async (): Promise<MySelfiesResponse> => {
        const response = await axiosClient.get<MySelfiesResponse>('/fan-selfies/my-selfies');
        return response.data;
    },

    // Get a single selfie by ID.
    getSelfieById: async (selfieId: number): Promise<{ status: string; data: FanSelfie }> => {
        const response = await axiosClient.get(`/fan-selfies/${selfieId}`);
        return response.data;
    },

    // Toggle a selfie between public and private. Owner only.
    toggleVisibility: async (selfieId: number): Promise<ToggleVisibilityResponse> => {
        const response = await axiosClient.patch<ToggleVisibilityResponse>(`/fan-selfies/${selfieId}/visibility`);
        return response.data;
    },

    // Delete a selfie. Owner only.
    deleteSelfie: async (selfieId: number): Promise<{ status: string; message: string }> => {
        const response = await axiosClient.delete(`/fan-selfies/${selfieId}`);
        return response.data;
    },
};
