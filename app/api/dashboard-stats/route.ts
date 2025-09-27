// app/api/dashboard-stats/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { format } from "date-fns";

// PENTING: Di aplikasi production, Anda perlu cara untuk mendapatkan sesi user di server.
// Untuk sekarang, kita akan mengambil data untuk SEMUA grup dan membiarkan frontend
// yang memfilternya nanti. Ini lebih sederhana untuk development.
// const session = await getServerSession();
// const userGroupName = session?.user?.group;

export async function GET(request: Request) {
  try {
    const db = getDb();
    const today = format(new Date(), "yyyy-MM-dd");

    // Ambil semua data yang relevan dalam beberapa query
    const [totalTasksRes, completedTasksRes, allUsersRes] = await Promise.all([
      db.execute("SELECT COUNT(*) as count FROM tasks"),
      db.execute({
        sql: "SELECT COUNT(*) as count FROM task_completions WHERE date = ?",
        args: [today],
      }),
      db.execute("SELECT username, group_name FROM users"),
    ]);

    const totalTasks = totalTasksRes.rows[0]?.count ?? 0;
    const tasksCompleted = completedTasksRes.rows[0]?.count ?? 0;

    return NextResponse.json({
      totalTasks,
      tasksCompleted,
      allUsers: allUsersRes.rows,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
