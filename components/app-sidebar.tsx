"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Calendar,
  LogOut,
  Shield,
  Menu,
  ListChecks,
  BookCheck,
} from "lucide-react";
import { useSession } from "@/components/session-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/jadwal", label: "Jadwal", icon: Calendar },
  { href: "/recap", label: "Rekap", icon: BookCheck },
  { href: "/super-admin", label: "Super Admin", icon: Shield, adminOnly: true },
];

export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, logout } = useSession();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const active = (href: string) => pathname === href;

  // Konten sidebar kita buat menjadi komponen terpisah
  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex h-full w-full flex-col border-r bg-background">
      <header className="flex items-center gap-2 border-b p-4">
        <ListChecks className="h-7 w-7 text-primary" />
        <div>
          <div className="text-xl font-semibold">Piket App</div>
          <div className="text-xs text-muted-foreground">
            Checklist Kontrakan
          </div>
        </div>
      </header>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          if (item.adminOnly && session?.role !== "superadmin") return null;
          return (
            <Button
              key={item.href}
              asChild
              variant={active(item.href) ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={onClose}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <footer className="border-t p-2">
        <div className="flex items-center gap-3 rounded-lg p-2">
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
      </footer>
    </div>
  );

  return (
    <div className="flex min-h-svh">
      {/* Sidebar Desktop */}
      <div className="hidden md:block md:w-72">
        <SidebarContent />
      </div>

      {/* Konten Utama */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="font-semibold">Piket App</div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Sidebar Mobile */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 h-full w-72 md:hidden">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}
