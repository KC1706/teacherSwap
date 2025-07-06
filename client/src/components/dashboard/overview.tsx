import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, MapPin, Inbox, Send, Settings } from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalMatches: number;
  perfectMatches: number;
  nearbyTeachers: number;
  receivedRequests: number;
  sentRequests: number;
  pendingRequests: number;
}

interface OverviewProps {
  stats: DashboardStats;
}

export function Overview({ stats }: OverviewProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">
              Available transfer partners
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfect Matches</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.perfectMatches}</div>
            <p className="text-xs text-muted-foreground">
              Mutual transfer opportunities
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nearby Teachers</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nearbyTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Teachers in your area
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/matches">
          <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
            <Users className="h-6 w-6" />
            <span className="text-sm font-medium">Find Matches</span>
          </Button>
        </Link>
        
        <Link href="/requests">
          <Button variant="secondary" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
            <Send className="h-6 w-6" />
            <span className="text-sm font-medium">Send Request</span>
          </Button>
        </Link>
        
        <Link href="/requests">
          <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 relative">
            <Inbox className="h-6 w-6" />
            <span className="text-sm font-medium">Requests</span>
            {stats.pendingRequests > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {stats.pendingRequests}
              </span>
            )}
          </Button>
        </Link>
        
        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
          <Settings className="h-6 w-6" />
          <span className="text-sm font-medium">Settings</span>
        </Button>
      </div>
    </div>
  );
}
