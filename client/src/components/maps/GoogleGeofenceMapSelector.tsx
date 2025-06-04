import { useState, useRef, useCallback, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, Circle } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Search } from "lucide-react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Define the libraries we need to load
const libraries = ["places"];

// Map container styles
const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

// Default center (Dubai)
const defaultCenter = {
  lat: 25.2048,
  lng: 55.2708,
};

// Default map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

// Circle options
const circleOptions = {
  fillColor: "rgba(66, 133, 244, 0.2)",
  fillOpacity: 0.35,
  strokeColor: "#4285F4",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  zIndex: 1,
};

// Default API key - in production, this should come from environment variables
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Show warning in development if API key is missing
if (process.env.NODE_ENV === 'development' && !DEFAULT_API_KEY) {
  console.warn('Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.');
}

interface GoogleGeofenceMapSelectorProps {
  initialLocation?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  initialRadius?: number;
  apiKey?: string;
  onGeofenceChange: (latitude: number, longitude: number, radius: number) => void;
}

export function GoogleGeofenceMapSelector({
  initialLocation = "",
  initialLatitude = defaultCenter.lat,
  initialLongitude = defaultCenter.lng,
  initialRadius = 100,
  apiKey = DEFAULT_API_KEY,
  onGeofenceChange,
}: GoogleGeofenceMapSelectorProps) {
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: libraries as any,
  });

  // State for map center, marker position, and radius
  const [center, setCenter] = useState({ lat: initialLatitude, lng: initialLongitude });
  const [markerPosition, setMarkerPosition] = useState({ lat: initialLatitude, lng: initialLongitude });
  const [radius, setRadius] = useState(initialRadius);
  
  // State for location search
  const [location, setLocation] = useState(initialLocation);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  // Reference to the map instance
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Setup Places Autocomplete
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
    },
    debounce: 300,
    cacheKey: "google-places-autocomplete",
  });
  
  // Update places autocomplete value when location changes
  useEffect(() => {
    if (location) {
      setValue(location);
    }
  }, [location, setValue]);
  
  // Callback for when the map loads
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);
  
  // Handle marker drag end
  const handleMarkerDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarkerPosition(newPosition);
      onGeofenceChange(newPosition.lat, newPosition.lng, radius);
      
      // Update location name via reverse geocoding
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          setLocation(results[0].formatted_address);
          setValue(results[0].formatted_address, false);
        }
      });
    }
  };
  
  // Handle map click to set marker position
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newPosition = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setMarkerPosition(newPosition);
      onGeofenceChange(newPosition.lat, newPosition.lng, radius);
      
      // Update location name via reverse geocoding
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          setLocation(results[0].formatted_address);
          setValue(results[0].formatted_address, false);
        }
      });
    }
  };
  
  // Handle radius change from slider
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value);
    setRadius(newRadius);
    onGeofenceChange(markerPosition.lat, markerPosition.lng, newRadius);
  };
  
  // Handle place selection from autocomplete
  const handlePlaceSelect = async (address: string) => {
    setValue(address, false);
    setLocation(address);
    clearSuggestions();
    setOpen(false);
    
    try {
      setIsGeocoding(true);
      setGeocodeError(null);
      
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      const newPosition = { lat, lng };
      
      setMarkerPosition(newPosition);
      setCenter(newPosition);
      
      // Pan the map to the new location
      if (mapRef.current) {
        mapRef.current.panTo(newPosition);
        mapRef.current.setZoom(15);
      }
      
      onGeofenceChange(newPosition.lat, newPosition.lng, radius);
    } catch (error) {
      setGeocodeError("Error finding that location. Please try again.");
      console.error("Error selecting place:", error);
    } finally {
      setIsGeocoding(false);
    }
  };
  
  // Update parent component when component mounts
  useEffect(() => {
    onGeofenceChange(markerPosition.lat, markerPosition.lng, radius);
  }, []);
  
  // Render loading state
  if (loadError) {
    return <div className="p-4 text-red-500">Error loading Google Maps</div>;
  }
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading Maps...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="mapLocation">Search Location</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {location || "Search for a location..."}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search for a location..."
                value={value}
                onValueChange={(newValue) => {
                  setValue(newValue);
                  setOpen(true);
                }}
                disabled={!ready}
              />
              <CommandList>
                <CommandEmpty>
                  {status === "ZERO_RESULTS" 
                    ? "No locations found." 
                    : "Type to search for locations..."}
                </CommandEmpty>
                <CommandGroup>
                  {status === "OK" &&
                    data.map(({ place_id, description }) => (
                      <CommandItem
                        key={place_id}
                        value={description}
                        onSelect={() => handlePlaceSelect(description)}
                      >
                        {description}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {geocodeError && <p className="text-sm text-red-500 mt-1">{geocodeError}</p>}
        {isGeocoding && <p className="text-sm text-blue-500 mt-1">Finding location...</p>}
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={14}
          options={mapOptions}
          onLoad={onMapLoad}
          onClick={handleMapClick}
        >
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
          />
          <Circle
            center={markerPosition}
            radius={radius}
            options={circleOptions}
          />
        </GoogleMap>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="radiusSlider">Geofence Radius: <strong>{radius} meters</strong></Label>
        </div>
        <Input
          id="radiusSlider"
          type="range"
          min="50"
          max="5000"
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