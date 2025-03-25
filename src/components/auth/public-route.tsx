"use client";

import type { PropsWithChildren } from "react";

import Loading from "@/components/loading";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

// eslint-disable-next-line ts/no-empty-object-type
export default function PublicRoute({ children }: PropsWithChildren<{}>) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      toast.info("Already authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
