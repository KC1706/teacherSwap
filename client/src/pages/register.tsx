import { useAuth } from "@/hooks/use-auth";
import { RegisterForm } from "@/components/auth/register-form";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Register() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/register-teacher");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
}
