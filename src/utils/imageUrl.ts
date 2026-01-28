
/**
 * Helper to construct full image URLs from backend paths.
 * Handles correctly stripping '/api' suffixes from the base URL if present.
 */
export const getFullImageUrl = (path?: string | null): string => {
    if (!path) return '';

    // Clean whitespace
    path = path.trim();
    
    // If it's already a full URL or data URI, return as is
    if (path.startsWith('http') || path.startsWith('https') || path.startsWith('data:')) {
      return path;
    }
  
    // Get base URL from environment
    let baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  
    // Common Issue Fix: If VITE_API_BASE_URL includes '/api' (e.g., http://localhost:8000/api/v1),
    // we usually want the root domain for images (http://localhost:8000).
    if (baseUrl.includes('/api')) {
      baseUrl = baseUrl.substring(0, baseUrl.indexOf('/api'));
    }
  
    // Remove trailing slash from base if present
    baseUrl = baseUrl.replace(/\/$/, '');
  
    // Remove leading slash from path if present
    let cleanPath = path.replace(/^\//, '');

    // AUTO-FIX: Prepend 'storage/' if missing.
    // This assumes backend stores uploads in 'storage/app/public' linked to 'public/storage'
    // and returns filenames relative to the storage root or stripped of 'storage/'.
    if (!cleanPath.startsWith('storage/') && !cleanPath.startsWith('assets/')) {
        cleanPath = `storage/${cleanPath}`;
    }
  
    return `${baseUrl}/${cleanPath}`;
  };
  