// StationsMap.jsx
import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { MapPin, Zap, Loader, AlertCircle, RefreshCw } from 'lucide-react';

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
    zoomControl: true,
    gestureHandling: 'greedy',
    minZoom: 6,
    maxZoom: 18,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
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
          animation: window.google.maps.Animation.DROP,
          icon: {
            url: station.isActive 
              ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="16" fill="#84cc16" stroke="white" stroke-width="3"/>
                  <text x="18" y="24" text-anchor="middle" fill="white" font-size="16" font-weight="bold">⚡</text>
                </svg>
              `)
              : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="16" fill="#ef4444" stroke="white" stroke-width="3"/>
                  <text x="18" y="24" text-anchor="middle" fill="white" font-size="16" font-weight="bold">⚡</text>
                </svg>
              `),
            scaledSize: new window.google.maps.Size(36, 36),
            anchor: new window.google.maps.Point(18, 18)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-4 max-w-xs">
              <div class="flex items-start gap-3 mb-3">
                <div class="w-10 h-10 ${station.isActive ? 'bg-lime-500' : 'bg-red-500'} rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-white text-lg">⚡</span>
                </div>
                <div>
                  <h3 class="font-bold text-teal-900 text-base mb-1">${station.location}</h3>
                  <span class="inline-block px-2 py-1 text-xs rounded-full ${station.isActive ? 'bg-lime-100 text-lime-700' : 'bg-red-100 text-red-700'} font-medium">
                    ${station.isActive ? '● Active' : '● Inactive'}
                  </span>
                </div>
              </div>
              <div class="space-y-2 text-sm border-t border-gray-200 pt-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Type:</span>
                  <span class="font-medium text-teal-800">${station.type || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Available Slots:</span>
                  <span class="font-bold text-lime-600">${station.availableSlots || 0}</span>
                </div>
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

      // Prevent over-zoom after fitBounds
      const listener = window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        const maxAutoZoom = 14;
        if (map.getZoom() > maxAutoZoom) {
          map.setZoom(maxAutoZoom);
        }
      });

      // Cleanup the one-time listener if effect re-runs quickly
      setTimeout(() => {
        window.google.maps.event.removeListener(listener);
      }, 2000);
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
        className="bg-gradient-to-br from-teal-100 to-lime-100 animate-pulse rounded-xl flex items-center justify-center border-2 border-teal-200 shadow-lg"
        style={{ height }}
      >
        <div className="text-center">
          <Loader className="animate-spin h-10 w-10 text-teal-600 mx-auto mb-3" />
          <p className="text-teal-700 font-medium">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div 
        className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center border-2 border-red-200 shadow-lg"
        style={{ height }}
      >
        <div className="text-center p-6">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
          <p className="font-semibold text-red-800 text-lg mb-1">Error loading map</p>
          <p className="text-sm text-red-600 mb-4">Please check your API key and try again</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-5 rounded-lg text-sm transition-all duration-300 shadow-lg hover:shadow-red-500/30 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeCount = stations.filter(s => s.isActive).length;
  const inactiveCount = stations.filter(s => !s.isActive).length;

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-4 bg-gradient-to-r from-teal-50 to-lime-50 border border-teal-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-teal-900 mb-1">Charging Stations Map</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-teal-700 font-medium">
                {stations.length} station{stations.length !== 1 ? 's' : ''} found
              </span>
              <span className="inline-flex items-center gap-1.5 bg-lime-100 text-lime-700 px-3 py-1 rounded-full font-medium">
                <Zap className="w-3.5 h-3.5" />
                {activeCount} active
              </span>
              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {inactiveCount} inactive
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border-2 border-teal-200 shadow-xl">
        <div ref={mapRef} className="w-full" style={{ height }} />
      </div>
      
      {/* Legend & Selected Station */}
      <div className="mt-4 bg-white border border-teal-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-lime-500 rounded-full shadow-sm flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-teal-900 font-medium">Active Stations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full shadow-sm flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-teal-900 font-medium">Inactive Stations</span>
          </div>
          {selectedStation && (
            <div className="ml-auto flex items-center gap-2 bg-lime-50 text-lime-700 px-3 py-1.5 rounded-lg border border-lime-200">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold text-sm">Selected: {selectedStation.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationsMap;