// app/api/users/[id]/reset-password/route.ts

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// --- Fungsi untuk RESET PASSWORD User ---
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const id = params.id;
    const defaultPassword = "password123"; // Tentukan password default Anda

    const result = await db.execute({
      sql: "UPDATE users SET password = ? WHERE id = ?",
      args: [defaultPassword, id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Password berhasil direset" });
  } catch (error) {
    console.error(`Failed to reset password for user ${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
