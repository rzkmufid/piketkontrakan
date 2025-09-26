"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Calendar, LogOut, Shield } from "lucide-react"
import { useSession } from "@/components/session-context"

export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { session, logout } = useSession()
  const active = (href: string) => pathname === href

  return (
    <SidebarProvider>
      <div className="flex min-h-svh">
        <Sidebar className="border-r">
          <SidebarHeader>
            <div className="px-2 py-1">
              <div className="text-xl font-semibold">Piket App</div>
              <div className="text-muted-foreground text-xs">Checklist Kontrakan</div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={active("/home")} className={cn("cursor-pointer")}>
                  <Link href="/home" aria-label="Home">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={active("/jadwal")} className={cn("cursor-pointer")}>
                  <Link href="/jadwal" aria-label="Jadwal">
                    <Calendar />
                    <span>Jadwal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {session?.role === "superadmin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={active("/super-admin")} className={cn("cursor-pointer")}>
                    <Link href="/super-admin" aria-label="Super Admin">
                      <Shield />
                      <span>Super Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>

          <SidebarSeparator />

          <SidebarFooter>
            <div className="rounded-md border p-2">
              <div className="text-sm font-medium">
                {session ? `${session.name} - ${session.group}` : "Tidak login"}
              </div>
              <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="px-4 py-6">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
