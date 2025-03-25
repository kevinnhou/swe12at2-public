"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { site } from "@/lib/config";
import { apiRequest } from "@/lib/api";
import { type TOnboardingData, onboardingSchema } from "@/schemas/onboarding";

import { Plus, Users } from "lucide-react";

import { Button } from "~/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/form";
import { Input } from "~/input";
import Logo from "@/components/logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/tabs";
import { Textarea } from "~/textarea";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "~/input-otp";

export default function Workspace() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, refreshUserData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  const form = useForm<TOnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      theme: theme as "light" | "dark",
      name: user?.name || "",
      workspaceName: "",
      workspaceDescription: "",
      joinCode: "",
    },
  });

  function handleThemeSelect(selectedTheme: "light" | "dark") {
    form.setValue("theme", selectedTheme);
    toast.success(
      `Theme set to ${
        selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)
      }`
    );
    setTheme(selectedTheme);
  }

  async function onSubmit(data: TOnboardingData) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (data.name && (!user || data.name !== user.name)) {
        const nameResponse = await apiRequest("user", {
          method: "PUT",
          body: { name: data.name },
        });

        if (nameResponse.error) {
          toast.error(`Failed to update name: ${nameResponse.error}`);
          setIsSubmitting(false);
          return;
        }
      }

      let workspaceResponse;

      if (
        activeTab === "create" &&
        (data.workspaceName || data.workspaceDescription)
      ) {
        workspaceResponse = await apiRequest("workspace/create", {
          method: "POST",
          body: {
            name: data.workspaceName,
            description: data.workspaceDescription,
          },
        });

        if (workspaceResponse.error) {
          toast.error(`Failed to create workspace: ${workspaceResponse.error}`);
          setIsSubmitting(false);
          return;
        }

        toast.success("Workspace created successfully");
      } else if (activeTab === "join" && data.joinCode) {
        workspaceResponse = await apiRequest("workspace/join", {
          method: "POST",
          body: { joinCode: data.joinCode },
        });

        if (workspaceResponse.error) {
          toast.error(`Failed to join workspace: ${workspaceResponse.error}`);
          setIsSubmitting(false);
          return;
        }

        toast.success("Joined workspace successfully");
      }
      await refreshUserData();
      router.push("/onboarding/completion");
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      className="min-h-[calc(100vh-20rem)] flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        className="w-full max-w-2xl space-y-8"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center space-y-2">
          <motion.h1
            className="text-4xl font-bold font-inter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Set up your{" "}
            <span className="bg-gradient-to-r from-[#FF100D] to-[#FF7903] text-transparent bg-clip-text">
              workspace
            </span>
          </motion.h1>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Choose your theme and set up your workspace
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <motion.div
              className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                form.watch("theme") === "light"
                  ? "border-primary bg-white shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeSelect("light")}
            >
              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center gap-2 border-b pb-2 mb-2">
                  <Logo className="w-4 h-4 text-primary" />
                  <div className="h-2 w-16 bg-gray-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-24 bg-gray-200 rounded" />
                  <div className="h-2 w-32 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                Light
              </div>
            </motion.div>

            <motion.div
              className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                form.watch("theme") === "dark"
                  ? "border-primary bg-zinc-950 shadow-lg"
                  : "border-border hover:border-primary/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleThemeSelect("dark")}
            >
              <div className="p-4 bg-zinc-950 rounded-lg">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 mb-2">
                  <Logo className="w-4 h-4 text-primary" />
                  <div className="h-2 w-16 bg-zinc-800 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-24 bg-zinc-800 rounded" />
                  <div className="h-2 w-32 bg-zinc-900 rounded" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 text-sm font-medium">
                Dark
              </div>
            </motion.div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="create"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Workspace
                  </TabsTrigger>
                  <TabsTrigger value="join" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Join Workspace
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create a Workspace</CardTitle>
                      <CardDescription>
                        Set up your own workspace
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="workspaceName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Workspace Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`e.g., ${site.name.short} Team`}
                                {...field}
                                autoComplete="off"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="workspaceDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={`e.g., ${site.name.short} Workspace`}
                                className="min-h-[100px]"
                                {...field}
                                autoComplete="off"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="join">
                  <Card>
                    <CardHeader>
                      <CardTitle>Join a Workspace</CardTitle>
                      <CardDescription>
                        Join an existing workspace with an invite code
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="joinCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <InputOTP
                                maxLength={8}
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <InputOTPGroup>
                                  {[...Array(8)].map((_, index) => (
                                    <InputOTPSlot key={index} index={index} />
                                  ))}
                                </InputOTPGroup>
                              </InputOTP>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {form.formState.errors.root && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.root.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF100D] to-[#FF7903] text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Setting up..." : "Continue"}
              </Button>
            </form>
          </Form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
