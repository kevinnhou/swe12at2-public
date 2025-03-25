"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HelpCircle,
  Lock,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const securityQuestionSchema = z.object({
  answer: z
    .string()
    .min(2, { message: "Security answer must be at least 2 characters long" })
    .max(100, { message: "Security answer must be less than 100 characters" }),
  question: z
    .string()
    .min(5, { message: "Security question must be at least 5 characters long" })
    .max(200, {
      message: "Security question must be less than 200 characters",
    }),
});

interface MfaSectionProps {
  mfaEnabled: boolean;
  onMfaStatusChange: (enabled: boolean) => void;
}

type SecurityQuestionValues = z.infer<typeof securityQuestionSchema>;

export default function MfaSection({
  mfaEnabled,
  onMfaStatusChange,
}: MfaSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSetupForm, setShowSetupForm] = useState(false);

  const form = useForm<SecurityQuestionValues>({
    defaultValues: {
      answer: "",
      question: "",
    },
    resolver: zodResolver(securityQuestionSchema),
  });

  async function handleToggleMfa(enabled: boolean) {
    if (enabled) {
      setShowSetupForm(true);
    } else {
      setIsSubmitting(true);
      try {
        const result = await apiRequest("user/mfa/disable", {
          method: "POST",
        });

        if (result.error) {
          throw new Error(result.error);
        }

        onMfaStatusChange(false);
        toast.success("Multi-factor authentication disabled");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to disable MFA"
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  async function onSubmit(values: SecurityQuestionValues) {
    setIsSubmitting(true);
    try {
      const result = await apiRequest("user/mfa/setup", {
        body: {
          answer: values.answer.trim().toLowerCase(),
          question: values.question.trim(),
        },
        method: "POST",
      });

      if (result.error) {
        throw new Error(result.error);
      }

      onMfaStatusChange(true);
      setShowSetupForm(false);
      toast.success("Security question set up successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to set up security question"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-none shadow-md overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Multi-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Enhance your account security with an additional verification step
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-6">
        {mfaEnabled ? (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="font-medium text-green-800 dark:text-green-400">
              MFA is enabled
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-500">
              Your account is protected with a security question
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="font-medium text-amber-800 dark:text-amber-400">
              MFA is not enabled
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-500">
              Enable MFA to add an extra layer of security to your account
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-start p-4 bg-muted/30 rounded-lg">
          <div
            className={cn(
              "p-4 rounded-lg flex items-center justify-center flex-shrink-0",
              mfaEnabled
                ? "bg-green-50 dark:bg-green-950/30"
                : "bg-amber-50 dark:bg-amber-950/30"
            )}
          >
            {mfaEnabled ? (
              <ShieldCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
            ) : (
              <ShieldAlert className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            )}
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <h3 className="text-lg font-medium">Security Question</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {mfaEnabled
                  ? "Your account is protected with a security question that will be asked during login"
                  : "Set up a security question to verify your identity when logging in"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={mfaEnabled}
                disabled={isSubmitting}
                onCheckedChange={handleToggleMfa}
              />
              <span className="text-sm font-medium">
                {mfaEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        {showSetupForm && (
          <div className="bg-muted/20 rounded-lg p-5 border border-border/50 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Set Up Security Question</h3>
            </div>

            <Form {...form}>
              <form
                className="space-y-5"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        Security Question
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none"
                          placeholder="e.g., What was the name of your first pet?"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Create a unique question that only you would know the
                        answer to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        Answer
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your answer"
                          type="text"
                          {...field}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormDescription>
                        Remember this answer exactly as you'll need it to verify
                        your identity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    className="gap-1"
                    onClick={() => setShowSetupForm(false)}
                    type="button"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="gap-1"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Set up security question
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
