import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Clock, Check, X } from "lucide-react";
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

interface TransferRequest {
  id: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  fromTeacher: { user: { email: string } } & Teacher;
  toTeacher: { user: { email: string } } & Teacher;
}

export default function Requests() {
  const { isAuthenticated, teacher } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: receivedRequests = [] } = useQuery<TransferRequest[]>({
    queryKey: ['/api/transfer-requests/received'],
    enabled: isAuthenticated && !!teacher,
  });

  const { data: sentRequests = [] } = useQuery<TransferRequest[]>({
    queryKey: ['/api/transfer-requests/sent'],
    enabled: isAuthenticated && !!teacher,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: 'accepted' | 'rejected' }) => {
      const response = await apiRequest('PUT', `/api/transfer-requests/${requestId}/status`, { status });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Request updated",
        description: `Request ${variables.status} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transfer-requests/received'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
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

  const handleAcceptRequest = (requestId: number) => {
    updateRequestMutation.mutate({ requestId, status: 'accepted' });
  };

  const handleRejectRequest = (requestId: number) => {
    updateRequestMutation.mutate({ requestId, status: 'rejected' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated || !teacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Transfer Requests</h1>
          <p className="text-lg text-gray-600">Manage your incoming and outgoing transfer requests</p>
        </div>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No requests received yet</p>
                  <p className="text-gray-400">Teachers will send you requests when they're interested in a transfer</p>
                </CardContent>
              </Card>
            ) : (
              receivedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{request.fromTeacher.name}</CardTitle>
                          <p className="text-sm text-gray-600">{request.fromTeacher.subject} Teacher</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Current School:</p>
                          <p className="text-gray-600">{request.fromTeacher.currentSchool}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Current District:</p>
                          <p className="text-gray-600">{request.fromTeacher.currentDistrict}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Home District:</p>
                          <p className="text-gray-600">{request.fromTeacher.homeDistrict}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Experience:</p>
                          <p className="text-gray-600">{request.fromTeacher.experience} years</p>
                        </div>
                      </div>
                      
                      {request.message && (
                        <div>
                          <p className="font-medium text-gray-700 mb-2">Message:</p>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{request.message}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Received on {formatDate(request.createdAt)}
                        </p>
                        
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={updateRequestMutation.isPending}
                              size="sm"
                            >
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={updateRequestMutation.isPending}
                              variant="destructive"
                              size="sm"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        {request.status === 'accepted' && (
                          <div className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded">
                            <p>Contact: {request.fromTeacher.user.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No requests sent yet</p>
                  <p className="text-gray-400">Send requests to teachers you'd like to transfer with</p>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{request.toTeacher.name}</CardTitle>
                          <p className="text-sm text-gray-600">{request.toTeacher.subject} Teacher</p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Current School:</p>
                          <p className="text-gray-600">{request.toTeacher.currentSchool}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Current District:</p>
                          <p className="text-gray-600">{request.toTeacher.currentDistrict}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Home District:</p>
                          <p className="text-gray-600">{request.toTeacher.homeDistrict}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Experience:</p>
                          <p className="text-gray-600">{request.toTeacher.experience} years</p>
                        </div>
                      </div>
                      
                      {request.message && (
                        <div>
                          <p className="font-medium text-gray-700 mb-2">Your Message:</p>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{request.message}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Sent on {formatDate(request.createdAt)}
                        </p>
                        
                        {request.status === 'accepted' && (
                          <div className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded">
                            <p>Contact: {request.toTeacher.user.email}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
