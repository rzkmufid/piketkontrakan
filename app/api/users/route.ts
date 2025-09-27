// app/api/users/route.ts

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { username, password, group, role } = await request.json();

    if (!username || !password || !group || !role) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: "INSERT INTO users (username, password, group_name, role) VALUES (?, ?, ?, ?)",
      args: [username, password, group, role],
    });

    if (result.rowsAffected > 0) {
      // === PERUBAHAN DI SINI ===
      // Ubah BigInt menjadi String sebelum dikirim sebagai JSON
      return NextResponse.json(
        {
          message: "Pengguna berhasil dibuat",
          userId: result.lastInsertRowid?.toString(),
        },
        { status: 201 }
      );
      // ==========================
    } else {
      throw new Error("Gagal menyimpan pengguna ke database.");
    }
  } catch (error) {
    console.error("Failed to create user:", error);
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return NextResponse.json(
        { error: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
