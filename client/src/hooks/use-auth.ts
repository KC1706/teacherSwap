import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
}

interface Teacher {
  id: number;
  name: string;
  subject: string;
  currentSchool: string;
  currentDistrict: string;
  homeDistrict: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
  teacher?: Teacher;
}

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authData, isLoading } = useQuery<MeResponse | null>({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['/api/auth/me'], { user: data.user });
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['/api/auth/me'], { user: data.user });
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Registration failed",
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['/api/auth/me'], null);
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return {
    user: authData?.user,
    teacher: authData?.teacher,
    isLoading,
    isAuthenticated: !!authData?.user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
