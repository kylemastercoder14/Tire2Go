/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import db from "@/lib/db";
import { backupTables } from "@/lib/utils";

export async function GET() {
  const fileName = `backup_${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.json`;
  const publicDir = path.join(process.cwd(), "public");
  const databaseDir = path.join(publicDir, "database");
  const filePath = path.join(databaseDir, fileName);

  try {
    // ✅ Make sure folders exist
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
    if (!fs.existsSync(databaseDir)) fs.mkdirSync(databaseDir);

    const backup: Record<string, any[]> = {};

    // ✅ Loop through Prisma tables and dump all data
    for (const table of backupTables) {
      // @ts-ignore - dynamic access to Prisma client
      const data = await db[table].findMany();
      backup[table] = data || [];
    }

    // ✅ Write backup JSON to file
    fs.writeFileSync(filePath, JSON.stringify(backup, null, 2));

    // ✅ Save backup record in DB
    await db.backupHistory.create({
      data: {
        action: "backup",
        filename: fileName,
        status: "success",
      },
    });

    return NextResponse.json(
      { message: "Backup created successfully", file: `/database/${fileName}` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Backup failed:", error);

    await db.backupHistory.create({
      data: {
        action: "backup",
        filename: fileName,
        status: "failed",
      },
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
