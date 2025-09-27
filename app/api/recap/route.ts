// app/api/recap/route.ts

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { eachDayOfInterval, format, getDay } from "date-fns";
import { id as localeID } from "date-fns/locale"; // Untuk penyesuaian zona waktu

// Mapping hari (0=Minggu, 1=Senin, dst) ke grup
const scheduleMap: { [key: number]: string[] } = {
  0: ["Piket Bersama"], // Minggu kini menggunakan grup khusus
  1: ["Grup 1"],
  2: ["Grup 2"],
  3: ["Grup 3"],
  4: ["Grup 1"],
  5: ["Grup 2"],
  6: ["Grup 3"],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();

    const [tasksRes, completionsRes] = await Promise.all([
      db.execute("SELECT id, name FROM tasks"),
      db.execute({
        sql: "SELECT t.name as taskName, c.date, u.username as userName, u.group_name as groupName FROM task_completions c JOIN tasks t ON c.task_id = t.id JOIN users u ON c.user_id = u.id WHERE c.date BETWEEN ? AND ?",
        args: [startDate, endDate],
      }),
    ]);

    const allTasks = tasksRes.rows as { id: number; name: string }[];
    const completions = completionsRes.rows as {
      taskName: string;
      date: string;
      userName: string;
      groupName: string;
    }[];

    // Buat daftar semua tugas yang seharusnya dikerjakan
    const requiredTasks = new Map<
      string,
      { taskName: string; group: string }[]
    >();
    const interval = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    });

    for (const day of interval) {
      const dayOfWeek = getDay(day);
      const dateString = format(day, "yyyy-MM-dd");
      const groupsOnDuty = scheduleMap[dayOfWeek];

      if (groupsOnDuty) {
        if (!requiredTasks.has(dateString)) {
          requiredTasks.set(dateString, []);
        }
        for (const task of allTasks) {
          for (const group of groupsOnDuty) {
            requiredTasks
              .get(dateString)
              ?.push({ taskName: task.name, group: group });
          }
        }
      }
    }

    // Gabungkan data 'required' dan 'completions' untuk rekap final
    const recapMap = new Map<
      string,
      { status: "Completed" | "Missed"; completedBy?: string; group: string }
    >();

    // Tandai semua sebagai "Missed" terlebih dahulu
    requiredTasks.forEach((tasks, date) => {
      tasks.forEach((task) => {
        const key = `${date}|${task.taskName}`;
        recapMap.set(key, { status: "Missed", group: task.group });
      });
    });

    // Timpa dengan data "Completed"
    completions.forEach((comp) => {
      // Perlu parsing tanggal dengan hati-hati untuk mendapatkan hari yang benar
      const completionDate = new Date(comp.date.replace(/-/g, "/"));
      const dayOfWeek = getDay(completionDate);
      const key = `${comp.date}|${comp.taskName}`;

      // Ambil tugas yang ada dari map, jangan timpa jika sudah ada yang menyelesaikan
      const existingTask = recapMap.get(key);
      if (existingTask && existingTask.status !== "Completed") {
        recapMap.set(key, {
          status: "Completed",
          completedBy: comp.userName,
          // === PERUBAHAN LOGIKA UTAMA ADA DI SINI ===
          // Jika hari Minggu, tampilkan "Piket Bersama", jika tidak, tampilkan grup asli user
          group: dayOfWeek === 0 ? "Piket Bersama" : comp.groupName,
        });
      }
    });

    const recap = Array.from(recapMap.entries())
      .map(([key, value]) => {
        const [date, taskName] = key.split("|");
        return { date, taskName, ...value };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ recap });
  } catch (error) {
    console.error("Failed to fetch recap:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
