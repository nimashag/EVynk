import { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const LocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);

  // Sri Lanka bounds to restrict map view
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
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return <div className="h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">Loading map...</div>;
      case Status.FAILURE:
        return <div className="h-64 bg-red-100 rounded-lg flex items-center justify-center text-red-600">Error loading map</div>;
      default:
        return <div ref={mapRef} className="h-64 w-full rounded-lg" />;
    }
  };

  useEffect(() => {
    // Wait until the Google Maps script is ready, then initialize the map once
    const id = setInterval(() => {
      if (!map && mapRef.current && window.google?.maps) {
        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);

        newMap.addListener('click', (event) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          if (lat >= sriLankaBounds.south && lat <= sriLankaBounds.north &&
              lng >= sriLankaBounds.west && lng <= sriLankaBounds.east) {

            if (marker) marker.setMap(null);

            const newMarker = new window.google.maps.Marker({
              position: { lat, lng },
              map: newMap,
              draggable: true,
              title: 'Selected Location'
            });

            setMarker(newMarker);

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              const locationData =
                status === 'OK' && results?.[0]
                  ? {
                      lat,
                      lng,
                      address: results[0].formatted_address,
                      placeId: results[0].place_id
                    }
                  : {
                      lat,
                      lng,
                      address: fallbackAddress,
                      placeId: undefined
                    };
              setSelectedLocation(locationData);
              onLocationSelect(locationData);
            });

            newMarker.addListener('dragend', (event) => {
              const newLat = event.latLng.lat();
              const newLng = event.latLng.lng();

              geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
                const fallbackAddress = `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
                const locationData =
                  status === 'OK' && results?.[0]
                    ? {
                        lat: newLat,
                        lng: newLng,
                        address: results[0].formatted_address,
                        placeId: results[0].place_id
                      }
                    : {
                        lat: newLat,
                        lng: newLng,
                        address: fallbackAddress,
                        placeId: undefined
                      };
                setSelectedLocation(locationData);
                onLocationSelect(locationData);
              });
            });
          }
        });

        clearInterval(id);
      }
    }, 100);

    return () => clearInterval(id);
  }, [map, marker]);

  useEffect(() => {
    if (map && initialLocation) {
      // Set initial location if provided
      const position = { lat: initialLocation.lat, lng: initialLocation.lng };
      map.setCenter(position);
      map.setZoom(15);
      
      if (marker) {
        marker.setMap(null);
      }
      
      const newMarker = new window.google.maps.Marker({
        position,
        map,
        draggable: true,
        title: 'Selected Location'
      });
      setMarker(newMarker);
    }
  }, [initialLocation, map]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Click on the map to select a location in Sri Lanka
      </div>
      <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places']} render={render} />
      {selectedLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-800">Selected Location:</div>
          <div className="text-sm text-blue-700">{selectedLocation.address}</div>
          <div className="text-xs text-blue-600">
            Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
