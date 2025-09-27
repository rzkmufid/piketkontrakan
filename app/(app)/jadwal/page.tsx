"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TriangleAlert } from "lucide-react";
import {
  useSession,
  isPicketDay,
  formatTanggalIndo,
} from "@/components/session-context";
import useSWR from "swr";
import { toast } from "sonner";

type Task = { id: number; name: string; description?: string };
type Completion = {
  id: number;
  task_id: number;
  date: string;
  user_id: number;
  username: string;
};
type TaskView = { id: number; name: string; completedByName?: string };

const JadwalPageSkeleton = () => (
  <main className="mx-auto w-full max-w-3xl space-y-6">
    <header>
      <Skeleton className="h-8 w-3/4" />
    </header>
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className="flex items-start gap-3 rounded-md border p-3"
            >
              <Skeleton className="mt-1 h-5 w-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </main>
);

export default function JadwalPage() {
  const { session } = useSession();
  const group = session?.group ?? "Grup 1";
  const tanggal = formatTanggalIndo(new Date());
  const bolehPiket = isPicketDay(group, new Date());
  const dateKey = new Date().toISOString().split("T")[0];

  const {
    data: tasks,
    isLoading: tasksLoading,
    isValidating: tasksValidating,
  } = useSWR<Task[]>(
    "/api/tasks",
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      return data.tasks; // Ekstrak array 'tasks'
    },
    { revalidateOnFocus: false }
  );

  // === PERBAIKAN DI SINI ===
  const {
    data: completions,
    mutate,
    isLoading: completionsLoading,
    isValidating: completionsValidating,
  } = useSWR<Completion[]>(
    ["/api/completions", dateKey],
    async ([url, date]) => {
      const res = await fetch(`${url}?date=${date}`);
      if (!res.ok) throw new Error("Failed to fetch completions");
      const data = await res.json();
      return data.completions; // Ekstrak array 'completions'
    }
  );
  // ==========================

  const pageIsLoading =
    tasksLoading ||
    completionsLoading ||
    tasksValidating ||
    completionsValidating;

  const taskViews: TaskView[] = (tasks || []).map((task) => {
    const completion = (completions || []).find((c) => c.task_id === task.id);
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

    const currentCompletion = (completions || []).find(
      (c) => c.task_id === taskId
    );

    if (
      !checked &&
      currentCompletion &&
      currentCompletion.user_id !== session.id
    ) {
      toast.error("Aksi Ditolak", {
        description:
          "Anda tidak bisa menghapus centang tugas yang diselesaikan oleh orang lain.",
      });
      return;
    }

    const optimisticData = (completions || []).map((c) => ({ ...c }));

    if (checked) {
      if (!currentCompletion) {
        optimisticData.push({
          id: -1,
          task_id: taskId,
          date: dateKey,
          user_id: session.id,
          username: session.name,
        });
      }
    } else {
      const index = optimisticData.findIndex((c) => c.task_id === taskId);
      if (index > -1) {
        optimisticData.splice(index, 1);
      }
    }

    await mutate(optimisticData, { revalidate: false });

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
      if (!res.ok) throw new Error("Gagal menyimpan ke server");

      // --- PERUBAHAN DI SINI ---
      // Hapus baris mutate() di bawah ini.
      // mutate(); // <--- HAPUS ATAU KOMENTARI BARIS INI
      // ------------------------
    } catch (error) {
      console.error("Gagal mengubah tugas:", error);
      toast.error("Gagal Menyimpan", {
        description: "Perubahan Anda tidak berhasil disimpan.",
      });
      await mutate(completions, { revalidate: false });
    }
  };

  if (pageIsLoading) {
    return <JadwalPageSkeleton />;
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
                  className="flex cursor-pointer items-start justify-between gap-4 rounded-md border p-3 transition-colors hover:bg-muted/50"
                  onClick={() => toggleTask(task.id, !checked)}
                >
                  <div className="flex flex-1 items-start gap-3">
                    <Checkbox
                      id={task.id.toString()}
                      checked={checked}
                      disabled
                      aria-label={`Checklist ${task.name}`}
                      className="mt-1"
                    />
                    <div className="grid flex-1 gap-0.5">
                      <span className="font-medium">{task.name}</span>
                      <p className="text-xs text-muted-foreground">
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
