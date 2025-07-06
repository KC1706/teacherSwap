
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  currentLat?: number;
  currentLng?: number;
  title?: string;
}

export function LocationPicker({ onLocationSelect, currentLat, currentLng, title = "Select Location" }: LocationPickerProps) {
  const [lat, setLat] = useState<string>(currentLat?.toString() || "");
  const [lng, setLng] = useState<string>(currentLng?.toString() || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude.toString());
        setLng(longitude.toString());
        onLocationSelect(latitude, longitude);
        setIsLoading(false);
        toast({
          title: "Location captured",
          description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
      },
      (error) => {
        setIsLoading(false);
        toast({
          title: "Location error",
          description: "Could not get current location. Please enter coordinates manually.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleManualSubmit = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      toast({
        title: "Invalid coordinates",
        description: "Please enter valid latitude and longitude values",
        variant: "destructive",
      });
      return;
    }

    if (latitude < -90 || latitude > 90) {
      toast({
        title: "Invalid latitude",
        description: "Latitude must be between -90 and 90",
        variant: "destructive",
      });
      return;
    }

    if (longitude < -180 || longitude > 180) {
      toast({
        title: "Invalid longitude",
        description: "Longitude must be between -180 and 180",
        variant: "destructive",
      });
      return;
    }

    onLocationSelect(latitude, longitude);
    toast({
      title: "Location set",
      description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="text-sm font-medium">
              Latitude
            </label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="25.5941"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="longitude" className="text-sm font-medium">
              Longitude
            </label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="85.1376"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={getCurrentLocation} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {isLoading ? "Getting Location..." : "Use Current Location"}
          </Button>
          <Button onClick={handleManualSubmit} className="flex-1">
            Set Location
          </Button>
        </div>
        
        {lat && lng && (
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <strong>Preview:</strong> {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
            <br />
            <a 
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View on Google Maps
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
