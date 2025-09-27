// components/app-sidebar.tsx
"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Home,
  Calendar,
  LogOut,
  Shield,
  Menu,
  ListChecks, // Icon baru untuk header
  Moon, // Icon untuk dark mode
  Sun, // Icon untuk light mode
} from "lucide-react";
import { useSession } from "@/components/session-context";
import { cn } from "@/lib/utils";

// Note: Definisikan item menu di sini agar mudah dikelola
const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/jadwal", label: "Jadwal", icon: Calendar },
  { href: "/super-admin", label: "Super Admin", icon: Shield, adminOnly: true },
];

export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, logout } = useSession();
  const { setTheme, theme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Fungsi untuk mendapatkan inisial nama
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-svh">
        {/* Note: Sidebar untuk layar besar (desktop) */}
        <Sidebar className="hidden border-r md:flex">
          <MainSidebarContent />
        </Sidebar>

        {/* Note: Konten utama */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
            {/* Note: Tombol Hamburger Menu untuk mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="font-semibold">Piket App</div>
          </header>

          {/* Note: Sidebar untuk mobile (muncul dari samping) */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className="fixed left-0 top-0 z-50 h-full w-72"
                onClick={(e) => e.stopPropagation()}
              >
                <Sidebar className="flex h-full">
                  <MainSidebarContent onClose={() => setSidebarOpen(false)} />
                </Sidebar>
              </div>
            </div>
          )}

          <main className="flex-1 px-4 py-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );

  // Note: Komponen konten sidebar dipisah agar tidak duplikat kode
  function MainSidebarContent({ onClose }: { onClose?: () => void }) {
    const active = (href: string) => pathname === href;
    return (
      <>
        <SidebarHeader className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 px-2 py-1">
            <ListChecks className="h-7 w-7 text-primary" />
            <div>
              <div className="text-xl font-semibold">Piket App</div>
              <div className="text-xs text-muted-foreground">
                Checklist Kontrakan
              </div>
            </div>
          </div>
          {/* Note: Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </SidebarHeader>

        <SidebarContent className="flex-1">
          <SidebarMenu>
            {/* Note: Render menu dari array navItems */}
            {navItems.map((item) => {
              if (item.adminOnly && session?.role !== "superadmin") {
                return null;
              }
              return (
                <SidebarMenuItem key={item.href} onClick={onClose}>
                  <SidebarMenuButton
                    asChild
                    isActive={active(item.href)}
                    className="cursor-pointer"
                  >
                    <Link href={item.href} aria-label={item.label}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src="#" alt={session?.name} />
              <AvatarFallback>
                {session ? getInitials(session.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-semibold">
                {session?.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {session?.group}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </>
    );
  }
}
