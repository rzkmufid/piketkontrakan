// app/api/groups/[name]/route.ts

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// --- Fungsi untuk UPDATE (Edit) Nama Grup ---
export async function PUT(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const db = getDb();
    // Gunakan decodeURIComponent untuk menangani spasi atau karakter spesial di URL
    const oldName = decodeURIComponent(params.name);
    const { newName } = await request.json();

    if (!newName) {
      return NextResponse.json(
        { error: "Nama baru harus diisi" },
        { status: 400 }
      );
    }

    // === PERUBAHAN DI SINI ===
    // Gunakan db.batch() untuk menjalankan beberapa perintah dalam satu transaksi
    await db.batch([
      {
        sql: "UPDATE users SET group_name = ? WHERE group_name = ?",
        args: [newName, oldName],
      },
      {
        sql: "UPDATE groups SET name = ? WHERE name = ?",
        args: [newName, oldName],
      },
    ]);
    // ==========================

    return NextResponse.json({ message: "Nama grup berhasil diperbarui" });
  } catch (error) {
    console.error(`Failed to update group ${params.name}:`, error);
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return NextResponse.json(
        { error: "Nama grup tersebut sudah digunakan." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- Fungsi untuk DELETE Grup (tidak ada perubahan, tapi disertakan agar lengkap) ---
export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const db = getDb();
    const name = decodeURIComponent(params.name);

    const usersInGroupRes = await db.execute({
      sql: "SELECT COUNT(*) as count FROM users WHERE group_name = ?",
      args: [name],
    });

    const usersInGroup = usersInGroupRes.rows[0].count as number;

    if (usersInGroup > 0) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus grup karena masih ada anggota." },
        { status: 400 }
      );
    }

    const result = await db.execute({
      sql: "DELETE FROM groups WHERE name = ?",
      args: [name],
    });

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { error: "Grup tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Grup berhasil dihapus" });
  } catch (error) {
    console.error(`Failed to delete group ${params.name}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
