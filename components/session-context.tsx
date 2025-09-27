"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { useRouter, usePathname } from "next/navigation";

type Session = {
  id: number;
  name: string;
  group: string;
  role: "user" | "superadmin";
};

type SessionContextType = {
  session: Session | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const SessionContext = React.createContext<SessionContextType | undefined>(
  undefined
);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Memeriksa sesi dari localStorage saat pertama kali dimuat
    try {
      const raw = localStorage.getItem("piket_session");
      if (raw) {
        setSession(JSON.parse(raw));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // INI ADALAH LOGIKA REDIRECT TERPUSAT
    if (isLoading) return; // Jangan lakukan apa-apa jika sesi masih diperiksa

    const isAuthPage = pathname === "/login";

    if (!session && !isAuthPage) {
      // Jika TIDAK ada sesi DAN kita TIDAK di halaman login, paksa ke login.
      router.replace("/login");
    } else if (session && isAuthPage) {
      // Jika ADA sesi DAN kita mencoba akses halaman login, paksa ke home.
      router.replace("/home");
    }
  }, [isLoading, session, pathname, router]);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password }),
        });
        if (!res.ok) return false;
        const { user } = await res.json();
        const nextSession: Session = {
          id: user.id,
          name: user.username,
          group: user.group_name,
          role: user.role,
        };
        setSession(nextSession);
        localStorage.setItem("piket_session", JSON.stringify(nextSession));
        // Redirect ke home setelah login berhasil
        router.replace("/home");
        return true;
      } catch {
        return false;
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem("piket_session");
    // Redirect ke login setelah logout
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ session, login, logout, isLoading }),
    [session, login, logout, isLoading]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

// Helpers for schedules
export function getGroupScheduleLabel(group: string): string {
  // Simple default mapping:
  // Grup 1: Senin & Kamis
  // Grup 2: Selasa & Jumat
  // Grup 3: Rabu & Sabtu
  if (group === "Grup 2") return "Selasa & Jumat";
  if (group === "Grup 3") return "Rabu & Sabtu";
  return "Senin & Kamis";
}

export function isPicketDay(group: string, date = new Date()): boolean {
  const day = date.getDay(); // 0 Sun, 1 Mon, ... 6 Sat
  if (day === 0) return true; // Sunday => always allowed
  // Grup 1 => Mon/Thu => 1,4
  // Grup 2 => Tue/Fri => 2,5
  // Grup 3 => Wed/Sat => 3,6
  const map: Record<string, number[]> = {
    "Grup 1": [1, 4],
    "Grup 2": [2, 5],
    "Grup 3": [3, 6],
  };
  const allowed = map[group] || map["Grup 1"];
  return allowed.includes(day);
}

export function formatTanggalIndo(date = new Date()): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
