// File layout/app/page.tsx atau di mana AppLayout Anda berada
"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-context";
import { AppSidebarLayout } from "@/components/app-sidebar";
import { LoadingSpinner } from "@/components/loading-spinner"; // Note: Import komponen baru

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [router, session]);

  // Note: Ganti null dengan LoadingSpinner untuk UX yang lebih baik
  if (!session) {
    return <LoadingSpinner />;
  }

  return <AppSidebarLayout>{children}</AppSidebarLayout>;
}
