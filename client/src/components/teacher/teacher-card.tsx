import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, School, Award, Route, User } from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  subject: string;
  currentSchool: string;
  currentDistrict: string;
  homeDistrict: string;
  experience: number;
}

interface MatchResult {
  teacher: Teacher;
  matchType: 'perfect' | 'nearby';
  distance: number;
  score: number;
}

interface TeacherCardProps {
  match: MatchResult;
  onSendRequest: (teacherId: number) => void;
  onViewProfile: (teacherId: number) => void;
  isRequestPending?: boolean;
}

export function TeacherCard({ match, onSendRequest, onViewProfile, isRequestPending = false }: TeacherCardProps) {
  const { teacher, matchType, distance } = match;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              matchType === 'perfect' ? 'bg-primary' : 'bg-yellow-500'
            }`}>
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
              <p className="text-sm text-gray-600">{teacher.subject} Teacher</p>
            </div>
          </div>
          <Badge variant={matchType === 'perfect' ? 'default' : 'secondary'}>
            {matchType === 'perfect' ? 'Perfect Match' : 'Nearby'}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <School className="h-4 w-4 text-gray-400 mr-2" />
            <span>{teacher.currentSchool}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
            <span>{teacher.currentDistrict} → {teacher.homeDistrict}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Award className="h-4 w-4 text-gray-400 mr-2" />
            <span>{teacher.experience} years experience</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Route className="h-4 w-4 text-gray-400 mr-2" />
            <span>
              {matchType === 'perfect' 
                ? 'Perfect mutual match' 
                : `${distance.toFixed(1)} km away`
              }
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => onSendRequest(teacher.id)}
            disabled={isRequestPending}
            className={`flex-1 ${
              matchType === 'perfect' 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            {isRequestPending ? 'Request Sent' : 'Send Request'}
          </Button>
          <Button
            onClick={() => onViewProfile(teacher.id)}
            variant="outline"
            className="flex-1"
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
