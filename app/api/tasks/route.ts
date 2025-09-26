// <CHANGE> new: list tasks
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  try {
    const db = getDb()
    const res = await db.execute("SELECT id, name, description FROM tasks ORDER BY id ASC")
    return NextResponse.json({ tasks: res.rows })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load tasks" }, { status: 500 })
  }
}
