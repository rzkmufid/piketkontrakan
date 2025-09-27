// app/api/users/[id]/route.ts

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// --- Fungsi untuk UPDATE (Edit) User ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const id = params.id;
    const { username, groupName, role } = await request.json();

    if (!username || !groupName || !role) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: "UPDATE users SET username = ?, group_name = ?, role = ? WHERE id = ?",
      args: [username, groupName, role, id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User berhasil diperbarui" });
  } catch (error) {
    console.error(`Failed to update user ${params.id}:`, error);
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

// --- Fungsi untuk DELETE User ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const id = params.id;

    const result = await db.execute({
      sql: "DELETE FROM users WHERE id = ?",
      args: [id],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error(`Failed to delete user ${params.id}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
