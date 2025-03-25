"use client";

import { apiRequest } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "~/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/form";
import { Input } from "~/input";

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

const verifyMfaSchema = z.object({
  answer: z.string().min(1, { message: "Please provide an answer" }),
});

export type SecurityQuestionValues = z.infer<typeof securityQuestionSchema>;
export type VerifyMfaValues = z.infer<typeof verifyMfaSchema>;

interface MfaVerificationProps {
  email: string;
  onCancel: () => void;
  onVerified: () => void;
  question: string;
}

export default function MfaVerification({
  email,
  onCancel,
  onVerified,
  question,
}: MfaVerificationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VerifyMfaValues>({
    defaultValues: {
      answer: "",
    },
    resolver: zodResolver(verifyMfaSchema),
  });

  async function onSubmit(values: VerifyMfaValues) {
    setIsSubmitting(true);
    try {
      const result = await apiRequest("user/mfa/verify", {
        body: {
          answer: values.answer.trim().toLowerCase(),
          email,
        },
        method: "POST",
        requiresAuth: false,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      onVerified();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to verify security answer"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center mb-4">
        <Shield className="h-10 w-10 text-primary" />
      </div>

      <h1 className="text-2xl text-muted-foreground text-center mb-2 font-inter">
        Security Verification
      </h1>

      <p className="text-center text-muted-foreground mb-4">
        Please answer your security question to continue
      </p>

      <div className="bg-muted/30 p-4 rounded-md mb-4">
        <p className="text-center font-medium">{question}</p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Your answer"
                    type="text"
                    {...field}
                    autoComplete="off"
                    className="bg-background/10 text-muted-foreground"
                  />
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
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>

          <button
            className="text-sm text-gray-400 hover:text-gray-200 w-full text-center mt-2 font-inter"
            onClick={onCancel}
            type="button"
          >
            Back
          </button>
        </form>
      </Form>
    </div>
  );
}
