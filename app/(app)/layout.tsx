"use client";

import type React from "react";
import { useSession } from "@/components/session-context";
import { AppSidebarLayout } from "@/components/app-sidebar";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useSession();

  // Logika redirect sudah dipindahkan ke SessionProvider

  if (isLoading || !session) {
    // Tampilkan spinner selama loading atau sebelum redirect dari provider berjalan
    return <LoadingSpinner />;
  }

  // Jika sudah tidak loading dan sesi ada, tampilkan layout
  return <AppSidebarLayout>{children}</AppSidebarLayout>;
}
