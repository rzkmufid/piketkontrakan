import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { eachDayOfInterval, format, getDay } from "date-fns";

// Mapping hari (0=Minggu, 1=Senin, dst) ke grup
const scheduleMap: { [key: number]: string[] } = {
  0: ["Grup 1", "Grup 2", "Grup 3"], // Minggu (Piket Bersama)
  1: ["Grup 1"], // Senin
  2: ["Grup 2"], // Selasa
  3: ["Grup 3"], // Rabu
  4: ["Grup 1"], // Kamis
  5: ["Grup 2"], // Jumat
  6: ["Grup 3"], // Sabtu
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
        // === PERUBAHAN DI SINI ===
        // Mengubah u.name menjadi u.username
        sql: "SELECT t.name as taskName, c.date, u.username as userName, u.group_name as groupName FROM task_completions c JOIN tasks t ON c.task_id = t.id JOIN users u ON c.user_id = u.id WHERE c.date BETWEEN ? AND ?",
        args: [startDate, endDate],
      }),
    ]);
    // ==========================

    const allTasks = tasksRes.rows as { id: number; name: string }[];
    const completions = completionsRes.rows as {
      taskName: string;
      date: string;
      userName: string; // <-- Alias 'userName' tetap sama
      groupName: string;
    }[];

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
          if (dayOfWeek === 0) {
            requiredTasks
              .get(dateString)
              ?.push({ taskName: task.name, group: "Piket Bersama" });
          } else {
            for (const group of groupsOnDuty) {
              requiredTasks
                .get(dateString)
                ?.push({ taskName: task.name, group: group });
            }
          }
        }
      }
    }

    const recapMap = new Map<
      string,
      { status: "Completed" | "Missed"; completedBy?: string; group: string }
    >();

    requiredTasks.forEach((tasks, date) => {
      tasks.forEach((task) => {
        const key = `${date}|${task.taskName}`;
        recapMap.set(key, { status: "Missed", group: task.group });
      });
    });

    completions.forEach((comp) => {
      const key = `${comp.date}|${comp.taskName}`;
      if (recapMap.has(key)) {
        recapMap.set(key, {
          status: "Completed",
          completedBy: comp.userName,
          group: comp.groupName,
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
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
