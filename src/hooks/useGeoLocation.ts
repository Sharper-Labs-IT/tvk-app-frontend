import { useState, useEffect } from 'react';

interface GeoLocation {
  country: string;
  countryCode: string; // ISO 2-letter code (e.g., 'IN', 'US')
  loading: boolean;
  error: string | null;
}

export const useGeoLocation = () => {
  const [location, setLocation] = useState<GeoLocation>({
    country: '',
    countryCode: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check if we already have the location in session storage to avoid API calls on every page load
    const cachedLocation = sessionStorage.getItem('user_geo_location');
    if (cachedLocation) {
      setLocation(JSON.parse(cachedLocation));
      return;
    }

    const fetchLocation = async () => {
      try {
        // Using ipapi.co for country detection
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
            throw new Error('Failed to fetch location');
        }
        const data = await response.json();
        
        const locationData = {
          country: data.country_name,
          countryCode: data.country_code,
          loading: false,
          error: null,
        };

        setLocation(locationData);
        sessionStorage.setItem('user_geo_location', JSON.stringify(locationData));
      } catch (err) {
        console.error('Error fetching location:', err);
        // Fallback or just stop loading
        setLocation((prev) => ({ ...prev, loading: false, error: 'Failed to detect location' }));
      }
    };

    fetchLocation();
  }, []);

  return location;
};
