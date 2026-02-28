// src/services/aiStudioService.ts

import axiosClient from '../api/axiosClient';
import type {
  GenerateSelfieRequest,
  GenerateSelfieResponse,
  SelfieQuota,
} from '../types/aiStudio';

// ==============================================
// AI Studio Service – Selfie with VJ Feature
// ==============================================

/**
 * Upload a selfie and generate a VJ-composite image.
 *
 * Sends a multipart/form-data POST to:
 *   POST /api/ai-studio/selfie/generate
 *
 * Long-running request (AI can take up to 60 s).
 * Progress callback reports upload progress only (0-100).
 */
export const generateSelfiWithVJ = async (
  request: GenerateSelfieRequest,
  onUploadProgress?: (percent: number) => void
): Promise<GenerateSelfieResponse> => {
  const formData = new FormData();
  formData.append('selfie', request.file);

  const response = await axiosClient.post<GenerateSelfieResponse>(
    '/ai-studio/selfie/generate',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000, // 2 minutes
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(pct);
        }
      },
    }
  );

  return response.data;
};

/**
 * Fetch the current user's selfie-generation quota.
 *
 *   GET /api/ai-studio/selfie/quota
 */
export const fetchSelfieQuota = async (): Promise<SelfieQuota> => {
  const response = await axiosClient.get<{ success: boolean; data: SelfieQuota }>(
    '/ai-studio/selfie/quota'
  );
  return response.data.data;
};

/**
 * Fetch the list of previously generated selfies for the logged-in user.
 *
 *   GET /api/ai-studio/selfie/history
 */
export const fetchSelfieHistory = async () => {
  const response = await axiosClient.get('/ai-studio/selfie/history');
  return response.data;
};

/**
 * Request a watermark-free download for Super Fan members.
 *
 *   GET /api/ai-studio/selfie/:id/download
 */
export const downloadCleanSelfie = async (id: string | number): Promise<Blob> => {
  const response = await axiosClient.get(`/ai-studio/selfie/${id}/download`, {
    responseType: 'blob',
  });
  return response.data as Blob;
};
