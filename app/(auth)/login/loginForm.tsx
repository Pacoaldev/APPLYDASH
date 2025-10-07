"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { passwordSchema } from "@/validation/passwordSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginUser } from "./action";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.email(),
  password: passwordSchema,
});

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
  setServerError(null);
  setIsLoading(true);

  try {
    const response = await loginUser({
      email: data.email,
      password: data.password,
    });

    if (response.error) {
      toast.error("Login Failed", {
        description: response.message,
      });
      setServerError(response.message);
    } else {
      // Force navigation to dashboard with full page reload to ensure proper state
      window.location.href = "/dashboard";
    }
  } catch (error) {
    let errorMessage = "An unexpected error occurred. Please try again.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    setServerError(errorMessage);
    toast.error("Error", { description: errorMessage });
  } finally {
    setIsLoading(false);
  }
};

  // pass the email value to forget password page
  const email = form.getValues("email");

  return (
    <main className="flex justify-center items-center min-h-screen">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-2"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
              {/* <Button type="submit">Register</Button> */}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              {/* Google sign-in removed */}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="text-muted-foreground text-sm">
            Dont have an account?{" "}
            <Link href="/register" className="underline">
              Register
            </Link>
          </div>
          <div className="text-muted-foreground text-sm">
            Forgot password?{" "}
            <Link
              href={`/forgot-password${
                email ? `?email=${encodeURIComponent(email)}` : ""
              }`}
              className="underline"
            >
              Reset my password
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}