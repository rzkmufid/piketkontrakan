// app/api/admin/data/route.ts

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Logika jadwal yang benar, disimpan langsung di dalam kode
const getSchedule = () => {
  return {
    Senin: "Grup 1",
    Selasa: "Grup 2",
    Rabu: "Grup 3",
    Kamis: "Grup 1",
    Jumat: "Grup 2",
    Sabtu: "Grup 3",
    Minggu: "Piket Bersama", // Nilai khusus untuk piket bersama
  };
};

export async function GET() {
  try {
    const db = getDb();

    // Sekarang kita ambil data USERS dan GROUPS dari database
    const [usersRes, groupsRes] = await Promise.all([
      db.execute(
        "SELECT id, username, group_name, role FROM users ORDER BY username ASC"
      ),
      db.execute("SELECT name FROM groups ORDER BY name ASC"), // <-- Query untuk mengambil data grup
    ]);

    // Panggil fungsi untuk mendapatkan objek jadwal
    const scheduleObject = getSchedule();

    // Siapkan data lengkap untuk dikirim sebagai respons
    const data = {
      users: usersRes.rows,
      groups: groupsRes.rows, // <-- Sertakan data grup di sini
      schedule: scheduleObject,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch admin data:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
