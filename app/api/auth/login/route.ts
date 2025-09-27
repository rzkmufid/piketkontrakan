// app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password harus diisi." },
        { status: 400 }
      );
    }

    // Ambil data user, TERMASUK group_name
    const userResult = await db.execute({
      sql: "SELECT id, username, role, group_name FROM users WHERE username = ? LIMIT 1",
      args: [username],
    });

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Username tidak ditemukan." },
        { status: 404 }
      );
    }

    // Verifikasi password (saat ini masih plaintext, sesuai skema Anda)
    // Di aplikasi production, di sini Anda akan membandingkan hash password.
    const userPasswordInDb = await db.execute({
      sql: "SELECT password FROM users WHERE username = ?",
      args: [username],
    });

    if (userPasswordInDb.rows[0].password !== password) {
      return NextResponse.json({ error: "Password salah." }, { status: 401 });
    }

    // Jika password benar, kirim data user sebagai respons
    const user = userResult.rows[0];

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
