
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, School, Home, Navigation, Edit } from "lucide-react";
import { LocationPicker } from "@/components/location/location-picker";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Teacher } from "@shared/schema";

interface LocationSettingsProps {
  teacher: Teacher;
}

export function LocationSettings({ teacher }: LocationSettingsProps) {
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [showHomePicker, setShowHomePicker] = useState(false);
  const [showPreferredPicker, setShowPreferredPicker] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateLocationMutation = useMutation({
    mutationFn: async (data: Partial<Teacher>) => {
      const response = await apiRequest('PUT', `/api/teachers/${teacher.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location updated",
        description: "Your location has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setShowSchoolPicker(false);
      setShowHomePicker(false);
      setShowPreferredPicker(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update location",
        variant: "destructive",
      });
    },
  });

  const handleSchoolLocationSelect = (lat: number, lng: number) => {
    updateLocationMutation.mutate({
      currentSchoolLatitude: lat.toString(),
      currentSchoolLongitude: lng.toString(),
    });
  };

  const handleHomeLocationSelect = (lat: number, lng: number) => {
    updateLocationMutation.mutate({
      homeLatitude: lat.toString(),
      homeLongitude: lng.toString(),
    });
  };

  const handlePreferredLocationSelect = (lat: number, lng: number) => {
    updateLocationMutation.mutate({
      preferredLocationLatitude: lat.toString(),
      preferredLocationLongitude: lng.toString(),
    });
  };

  const hasSchoolLocation = teacher.currentSchoolLatitude && teacher.currentSchoolLongitude;
  const hasHomeLocation = teacher.homeLatitude && teacher.homeLongitude;
  const hasPreferredLocation = teacher.preferredLocationLatitude && teacher.preferredLocationLongitude;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Location Settings for Precise Matching
        </CardTitle>
        <p className="text-sm text-gray-600">
          Add precise coordinates to improve transfer matching accuracy. This helps find nearby teachers more effectively.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current School Location */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Current School Location</span>
            </div>
            {hasSchoolLocation ? (
              <Badge variant="secondary" className="text-green-600">
                <MapPin className="h-3 w-3 mr-1" />
                Set
              </Badge>
            ) : (
              <Badge variant="outline">Not Set</Badge>
            )}
          </div>
          
          {hasSchoolLocation && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>{teacher.currentSchool}</strong><br />
              Coordinates: {parseFloat(teacher.currentSchoolLatitude!).toFixed(6)}, {parseFloat(teacher.currentSchoolLongitude!).toFixed(6)}
              <br />
              <a 
                href={`https://www.google.com/maps?q=${teacher.currentSchoolLatitude},${teacher.currentSchoolLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          )}
          
          <Button
            variant={hasSchoolLocation ? "outline" : "default"}
            size="sm"
            onClick={() => setShowSchoolPicker(!showSchoolPicker)}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            {hasSchoolLocation ? "Update School Location" : "Set School Location"}
          </Button>
          
          {showSchoolPicker && (
            <LocationPicker
              title="Set Current School Location"
              onLocationSelect={handleSchoolLocationSelect}
              currentLat={teacher.currentSchoolLatitude ? parseFloat(teacher.currentSchoolLatitude) : undefined}
              currentLng={teacher.currentSchoolLongitude ? parseFloat(teacher.currentSchoolLongitude) : undefined}
            />
          )}
        </div>

        <Separator />

        {/* Home Location */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-green-600" />
              <span className="font-medium">Home Location</span>
            </div>
            {hasHomeLocation ? (
              <Badge variant="secondary" className="text-green-600">
                <MapPin className="h-3 w-3 mr-1" />
                Set
              </Badge>
            ) : (
              <Badge variant="outline">Not Set</Badge>
            )}
          </div>
          
          {hasHomeLocation && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Home in {teacher.homeDistrict}</strong><br />
              Coordinates: {parseFloat(teacher.homeLatitude!).toFixed(6)}, {parseFloat(teacher.homeLongitude!).toFixed(6)}
              <br />
              <a 
                href={`https://www.google.com/maps?q=${teacher.homeLatitude},${teacher.homeLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          )}
          
          <Button
            variant={hasHomeLocation ? "outline" : "default"}
            size="sm"
            onClick={() => setShowHomePicker(!showHomePicker)}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            {hasHomeLocation ? "Update Home Location" : "Set Home Location"}
          </Button>
          
          {showHomePicker && (
            <LocationPicker
              title="Set Home Location"
              onLocationSelect={handleHomeLocationSelect}
              currentLat={teacher.homeLatitude ? parseFloat(teacher.homeLatitude) : undefined}
              currentLng={teacher.homeLongitude ? parseFloat(teacher.homeLongitude) : undefined}
            />
          )}
        </div>

        <Separator />

        {/* Preferred Transfer Location */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Preferred Transfer Location</span>
            </div>
            {hasPreferredLocation ? (
              <Badge variant="secondary" className="text-green-600">
                <MapPin className="h-3 w-3 mr-1" />
                Set
              </Badge>
            ) : (
              <Badge variant="outline">Not Set</Badge>
            )}
          </div>
          
          {hasPreferredLocation && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Preferred Location</strong><br />
              Coordinates: {parseFloat(teacher.preferredLocationLatitude!).toFixed(6)}, {parseFloat(teacher.preferredLocationLongitude!).toFixed(6)}
              <br />
              <a 
                href={`https://www.google.com/maps?q=${teacher.preferredLocationLatitude},${teacher.preferredLocationLongitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          )}
          
          <Button
            variant={hasPreferredLocation ? "outline" : "default"}
            size="sm"
            onClick={() => setShowPreferredPicker(!showPreferredPicker)}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            {hasPreferredLocation ? "Update Preferred Location" : "Set Preferred Location"}
          </Button>
          
          {showPreferredPicker && (
            <LocationPicker
              title="Set Preferred Transfer Location"
              onLocationSelect={handlePreferredLocationSelect}
              currentLat={teacher.preferredLocationLatitude ? parseFloat(teacher.preferredLocationLatitude) : undefined}
              currentLng={teacher.preferredLocationLongitude ? parseFloat(teacher.preferredLocationLongitude) : undefined}
            />
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Why set precise locations?</strong><br />
            Adding exact coordinates helps the system find the most suitable transfer matches by calculating real distances instead of using district centers. This results in better matching accuracy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
