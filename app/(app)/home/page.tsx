"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession, getGroupScheduleLabel } from "@/components/session-context"

export default function HomePage() {
  const { session } = useSession()
  const name = session?.name ?? "Pengguna"
  const group = session?.group ?? "Grup 1"
  const jadwal = getGroupScheduleLabel(group)

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">Dashboard Piket</h1>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Selamat Datang, {name}!</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Aplikasi ini membantu Anda mencatat dan memeriksa tugas piket harian.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Piket Anda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="font-medium">Nama:</span> {name}
              </div>
              <div>
                <span className="font-medium">Grup:</span> {group}
              </div>
              <div>
                <span className="font-medium">Jadwal Piket:</span> {jadwal}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
