import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { TeacherCard } from "@/components/teacher/teacher-card";
import { MatchFilters } from "@/components/teacher/match-filters";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

export default function Matches() {
  const { isAuthenticated, teacher } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    matchType: 'all',
    maxDistance: 'all',
    subject: 'all',
  });

  const { data: matches = [], isLoading } = useQuery<MatchResult[]>({
    queryKey: ['/api/matches', filters],
    enabled: isAuthenticated && !!teacher,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (teacherId: number) => {
      const response = await apiRequest('POST', '/api/transfer-requests', {
        toTeacherId: teacherId,
        message: 'I would like to request a mutual transfer.',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request sent",
        description: "Your transfer request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!teacher) {
      setLocation("/register-teacher");
    }
  }, [isAuthenticated, teacher, setLocation]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSendRequest = (teacherId: number) => {
    sendRequestMutation.mutate(teacherId);
  };

  const handleViewProfile = (teacherId: number) => {
    setLocation(`/teachers/${teacherId}`);
  };

  if (!isAuthenticated || !teacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Match</h1>
          <p className="text-lg text-gray-600">Browse through perfect matches and nearby teachers</p>
        </div>

        <MatchFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          resultCount={matches.length}
        />

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No matches found</p>
            <p className="text-gray-400">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <TeacherCard
                key={match.teacher.id}
                match={match}
                onSendRequest={handleSendRequest}
                onViewProfile={handleViewProfile}
                isRequestPending={sendRequestMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
