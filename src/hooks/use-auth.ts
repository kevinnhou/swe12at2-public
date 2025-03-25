"use client";

import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export interface TAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: null | TUser;
}

export interface TUser {
  email: string;
  id: number;
  is_admin: boolean;
  mfa_enabled: boolean;
  name: string;
  workplace_id: null | number;
}

export function useAuth() {
  const [authState, setAuthState] = useState<TAuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      const result = await apiRequest<TUser>("status");

      if (result.error) {
        setAuthState({ isAuthenticated: false, isLoading: false, user: null });
        return;
      }

      if (result.data) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: result.data,
        });
      } else {
        setAuthState({ isAuthenticated: false, isLoading: false, user: null });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setAuthState({ isAuthenticated: false, isLoading: false, user: null });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  async function signup(
    email: string,
    password: string,
    confirmPassword: string
  ) {
    try {
      const result = await apiRequest<{ user: TUser }>("signup", {
        body: { confirmPassword, email, password },
        method: "POST",
        requiresAuth: false,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      await checkAuthStatus();

      setTimeout(() => {
        router.push("/onboarding/welcome");
      }, 100);
    } catch (error) {
      throw error;
    }
  }

  async function signin(email: string, password: string, mfaVerified = false) {
    try {
      const result = await apiRequest<{ user: TUser }>("signin", {
        body: { email, mfa_verified: mfaVerified, password },
        method: "POST",
        requiresAuth: false,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      await checkAuthStatus();

      setTimeout(() => {
        if (result.data?.user.workplace_id === null) {
          router.push("/onboarding/workspace");
        } else {
          router.push("/dashboard");
        }
      }, 200);
    } catch (error) {
      throw error;
    }
  }

  async function signout() {
    try {
      const result = await apiRequest("signout", {
        method: "POST",
      });

      if (result.error) {
        throw new Error(result.error);
      }

      await checkAuthStatus();

      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (error) {
      console.error("Signout error:", error);
    }
  }

  const refreshUserData = useCallback(async () => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    ...authState,
    refreshUserData,
    signin,
    signout,
    signup,
  };
}
