// src/types/aiStudio.ts

// =============================================
// AI Studio – Selfie with VJ Feature Types
// =============================================

/** The current stage of the selfie generation workflow */
export type AIStudioState =
  | 'IDLE'        // waiting for user to upload
  | 'PREVIEWING'  // user picked an image, confirming before submit
  | 'GENERATING'  // waiting for backend / AI to return result
  | 'SUCCESS'     // generated image ready
  | 'ERROR';      // something went wrong

/** Generation quota returned by the backend */
export interface SelfieQuota {
  used: number;
  limit: number;
  remaining: number;
  resets_at: string | null; // ISO timestamp
}

/** Payload sent to /api/ai-studio/generate */
export interface GenerateSelfieRequest {
  /** The selfie file (multipart upload – handled by service) */
  file: File;
}

/** A single generation result returned by the backend */
export interface GeneratedSelfie {
  id: string | number;
  /** URL of the generated image (watermarked for free users) */
  image_url: string;
  /** Whether the current user has the watermark removed */
  is_watermark_removed: boolean;
  /** ISO timestamp */
  created_at: string;
  /** How long (seconds) the URL stays valid */
  expires_in?: number;
}

/** Full backend response wrapped in { success, data } */
export interface GenerateSelfieResponse {
  success: boolean;
  message?: string;
  data: GeneratedSelfie;
  quota?: SelfieQuota;
}

/** Error shape returned when rate-limited */
export interface SelfieRateLimitError {
  message: string;
  remaining: number;
  resets_at: string;
}
