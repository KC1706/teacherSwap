import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { biharDistricts, subjects, gradeLevels } from "@/lib/districts";

const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  subject: z.string().min(1, "Please select a subject"),
  gradeLevel: z.string().min(1, "Please select a grade level"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  currentSchool: z.string().min(2, "School name must be at least 2 characters"),
  currentDistrict: z.string().min(1, "Please select current district"),
  homeDistrict: z.string().min(1, "Please select home district"),
  preferredDistricts: z.array(z.string()).min(1, "Please select at least one preferred district"),
  maxDistance: z.number().min(25).max(200).default(100),
  experience: z.number().min(0).max(40).default(0),
  hideContact: z.boolean().default(true),
  allowRequests: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export default function RegisterTeacher() {
  const { isAuthenticated, teacher } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      subject: "",
      gradeLevel: "",
      phoneNumber: "",
      currentSchool: "",
      currentDistrict: "",
      homeDistrict: "",
      preferredDistricts: [],
      maxDistance: 100,
      experience: 0,
      hideContact: true,
      allowRequests: true,
      emailNotifications: true,
    },
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      const response = await apiRequest('POST', '/api/teachers', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile created",
        description: "Your teacher profile has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (teacher) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, teacher, setLocation]);

  const onSubmit = (data: TeacherFormData) => {
    createTeacherMutation.mutate(data);
  };

  const handleDistrictToggle = (district: string, checked: boolean) => {
    const currentDistricts = form.getValues("preferredDistricts");
    if (checked) {
      form.setValue("preferredDistricts", [...currentDistricts, district]);
    } else {
      form.setValue("preferredDistricts", currentDistricts.filter(d => d !== district));
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Complete Your Teacher Profile</CardTitle>
            <CardDescription className="text-center">
              Please provide your details to start finding transfer matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Teaching Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Teaching Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.value} value={subject.value}>
                                {subject.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gradeLevels.map((grade) => (
                              <SelectItem key={grade.value} value={grade.value}>
                                {grade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentSchool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current School</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your current school name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Location Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="currentDistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current District</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select current district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {biharDistricts.map((district) => (
                              <SelectItem key={district.value} value={district.value}>
                                {district.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homeDistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home District</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select home district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {biharDistricts.map((district) => (
                              <SelectItem key={district.value} value={district.value}>
                                {district.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredDistricts"
                    render={() => (
                      <FormItem>
                        <FormLabel>Preferred Districts for Transfer</FormLabel>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-4">
                          {biharDistricts.map((district) => (
                            <div key={district.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={district.value}
                                checked={form.watch("preferredDistricts").includes(district.value)}
                                onCheckedChange={(checked) => 
                                  handleDistrictToggle(district.value, checked as boolean)
                                }
                              />
                              <label
                                htmlFor={district.value}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {district.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxDistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Distance (km)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
                  
                  <FormField
                    control={form.control}
                    name="hideContact"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Hide contact information</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Your contact info will only be revealed after mutual acceptance
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowRequests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Allow transfer requests</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Other teachers can send you transfer requests
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Email notifications</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Receive email updates about requests and matches
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createTeacherMutation.isPending}
                >
                  {createTeacherMutation.isPending ? "Creating Profile..." : "Create Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}