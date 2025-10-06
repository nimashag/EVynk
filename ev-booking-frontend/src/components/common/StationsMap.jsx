// StationsMap.jsx
import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

const StationsMap = ({ stations = [], height = '400px', onStationClick }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  
  // Use geometry library for distance calculations
  const { isLoaded, loadError } = useGoogleMaps(['geometry', 'places']);

  const sriLankaBounds = {
    north: 9.8,
    south: 5.9,
    east: 81.9,
    west: 79.7
  };

  const mapOptions = {
    center: { lat: 7.8731, lng: 80.7718 },
    zoom: 8,
    restriction: {
      latLngBounds: sriLankaBounds,
      strictBounds: true,
    },
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current && isLoaded && !map && window.google?.maps) {
      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
    }
  }, [isLoaded, map]);

  // Update markers when map or stations change
  useEffect(() => {
    if (!map || !isLoaded || !window.google?.maps) return;

    // Clear existing markers
    markers.forEach(marker => {
      marker.setMap(null);
      // Remove all listeners
      window.google.maps.event.clearInstanceListeners(marker);
    });

    const newMarkers = stations
      .filter(station => station.lat && station.lng)
      .map(station => {
        const marker = new window.google.maps.Marker({
          position: { 
            lat: parseFloat(station.lat), 
            lng: parseFloat(station.lng) 
          },
          map,
          title: station.location,
          icon: {
            url: station.isActive 
              ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#10B981" stroke="white" stroke-width="2"/>
                  <text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold">⚡</text>
                </svg>
              `)
              : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#EF4444" stroke="white" stroke-width="2"/>
                  <text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold">⚡</text>
                </svg>
              `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-gray-900 text-base mb-2">${station.location}</h3>
              <div class="space-y-1 text-sm">
                <p class="text-gray-600"><span class="font-medium">Type:</span> ${station.type || 'N/A'}</p>
                <p class="text-gray-600"><span class="font-medium">Available Slots:</span> ${station.availableSlots || 0}</p>
                <p class="${station.isActive ? 'text-green-600' : 'text-red-600'} font-medium">
                  ${station.isActive ? '🟢 Active' : '🔴 Inactive'}
                </p>
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          // Close other info windows
          markers.forEach(m => {
            if (m.infoWindow) m.infoWindow.close();
          });
          
          infoWindow.open(map, marker);
          setSelectedStation(station);
          if (onStationClick) {
            onStationClick(station);
          }
        });

        // Store reference to info window for cleanup
        marker.infoWindow = infoWindow;
        return marker;
      });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds, 50); // 50px padding
    }

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => {
        if (marker.infoWindow) {
          marker.infoWindow.close();
        }
        marker.setMap(null);
        window.google.maps.event.clearInstanceListeners(marker);
      });
    };
  }, [map, stations, isLoaded, onStationClick]);

  // Loading state
  if (!isLoaded) {
    return (
      <div 
        className="bg-gray-200 animate-pulse rounded-lg flex items-center justify-center border border-gray-300"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div 
        className="bg-red-100 rounded-lg flex items-center justify-center text-red-600 border border-red-300"
        style={{ height }}
      >
        <div className="text-center">
          <p className="font-medium">Error loading map</p>
          <p className="text-sm mt-1">Please check your API key and try again</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Charging Stations Map</h3>
        <p className="text-sm text-gray-600">
          {stations.length} station{stations.length !== 1 ? 's' : ''} found • 
          <span className="text-green-600 ml-1">
            {stations.filter(s => s.isActive).length} active
          </span>
          <span className="text-red-600 ml-2">
            {stations.filter(s => !s.isActive).length} inactive
          </span>
        </p>
      </div>
      
      <div ref={mapRef} className="w-full rounded-lg border border-gray-300" style={{ height }} />
      
      <div className="mt-4 flex items-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span>Active Stations</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span>Inactive Stations</span>
        </div>
        {selectedStation && (
          <div className="ml-auto text-blue-600 font-medium">
            Selected: {selectedStation.location}
          </div>
        )}
      </div>
    </div>
  );
};

export default StationsMap;