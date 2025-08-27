
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { resetPasswordFunc } from "./action";
import { Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";

// const formSchema = z.object({
//   password: z.string().min(6),
//   passwordConfirm: z.string().min(6),
// });

const formSchema = passwordMatchSchema;

export default function ResetPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // const searchParams = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  // useEffect(() => {
  //   const checkSession = async () => {
  //     setLoading(true);
  //     const type = searchParams.get("type");
  //     const accessToken = searchParams.get("access_token");
  //     const supabase = createClient();

  //     if (type === "recovery" && accessToken) {

  //       await supabase.auth.setSession({
  //         access_token: accessToken,
  //         refresh_token: "",
  //       });
  //     }

  //     const { data, error } = await supabase.auth.getUser();
  //     if (data.user && !error) {
  //       setSessionReady(true);
  //     } else {
  //       setSessionReady(false);
  //     }
  //     setLoading(false);
  //   };

  //   checkSession();
  // }, [searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const supabase = createClient();
      
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setSessionReady(true);
      } else {
        setSessionReady(false);
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const response = await resetPasswordFunc({
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });

      if (response.error) {
        setServerError(response.message);
        toast.error("Update Failed", { description: response.message });
      } else {
        toast.success("Success!", { description: "Your password has been updated." });
        router.push("/dashboard");
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setServerError(errorMessage);
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
    );
  }


  if (!sessionReady && !loading) {
    return (
      <main className="flex justify-center items-center min-h-screen">
        <Card className="w-[380px]">
          <CardHeader>
            <CardTitle>Password Reset</CardTitle>
            <CardDescription>
              Enter your new password to update your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 text-sm mt-2">
              Auth session missing! Please use the password reset link from your email.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Show reset form if session exists
  return (
    <main className="flex justify-center items-center min-h-screen">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Password Reset</CardTitle>
          <CardDescription>
            Enter your new password to update your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col gap-2"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password confirm</FormLabel>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}