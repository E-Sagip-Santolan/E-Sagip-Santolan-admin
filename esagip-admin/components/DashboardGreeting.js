"use client";

import { useAuth } from "@/components/AuthProvider";

export default function DashboardGreeting() {
  const { user } = useAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Admin";
  return <h1>Mabuhay, {firstName}!</h1>;
}
