// <CHANGE> new: read/write task completions per date
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date")
    if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 })

    const db = getDb()
    const sql = `
      SELECT c.id, c.task_id, c.date, c.user_id, u.username
      FROM task_completions c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.date = ?
    `
    const res = await db.execute({ sql, args: [date] })
    return NextResponse.json({ completions: res.rows })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load completions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { taskId, date, completed, userId } = await req.json()
    if (taskId == null || !date || userId == null) {
      return NextResponse.json({ error: "taskId, date, userId are required" }, { status: 400 })
    }

    const db = getDb()
    if (completed) {
      await db.execute({
        sql: `
          INSERT INTO task_completions (task_id, date, user_id)
          VALUES (?, ?, ?)
          ON CONFLICT(task_id, date) DO UPDATE SET user_id = excluded.user_id
        `,
        args: [taskId, date, userId],
      })
    } else {
      await db.execute({
        sql: "DELETE FROM task_completions WHERE task_id = ? AND date = ?",
        args: [taskId, date],
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update completion" }, { status: 500 })
  }
}
