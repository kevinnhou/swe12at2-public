"use client";

import type React from "react";

import MfaSection from "@/components/auth/mfa";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Mail,
  Save,
  Shield,
  User,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const profileFormSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .optional(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .optional(),
});

export default function ProfileForm() {
  const { refreshUserData, user } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || "",
    name: user?.name || "",
  });
  const [errors, setErrors] = useState<{
    email?: string[];
    form?: string;
    name?: string[];
  }>({});
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoadingMfa, setIsLoadingMfa] = useState(true);

  useEffect(() => {
    async function fetchMfaStatus() {
      try {
        const result = await apiRequest<{ enabled: boolean }>(
          "user/mfa/status"
        );
        if (result.data) {
          setMfaEnabled(result.data.enabled);
        }
      } catch (error) {
        console.error("Failed to fetch MFA status:", error);
      } finally {
        setIsLoadingMfa(false);
      }
    }

    fetchMfaStatus();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = profileFormSchema.safeParse(formData);

      if (!validatedData.success) {
        setErrors(validatedData.error.flatten().fieldErrors);
        setIsSubmitting(false);
        return;
      }

      const dataToSubmit = {
        email: formData.email || user?.email,
        name: formData.name || user?.name,
      };

      const result = await apiRequest("user", {
        body: dataToSubmit,
        method: "PUT",
      });

      if (result.error) {
        throw new Error(result.error);
      }

      await refreshUserData();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setErrors((prev) => ({
        ...prev,
        form:
          error instanceof Error ? error.message : "Failed to update profile",
      }));
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleMfaStatusChange(enabled: boolean) {
    setMfaEnabled(enabled);
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCircle className="h-5 w-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your account information and how others see you on the
              platform.
            </CardDescription>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6 space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user.name ? (
                      getInitials(user.name)
                    ) : (
                      <User className="h-10 w-10" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-black/60 h-24 w-24 flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-xl font-semibold">{user.name || "User"}</h3>
                <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
                <div className="flex items-center justify-center sm:justify-start mt-2">
                  <div
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                      mfaEnabled
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}
                  >
                    <Shield className="h-3 w-3" />
                    {mfaEnabled ? "MFA Enabled" : "MFA Disabled"}
                  </div>
                </div>
              </div>
            </div>

            {errors.form && (
              <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p>{errors.form}</p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5" htmlFor="name">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Name
                </Label>
                <Input
                  autoComplete="off"
                  className={cn(
                    "transition-all",
                    errors.name
                      ? "border-destructive ring-destructive/20 ring-2"
                      : ""
                  )}
                  id="name"
                  name="name"
                  onChange={handleChange}
                  placeholder="Your name"
                  value={formData.name}
                />
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.name[0]}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  This is the name that will be displayed to other users.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5" htmlFor="email">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  autoComplete="off"
                  className={cn(
                    "transition-all",
                    errors.email
                      ? "border-destructive ring-destructive/20 ring-2"
                      : ""
                  )}
                  id="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="Your email address"
                  type="email"
                  value={formData.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {errors.email[0]}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  This email is used for login and notifications.
                </p>
              </div>
            </div>
          </CardContent>

          <Separator className="my-2" />

          <CardFooter className="flex justify-between py-4">
            <Button
              className="gap-1"
              onClick={() => router.back()}
              type="button"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button className="gap-1" disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {!isLoadingMfa && (
        <MfaSection
          mfaEnabled={mfaEnabled}
          onMfaStatusChange={handleMfaStatusChange}
        />
      )}
    </div>
  );
}
