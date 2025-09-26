"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/components/session-context"

export default function RootRedirectPage() {
  const router = useRouter()
  const { session } = useSession()

  useEffect(() => {
    if (session) router.replace("/home")
    else router.replace("/login")
  }, [router, session])

  return null
}
