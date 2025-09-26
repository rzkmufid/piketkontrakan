"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/components/session-context"
import { AppSidebarLayout } from "@/components/app-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) router.replace("/login")
  }, [router, session])

  // Avoid flicker: render nothing until session check passes or redirects
  if (!session) return null

  return <AppSidebarLayout>{children}</AppSidebarLayout>
}
