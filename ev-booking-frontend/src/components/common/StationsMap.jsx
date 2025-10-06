import { useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const StationsMap = ({ stations = [], height = '400px' }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Sri Lanka bounds
  const sriLankaBounds = {
    north: 9.8,
    south: 5.9,
    east: 81.9,
    west: 79.7
  };

  const mapOptions = {
    center: { lat: 7.8731, lng: 80.7718 }, // Center of Sri Lanka
    zoom: 8,
    restriction: {
      latLngBounds: sriLankaBounds,
      strictBounds: true,
    },
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
  };

  useEffect(() => {
    if (mapRef.current && !map && window.google?.maps) {
      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
    }
  }, [map]);

  useEffect(() => {
    if (!map || !window.google?.maps) return;

    markers.forEach(marker => marker.setMap(null));

    const newMarkers = stations
      .filter(station => station.lat && station.lng)
      .map(station => {
        const marker = new window.google.maps.Marker({
          position: { lat: station.lat, lng: station.lng },
          map,
          title: station.location,
          icon: {
            url: station.isActive 
              ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#10B981" stroke="white" stroke-width="2"/>
                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">⚡</text>
                </svg>
              `)
              : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#EF4444" stroke="white" stroke-width="2"/>
                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">⚡</text>
                </svg>
              `)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">${station.location}</h3>
              <p class="text-sm text-gray-600">Type: ${station.type}</p>
              <p class="text-sm text-gray-600">Available Slots: ${station.availableSlots}</p>
              <p class="text-sm ${station.isActive ? 'text-green-600' : 'text-red-600'}">
                Status: ${station.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          `
        });

        marker.addListener('click', () => infoWindow.open(map, marker));
        return marker;
      });

    setMarkers(newMarkers);

    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    }
  }, [map, stations]);

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div 
            className="bg-gray-200 animate-pulse rounded-lg flex items-center justify-center"
            style={{ height }}
          >
            Loading map...
          </div>
        );
      case Status.FAILURE:
        return (
          <div 
            className="bg-red-100 rounded-lg flex items-center justify-center text-red-600"
            style={{ height }}
          >
            Error loading map
          </div>
        );
      default:
        return <div ref={mapRef} className="w-full rounded-lg" style={{ height }} />;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Charging Stations Map</h3>
        <p className="text-sm text-gray-600">
          {stations.length} station{stations.length !== 1 ? 's' : ''} found
        </p>
      </div>
      <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places']} render={render} />
      <div className="mt-4 flex items-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span>Active Stations</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span>Inactive Stations</span>
        </div>
      </div>
    </div>
  );
};

export default StationsMap;