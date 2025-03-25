"use client";

import PublicRoute from "@/components/auth/public-route";
import AuthWrapper from "@/components/auth/wrapper";
import SignupDetails from "@/components/auth/signup/signup-details";
import SignupMenu from "@/components/auth/signup/signup-menu";

export default function SignupPage() {
  return (
    <PublicRoute>
      <AuthWrapper>
        {({ goToNext }) => <SignupMenu goToNext={goToNext} />}
        {({ goToPrevious }) => <SignupDetails goToPrevious={goToPrevious} />}
      </AuthWrapper>
    </PublicRoute>
  );
}
