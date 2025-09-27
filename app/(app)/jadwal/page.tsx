"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import {
  useSession,
  isPicketDay,
  formatTanggalIndo,
} from "@/components/session-context";
import useSWR from "swr";

type Task = {
  id: number;
  name: string;
  description?: string;
};

type Completion = {
  id: number;
  task_id: number;
  date: string;
  user_id: number;
  username: string;
};

type TaskView = {
  id: number;
  name: string;
  completedByName?: string;
};

export default function JadwalPage() {
  const { session } = useSession();
  const name = session?.name ?? "Pengguna";
  const group = session?.group ?? "Grup 1";

  const tanggal = formatTanggalIndo(new Date());
  const bolehPiket = isPicketDay(group, new Date());

  const dateKey = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  const { data: tasks = [] } = useSWR<Task[]>("/api/tasks", async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    const data = await res.json();
    return data.tasks;
  });

  const { data: completions = [], mutate } = useSWR<Completion[]>(
    ["/api/completions", dateKey],
    async ([url, date]) => {
      const res = await fetch(`${url}?date=${date}`);
      if (!res.ok) throw new Error("Failed to fetch completions");
      const data = await res.json();
      return data.completions;
    }
  );

  // Merge tasks with completions
  const taskViews: TaskView[] = tasks.map((task) => {
    const completion = completions.find((c) => c.task_id === task.id);
    return {
      id: task.id,
      name: task.name,
      completedByName: completion?.username,
    };
  });

  const allDone =
    taskViews.length > 0 && taskViews.every((t) => !!t.completedByName);

  const toggleTask = async (taskId: number, checked: boolean) => {
    if (!session) return;

    try {
      const res = await fetch("/api/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          date: dateKey,
          completed: checked,
          userId: session.id,
        }),
      });

      if (res.ok) {
        await mutate();
      }
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  // === PERUBAHAN DI SINI ===
  // Sekarang, blokir halaman HANYA jika BUKAN hari piket DAN user BUKAN superadmin.
  if (!bolehPiket && session?.role !== "superadmin") {
    return (
      <main className="mx-auto grid min-h-[60svh] w-full max-w-3xl place-items-center p-4">
        <p className="text-center text-base">
          Hari ini bukan jadwal piket untuk grup Anda ({group}). Santai dulu!
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          Tugas Piket: {tanggal}
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tugas Hari Ini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid gap-3">
            {taskViews.map((task) => {
              const checked = !!task.completedByName;
              return (
                <li
                  key={task.id}
                  className="flex items-start justify-between gap-4 rounded-md border p-3"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={task.id.toString()}
                      checked={checked}
                      onCheckedChange={(v) => toggleTask(task.id, Boolean(v))}
                      aria-label={`Checklist ${task.name}`}
                    />
                    <div>
                      <label
                        htmlFor={task.id.toString()}
                        className="cursor-pointer font-medium"
                      >
                        {task.name}
                      </label>
                      <p className="text-muted-foreground text-xs">
                        Selesai oleh: {checked ? task.completedByName : "-"}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {!allDone && taskViews.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Peringatan</AlertTitle>
              <AlertDescription>
                Peringatan: Masih ada tugas yang belum diselesaikan!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
