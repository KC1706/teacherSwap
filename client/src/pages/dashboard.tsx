import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Heart, MapPin, TrendingUp, Mail, Phone, Navigation } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { Overview } from "@/components/dashboard/overview";
import { RecentMatches } from "@/components/dashboard/recent-matches";
import { NearbyTeachers } from "@/components/dashboard/nearby-teachers";
import { LocationSettings } from "@/components/dashboard/location-settings";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Link } from "wouter";

interface DashboardStats {
  totalMatches: number;
  perfectMatches: number;
  nearbyTeachers: number;
  receivedRequests: number;
  sentRequests: number;
  pendingRequests: number;
}

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

export default function Dashboard() {
  const { isAuthenticated, teacher } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    enabled: isAuthenticated && !!teacher,
  });

  const { data: matches = [] } = useQuery<MatchResult[]>({
    queryKey: ['/api/matches'],
    enabled: isAuthenticated && !!teacher,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!teacher) {
      setLocation("/register-teacher");
    }
  }, [isAuthenticated, teacher, setLocation]);

  if (!isAuthenticated || !teacher) {
    return null;
  }

  const perfectMatches = matches.filter(m => m.matchType === 'perfect');
  const nearbyTeachers = matches.filter(m => m.matchType === 'nearby');

  const handleViewMatch = (teacherId: number) => {
    setLocation(`/teachers/${teacherId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{teacher.name}</h1>
              <p className="text-blue-100">{teacher.subject} Teacher</p>
              <p className="text-blue-100">{teacher.currentSchool}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats?.totalMatches || 0}</div>
              <div className="text-blue-100">Potential Matches</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <a href="#" className="border-b-2 border-primary text-primary py-4 px-1 text-sm font-medium">
              Overview
            </a>
            <Link href="/matches" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
              Perfect Matches
            </Link>
            <Link href="/matches" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
              Nearby Teachers
            </Link>
            <Link href="/requests" className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
              Requests
            </Link>
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Recent Matches</TabsTrigger>
            <TabsTrigger value="nearby">Nearby Teachers</TabsTrigger>
            <TabsTrigger value="location">
              <Navigation className="h-4 w-4 mr-2" />
              Precise Location
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {stats && <Overview stats={stats} />}
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
             <RecentMatches matches={perfectMatches} onViewMatch={handleViewMatch} />
          </TabsContent>

          <TabsContent value="nearby" className="space-y-4">
            <NearbyTeachers />
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <LocationSettings teacher={teacher} />
          </TabsContent>
        </Tabs>
        {/* Recent Matches and Nearby Teachers */}
          {/*
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RecentMatches matches={perfectMatches} onViewMatch={handleViewMatch} />
            <NearbyTeachers nearbyTeachers={nearbyTeachers} onViewTeacher={handleViewMatch} />
          </div>
          */}
        </div>
      </div>
    </div>
  );
}