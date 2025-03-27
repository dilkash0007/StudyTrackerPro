import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, UserPlus, BrainCircuit } from "lucide-react";
import {
  NeuralDots,
  NeuralBackgroundDecoration,
  PulsingDot,
} from "@/components/ui/NeuralDesignElements";

const formSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function Register() {
  const { register, googleLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [, navigate] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await register(data.username, data.email, data.password);
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleSubmitting(true);
      await googleLogin();
      navigate("/");
    } catch (error) {
      console.error("Google login failed:", error);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <NeuralBackgroundDecoration />

      <div className="absolute top-1/3 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 -left-24 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
        <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-20" />
        <NeuralDots
          className="absolute bottom-0 left-0 w-24 h-24 opacity-10"
          count={3}
        />

        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <BrainCircuit className="w-16 h-16 text-teal-400" />
          </div>
          <CardTitle className="text-2xl text-center bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
            Neural Signup
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Create your TaskTrackerPro account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full border-teal-500/30 hover:bg-teal-900/20 text-gray-300"
            onClick={handleGoogleLogin}
            disabled={isGoogleSubmitting}
          >
            {isGoogleSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  fill="currentColor"
                />
              </svg>
            )}
            Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-teal-500/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900/50 px-2 text-teal-300">
                Or continue with
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        {...field}
                        className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-400 flex items-center justify-center">
            Already have an account?{" "}
            <Link to="/login">
              <a className="text-teal-400 hover:text-teal-300 ml-1 flex items-center">
                Log in <PulsingDot className="ml-1" />
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
