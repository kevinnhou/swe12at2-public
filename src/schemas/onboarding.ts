import { z } from "zod";

export const onboardingSchema = z.object({
  joinCode: z.string().optional(),
  name: z.string().optional(),
  theme: z.enum(["light", "dark"]),
  workspaceDescription: z.string().optional(),
  workspaceName: z.string().optional(),
});

export type TOnboardingData = z.infer<typeof onboardingSchema>;
