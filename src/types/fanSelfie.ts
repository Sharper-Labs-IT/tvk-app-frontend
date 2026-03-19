export interface UsageStatus {
    used: number;
    limit: number;
    remaining: number;
    resets_at: string;
}

export interface UsageStatusResponse {
    status: string;
    data: {
        is_super_fan: boolean;
        usage: UsageStatus;
    };
}

export interface FanSelfie {
    id: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    is_public: boolean;
    generated_image_url: string | null;
    user_image_url: string | null;
    created_at: string;
    error_message: string | null;
}

export interface GenerateSelfieResponse {
    status: string;
    message: string;
    data: FanSelfie;
    usage: UsageStatus;
}

export interface MySelfiesResponse {
    status: string;
    data: FanSelfie[];
    usage: UsageStatus;
}

export interface PublicFeedResponse {
    status: string;
    data: {
        data: FanSelfie[]; // Pagination wrapper usually has data property
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface ToggleVisibilityResponse {
    status: string;
    message: string;
    is_public: boolean;
    data: FanSelfie;
}
