import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface Teacher {
  id: number;
  name: string;
  subject: string;
  currentDistrict: string;
  homeDistrict: string;
}

interface MatchResult {
  teacher: Teacher;
  matchType: 'perfect' | 'nearby';
  distance: number;
  score: number;
}

interface NearbyTeachersProps {
  nearbyTeachers: MatchResult[];
  onViewTeacher: (teacherId: number) => void;
}

export function NearbyTeachers({ nearbyTeachers, onViewTeacher }: NearbyTeachersProps) {
  const recentNearby = nearbyTeachers.slice(0, 5);

  if (recentNearby.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nearby Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No nearby teachers found</p>
            <Link href="/matches">
              <Button>Explore More</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nearby Teachers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentNearby.map((match) => (
            <div
              key={match.teacher.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{match.teacher.name}</p>
                  <p className="text-xs text-gray-500">{match.teacher.subject} Teacher</p>
                  <p className="text-xs text-gray-500">
                    {match.distance.toFixed(1)} km away
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Nearby</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewTeacher(match.teacher.id)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {nearbyTeachers.length > 5 && (
          <div className="mt-4 text-center">
            <Link href="/matches">
              <Button variant="outline" size="sm">
                View All Nearby Teachers
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
