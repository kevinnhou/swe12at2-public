"use client";

import PublicRoute from "@/components/auth/public-route";
import AuthWrapper from "@/components/auth/wrapper";
import LoginDetails from "@/components/auth/login/login-details";
import LoginMenu from "@/components/auth/login/login-menu";

export default function Login() {
  return (
    <PublicRoute>
      <AuthWrapper>
        {({ goToNext }) => <LoginMenu goToNext={goToNext} />}
        {({ goToPrevious }) => <LoginDetails goToPrevious={goToPrevious} />}
      </AuthWrapper>
    </PublicRoute>
  );
}
