
import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import customMarker from './customMarker';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue in leaflet for Vite/ESM
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position === null ? null : (
    <Marker position={position} icon={customMarker} />
  );
};

const MapLocation = ({
  className = '',
  heightClass = 'h-[300px]',
  addButtonLabel = 'Add Location',
  captionText,
  onChange, // callback to return lat/lng
  initialPosition = null, // [lat, lng] to show initial marker
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [satellite, setSatellite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  const handleSetPosition = (pos) => {
    setPosition(pos);
    if (onChange) onChange({ lat: pos[0], lng: pos[1] });
  };

  // Update position when initialPosition changes
  React.useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  return (
    <div ref={containerRef} className={`w-full ${isFullscreen ? 'fixed inset-0 z-[2000]' : heightClass} bg-gray-100 border border-gray-300 rounded-lg relative overflow-hidden ${className}`}>
      <style>{`.leaflet-control-attribution { display: none !important; }`}</style>
      <MapContainer
        center={position || [20.5937, 78.9629]} // Centered on position or India
        zoom={position ? 13 : 5} // Zoom in if position exists
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        key={position ? `${position[0]}-${position[1]}` : 'default'} // Force re-render on position change
  whenCreated={setMapInstance}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={satellite ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />
        <LocationMarker position={position} setPosition={handleSetPosition} />
      </MapContainer>
  {/* Controls panel (top-right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        {/* Map/Satellite toggle */}
        <div className="bg-white/95 backdrop-blur rounded-md shadow flex overflow-hidden">
          <button
            type="button"
            className={`px-3 py-1 text-xs ${!satellite ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            onClick={() => setSatellite(false)}
          >
            Map
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs ${satellite ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
            onClick={() => setSatellite(true)}
          >
            Satellite
          </button>
        </div>

        {/* Zoom controls */}
        <div className="bg-white rounded-md shadow overflow-hidden">
          <button
            type="button"
            className="block w-8 h-8 leading-8 text-center text-xl hover:bg-gray-50"
            onClick={() => mapInstance?.zoomIn()}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="block w-8 h-8 leading-8 text-center text-xl hover:bg-gray-50 border-t"
            onClick={() => mapInstance?.zoomOut()}
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        {/* Geolocate current position */}
        <button
          type="button"
          className="px-2 py-2 bg-white rounded-md shadow text-xs hover:bg-gray-50"
          onClick={() => {
            if (!navigator.geolocation) return;
            navigator.geolocation.getCurrentPosition((pos) => {
              const { latitude, longitude } = pos.coords;
              handleSetPosition([latitude, longitude]);
            });
          }}
        >
          Current Location
        </button>

        {/* Fullscreen toggle */}
        <button
          type="button"
          className="px-2 py-2 bg-white rounded-md shadow text-xs hover:bg-gray-50"
          onClick={() => setIsFullscreen((v) => !v)}
        >
          {isFullscreen ? 'Exit Full Map' : 'Full Map'}
        </button>
      </div>
      {captionText && (
        <div className="absolute bottom-4 left-4 text-sm text-gray-600 z-[1000]">
          {captionText}
        </div>
      )}
  {/* Latitude and longitude display removed as per user request */}
    </div>
  );
};

export default MapLocation;
 
