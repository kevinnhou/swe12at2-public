"use client";

import MfaVerification from "@/components/auth/verification";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import { emailSchema, passwordSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "~/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/form";
import { Input } from "~/input";

interface TLoginDetailsProps {
  goToPrevious: () => void;
}

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export default function LoginDetails({ goToPrevious }: TLoginDetailsProps) {
  const { refreshUserData, signin } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<z.infer<typeof loginSchema>>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    try {
      const sanitisedValues = {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      };

      const mfaCheckResult = await apiRequest("user/mfa/check", {
        body: { email: sanitisedValues.email },
        method: "POST",
        requiresAuth: false,
      });

      if (mfaCheckResult.error) {
        throw new Error(mfaCheckResult.error);
      }

      const credentialCheckResult = await apiRequest("user/check-credentials", {
        body: sanitisedValues,
        method: "POST",
        requiresAuth: false,
      });

      if (credentialCheckResult.error) {
        throw new Error(credentialCheckResult.error);
      }

      if (mfaCheckResult.data?.mfaEnabled) {
        setUserEmail(sanitisedValues.email);
        setSecurityQuestion(mfaCheckResult.data.question);
        setMfaRequired(true);
        return;
      }

      await signin(sanitisedValues.email, sanitisedValues.password);
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error("Login failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleMfaVerified = async () => {
    try {
      setIsSubmitting(true);
      const result = await apiRequest("user/mfa/complete-auth", {
        body: { email: userEmail },
        method: "POST",
        requiresAuth: false,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      await refreshUserData();
      toast.success("Logged in successfully");

      if (result.data?.user.workplace_id === null) {
        router.push("/onboarding/workspace");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Login failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mfaRequired) {
    return (
      <MfaVerification
        email={userEmail}
        onCancel={() => setMfaRequired(false)}
        onVerified={handleMfaVerified}
        question={securityQuestion}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl text-muted-foreground text-center mb-8 font-inter">
        Enter your details
      </h1>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email Address"
                    type="email"
                    {...field}
                    autoComplete="off"
                    className="bg-background/10 text-muted-foreground"
                  />
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
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                      autoComplete="off"
                      className="bg-background/10 text-muted-foreground"
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            className="w-full"
            disabled={isSubmitting}
            type="submit"
            variant="cta"
          >
            {isSubmitting ? "Logging in..." : "Continue"}
          </Button>
          <button
            className="text-sm text-gray-400 hover:text-gray-200 w-full text-center mt-4 font-inter"
            onClick={goToPrevious}
            type="button"
          >
            Back
          </button>
        </form>
      </Form>
    </div>
  );
}
