"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useSession,
  isPicketDay,
  formatTanggalIndo,
} from "@/components/session-context";
import {
  ArrowRight,
  CalendarDays,
  User,
  Users,
  CheckCircle2,
  ListTodo,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Komponen Skeleton ---
const HomePageSkeleton = () => (
  <main className="mx-auto w-full max-w-5xl space-y-6">
    <header>
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </header>
    <section>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-7 w-1/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-1/4" />
        </CardContent>
      </Card>
    </section>
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </section>
  </main>
);

export default function HomePage() {
  const { session, isLoading: isSessionLoading } = useSession();
  const { data: stats, isLoading: isStatsLoading } = useSWR(
    "/api/dashboard-stats",
    fetcher
  );

  const isLoading = isSessionLoading || isStatsLoading;

  if (isLoading) {
    return <HomePageSkeleton />;
  }

  const name = session?.name ?? "Pengguna";
  const group = session?.group; // Ambil grup, bisa jadi undefined
  const isSuperAdmin = session?.role === "superadmin";

  // Superadmin selalu dianggap "boleh piket" untuk melihat tugas
  const hariIniPiket = isSuperAdmin
    ? true
    : isPicketDay(group || "", new Date());

  const groupMembers =
    stats?.allUsers?.filter(
      (user: { group_name: string }) => user.group_name === group
    ) || [];

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          Selamat Datang Kembali, {name}!
        </h1>
        <p className="text-muted-foreground">
          Berikut adalah ringkasan status piket Anda hari ini,{" "}
          {format(new Date(), "eeee, dd MMMM yyyy", { locale: localeID })}.
        </p>
      </header>

      {/* Kartu Status Utama */}
      <section>
        <Card
          className={
            hariIniPiket ? "bg-primary/10 border-primary" : "bg-muted/50"
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {hariIniPiket ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <CalendarDays className="h-6 w-6 text-muted-foreground" />
              )}
              <span>Status Piket Hari Ini</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg font-medium">
                {isSuperAdmin
                  ? "🔑 Anda memiliki akses penuh sebagai Super Admin."
                  : hariIniPiket
                  ? "✅ Hari ini adalah jadwal piket untuk grup Anda!"
                  : "❌ Hari ini bukan jadwal piket Anda."}
              </p>
              {hariIniPiket && (
                <Button asChild>
                  <Link href="/jadwal">
                    Lihat & Kerjakan Tugas{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Grid Informasi Tambahan */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <User className="mr-3 h-5 w-5 text-muted-foreground" /> Informasi
              Anda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm pl-9">
            <p>
              <span className="font-medium text-muted-foreground">Nama:</span>{" "}
              {name}
            </p>
            {/* Tampilkan grup hanya jika ada */}
            {group && (
              <p>
                <span className="font-medium text-muted-foreground">Grup:</span>{" "}
                {group}
              </p>
            )}
            <p>
              <span className="font-medium text-muted-foreground">Role:</span>{" "}
              {session?.role}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ListTodo className="mr-3 h-5 w-5 text-muted-foreground" />{" "}
              Progres Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {stats?.tasksCompleted ?? 0} dari {stats?.totalTasks ?? 0} tugas
                selesai
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((stats?.tasksCompleted ?? 0) / (stats?.totalTasks || 1)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Kartu ini sekarang kondisional */}
        {isSuperAdmin ? (
          <Card className="bg-secondary/50 border-secondary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="mr-3 h-5 w-5" /> Panel Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-4">
              <p className="text-sm text-secondary-foreground">
                Akses semua fitur manajemen aplikasi.
              </p>
              <Button asChild variant="secondary">
                <Link href="/super-admin">
                  Buka Halaman Admin <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-3 h-5 w-5 text-muted-foreground" /> Anggota{" "}
                {group}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupMembers.map((member: { username: string }) => (
                <div key={member.username} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 text-xs">
                    <AvatarFallback>
                      {member.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{member.username}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
