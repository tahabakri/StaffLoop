import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Search } from "lucide-react";

// Fix for Leaflet marker icons in React
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface GeofenceMapSelectorProps {
  initialLocation?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  initialRadius?: number;
  onGeofenceChange: (latitude: number, longitude: number, radius: number) => void;
}

// Component to handle map events and marker dragging
function MapEventHandler({
  setCenter,
  center,
  radius,
  onGeofenceChange,
}: {
  setCenter: (center: [number, number]) => void;
  center: [number, number];
  radius: number;
  onGeofenceChange: (latitude: number, longitude: number, radius: number) => void;
}) {
  // Handle map click to set marker position
  useMapEvents({
    click: (e) => {
      setCenter([e.latlng.lat, e.latlng.lng]);
      onGeofenceChange(e.latlng.lat, e.latlng.lng, radius);
    },
  });

  return (
    <>
      <Marker 
        position={center}
        icon={defaultIcon}
        eventHandlers={{
          dragend: (e: any) => {
            const marker = e.target;
            const position = marker.getLatLng();
            setCenter([position.lat, position.lng]);
            onGeofenceChange(position.lat, position.lng, radius);
          },
        }}
      />
      <CircleMarker
        center={center}
        radius={Math.min(100, Math.max(5, radius / 40))} // Scale down for CircleMarker (uses pixels not meters)
        pathOptions={{ fillColor: 'blue', fillOpacity: 0.2, color: 'blue', weight: 2 }}
      />
    </>
  );
}

export function GeofenceMapSelector({
  initialLocation = "",
  initialLatitude = 25.2048, // Default to Dubai coordinates
  initialLongitude = 55.2708,
  initialRadius = 100,
  onGeofenceChange,
}: GeofenceMapSelectorProps) {
  const [center, setCenter] = useState<[number, number]>([initialLatitude, initialLongitude]);
  const [radius, setRadius] = useState<number>(initialRadius);
  const [location, setLocation] = useState<string>(initialLocation);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  
  // Geocode the location when the user submits the search
  const handleGeocodeLocation = async () => {
    if (!location.trim()) return;
    
    setIsGeocoding(true);
    setGeocodeError(null);
    
    try {
      // Using Nominatim OpenStreetMap geocoding service (free and no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setCenter(newCenter);
        onGeofenceChange(newCenter[0], newCenter[1], radius);
      } else {
        setGeocodeError("Location not found. Please try a different search term.");
      }
    } catch (error) {
      setGeocodeError("Error geocoding location. Please try again.");
      console.error("Geocoding error:", error);
    } finally {
      setIsGeocoding(false);
    }
  };
  
  // Update parent component when geofence changes
  useEffect(() => {
    onGeofenceChange(center[0], center[1], radius);
  }, [center, radius, onGeofenceChange]);

  // Create a simple radius control slider
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    onGeofenceChange(center[0], center[1], newRadius);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="mapLocation">Search Location</Label>
        <div className="flex gap-2">
          <Input
            id="mapLocation"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter a location to search"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGeocodeLocation();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleGeocodeLocation} 
            disabled={isGeocoding || !location.trim()}
            type="button"
          >
            {isGeocoding ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        {geocodeError && <p className="text-sm text-red-500 mt-1">{geocodeError}</p>}
      </div>
      
      <div className="border rounded-md overflow-hidden" style={{ height: "400px" }}>
        <MapContainer
          center={[center[0], center[1]]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapEventHandler
            setCenter={setCenter}
            center={center}
            radius={radius}
            onGeofenceChange={onGeofenceChange}
          />
        </MapContainer>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="radiusSlider">Geofence Radius: <strong>{radius} meters</strong></Label>
        </div>
        <Input
          id="radiusSlider"
          type="range"
          min="10"
          max="1000"
          step="10"
          value={radius}
          onChange={handleRadiusChange}
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          Drag the pin to adjust location. Use the slider to set the check-in radius.
        </p>
      </div>
    </div>
  );
} 