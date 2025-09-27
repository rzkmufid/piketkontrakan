// app/api/groups/route.ts

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json(
        { error: "Nama grup harus diisi" },
        { status: 400 }
      );
    }
    const result = db.prepare("INSERT INTO groups (name) VALUES (?)").run(name);
    return NextResponse.json(
      { message: "Grup berhasil dibuat" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create group:", error);
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return NextResponse.json(
        { error: "Nama grup sudah ada." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
