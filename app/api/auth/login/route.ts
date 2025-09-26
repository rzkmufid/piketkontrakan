// <CHANGE> new: login endpoint using libsql
import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const db = getDb()
    const res = await db.execute({
      sql: "SELECT id, username, password, role, group_name FROM users WHERE username = ? LIMIT 1",
      args: [username],
    })

    const row = res.rows[0] as any
    if (!row || row.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = {
      id: Number(row.id),
      username: String(row.username),
      role: (row.role as string) || "user",
      group: (row.group_name as string) || "Grup 1",
    }

    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 })
  }
}
