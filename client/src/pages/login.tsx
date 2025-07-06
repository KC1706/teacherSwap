import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Login() {
  const { isAuthenticated, teacher } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      if (teacher) {
        setLocation("/dashboard");
      } else {
        setLocation("/register-teacher");
      }
    }
  }, [isAuthenticated, teacher, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
