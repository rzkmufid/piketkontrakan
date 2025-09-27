"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "@/components/session-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ListChecks, User, Lock, Loader2, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const { session, login, isLoading } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading tombol

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true); // Mulai loading

    try {
      const ok = await login(username, password);
      if (!ok) {
        setError("Username atau password salah.");
      }
      // Redirect sudah dihandle di dalam fungsi login di context
    } catch (err) {
      setError("Terjadi kesalahan pada server.");
    } finally {
      setIsSubmitting(false); // Selesai loading
    }
  };

  if (isLoading || session) {
    return <LoadingSpinner />;
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ListChecks className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Login Anggota Kontrakan</CardTitle>
          <CardDescription>
            Masukkan kredensial Anda untuk melanjutkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            {error && (
              <Alert variant="destructive" className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-9"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="pl-9"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="mx-auto text-xs text-muted-foreground">
            Belum punya akun? Hubungi Super Admin.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
