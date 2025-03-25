"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";

import AdminDashboard from "@/components/dashboard/admin";
import Loading from "@/components/loading";
import ProtectedRoute from "@/components/auth/protected-route";
import User from "@/components/dashboard/user";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.is_admin) {
      setShowAdminDashboard(true);
    } else {
      setShowAdminDashboard(false);
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ProtectedRoute>
      {showAdminDashboard ? <AdminDashboard /> : <User />}
    </ProtectedRoute>
  );
}
