import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Login schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

// Registration schema
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  companyName: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  estimatedEvents: z.string().transform(val => parseInt(val) || 0),
  estimatedStaff: z.string().transform(val => parseInt(val) || 0),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  onStaffLoginClick: () => void;
}

export function AuthForm({ onStaffLoginClick }: AuthFormProps) {
  const [tabValue, setTabValue] = useState<"login" | "register">("login");
  const { loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      companyName: "",
      estimatedEvents: "",
      estimatedStaff: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
      role: "organizer",
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: "organizer",
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-10">
        <Logo size="lg" />
      </div>
      
      {/* Auth Card */}
      <Card className="bg-white rounded-2xl shadow-card">
        <CardContent className="p-8">
          <Tabs defaultValue="login" value={tabValue} onValueChange={(v) => setTabValue(v as "login" | "register")}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Back</h2>
              <p className="text-gray-600 mb-8">Log in to manage your events and staff</p>
              
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    {...loginForm.register("email")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register("password")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      id="remember-me"
                      {...loginForm.register("rememberMe")}
                      className="h-4 w-4 text-primary"
                    />
                    <Label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </Label>
                  </div>
                  <a
                    href="#"
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Reset Password",
                        description: "Password reset functionality will be available soon.",
                      });
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Sign In as Organizer
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
              <p className="text-gray-600 mb-8">Sign up to start managing events and staff</p>
              
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    {...registerForm.register("name")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    {...registerForm.register("email")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="register-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (optional)
                  </Label>
                  <div className="flex">
                    <div className="px-3 py-2 border border-gray-300 rounded-l-xl bg-gray-50 text-gray-500">
                      +971
                    </div>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="5X XXX XXXX"
                      {...registerForm.register("phone")}
                      className="flex-1 px-4 py-2 border border-l-0 border-gray-300 rounded-r-xl"
                    />
                  </div>
                  {registerForm.formState.errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerForm.register("password")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerForm.register("confirmPassword")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Create Organizer Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">Are you staff needing to check in?</p>
            <Button
              variant="link"
              className="mt-2 text-primary font-medium hover:text-primary-dark"
              onClick={onStaffLoginClick}
            >
              Staff Check-In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
