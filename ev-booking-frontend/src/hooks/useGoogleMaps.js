import { useState, useEffect } from 'react';

let googleMapsLoadingPromise = null;

export const useGoogleMaps = (libraries = ['places']) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    if (!googleMapsLoadingPromise) {
      googleMapsLoadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }&libraries=${libraries.join(',')}`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          if (window.google?.maps) {
            resolve(window.google.maps);
          } else {
            reject(new Error('Google Maps failed to load'));
          }
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Google Maps script'));
        };
        
        document.head.appendChild(script);
      });
    }

    googleMapsLoadingPromise
      .then(() => {
        setIsLoaded(true);
        setLoadError(null);
      })
      .catch((error) => {
        setLoadError(error);
        setIsLoaded(false);
      });

    return () => {
      // Cleanup if needed
    };
  }, [libraries.join(',')]); // Dependency on libraries array as string

  return { isLoaded, loadError };
};