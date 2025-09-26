"use client"

import React from "react"
// import { getUserByCredentials } from "@/lib/sqlite"

type Session = {
  id: number
  name: string
  group: string // e.g., "Grup 1"
  role: "user" | "superadmin"
}

type SessionContextType = {
  session: Session | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const SessionContext = React.createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)

  // Load from localStorage once on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("piket_session")
      if (raw) setSession(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  const login = React.useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      if (!res.ok) return false

      const { user } = await res.json()
      const next: Session = {
        id: user.id,
        name: user.username, // Using username as display name
        group: user.group,
        role: user.role,
      }
      setSession(next)
      try {
        localStorage.setItem("piket_session", JSON.stringify(next))
      } catch {
        // ignore
      }
      return true
    } catch {
      return false
    }
  }, [])

  const logout = React.useCallback(() => {
    setSession(null)
    try {
      localStorage.removeItem("piket_session")
    } catch {
      // ignore
    }
  }, [])

  const value = React.useMemo(() => ({ session, login, logout }), [session, login, logout])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = React.useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within SessionProvider")
  return ctx
}

// Helpers for schedules
export function getGroupScheduleLabel(group: string): string {
  // Simple default mapping:
  // Grup 1: Senin & Kamis
  // Grup 2: Selasa & Jumat
  // Grup 3: Rabu & Sabtu
  if (group === "Grup 2") return "Selasa & Jumat"
  if (group === "Grup 3") return "Rabu & Sabtu"
  return "Senin & Kamis"
}

export function isPicketDay(group: string, date = new Date()): boolean {
  const day = date.getDay() // 0 Sun, 1 Mon, ... 6 Sat
  if (day === 0) return true // Sunday => always allowed
  // Grup 1 => Mon/Thu => 1,4
  // Grup 2 => Tue/Fri => 2,5
  // Grup 3 => Wed/Sat => 3,6
  const map: Record<string, number[]> = {
    "Grup 1": [1, 4],
    "Grup 2": [2, 5],
    "Grup 3": [3, 6],
  }
  const allowed = map[group] || map["Grup 1"]
  return allowed.includes(day)
}

export function formatTanggalIndo(date = new Date()): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
