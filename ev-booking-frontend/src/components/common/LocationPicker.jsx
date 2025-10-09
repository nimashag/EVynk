import { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, Navigation, Loader } from 'lucide-react';

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

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="h-64 sm:h-80 md:h-96 bg-gradient-to-br from-teal-100 to-lime-100 animate-pulse rounded-xl flex flex-col items-center justify-center gap-3 border border-teal-200">
            <Loader className="w-8 h-8 text-teal-600 animate-spin" />
            <span className="text-teal-700 font-medium">Loading map...</span>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="h-64 sm:h-80 md:h-96 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex flex-col items-center justify-center gap-3 border border-red-200">
            <MapPin className="w-8 h-8 text-red-600" />
            <span className="text-red-600 font-medium">Error loading map</span>
          </div>
        );
      default:
        return <div ref={mapRef} className="h-64 sm:h-80 md:h-96 w-full rounded-xl shadow-lg" />;
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
              title: 'Selected Location',
              animation: window.google.maps.Animation.DROP
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
        title: 'Selected Location',
        animation: window.google.maps.Animation.DROP
      });
      setMarker(newMarker);
    }
  }, [initialLocation, map]);

  return (
    <div className="space-y-4">
      {/* Instruction Card */}
      <div className="bg-gradient-to-r from-teal-50 to-lime-50 border border-teal-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <Navigation className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-teal-900 mb-1">Select Location</h3>
            <p className="text-sm text-teal-700">
              Click anywhere on the map to pin your location in Sri Lanka. You can drag the marker to adjust.
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border-2 border-teal-200 shadow-xl">
        <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={['places']} render={render} />
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="bg-gradient-to-r from-lime-50 to-teal-50 border-2 border-lime-300 rounded-xl p-4 sm:p-5 shadow-lg transform transition-all duration-300 hover:shadow-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <MapPin className="w-5 h-5 text-teal-900" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-teal-900 mb-2 flex items-center gap-2">
                <span>📍 Selected Location</span>
              </div>
              <div className="text-sm sm:text-base text-teal-800 font-medium mb-2 break-words">
                {selectedLocation.address}
              </div>
              <div className="inline-flex items-center gap-2 text-xs text-teal-600 bg-white/60 px-3 py-1.5 rounded-full">
                <span className="font-mono">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;