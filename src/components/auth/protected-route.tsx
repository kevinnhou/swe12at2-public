"use client";

import type { PropsWithChildren } from "react";

import Loading from "@/components/loading";
import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

// eslint-disable-next-line ts/no-empty-object-type
export default function ProtectedRoute({ children }: PropsWithChildren<{}>) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    async function checkAuth() {
      if (!isLoading) {
        if (!isAuthenticated) {
          toast.error("Not authenticated, redirecting to login");
          router.push("/login");
        } else if (
          user &&
          user.workplace_id === null &&
          path === "/dashboard"
        ) {
          toast.info("Please set up your workspace");
          router.push("/onboarding/welcome");
        }
      }
    }
    checkAuth();
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
