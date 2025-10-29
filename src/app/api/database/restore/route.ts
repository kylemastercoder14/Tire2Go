/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { backupTables } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

export async function POST(req: NextRequest) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { userId } = await useUser();
  const fileName = `restore_${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.json`;

  try {
    // Parse uploaded JSON body
    const body = await req.json();

    // ✅ Restore each table sequentially
    for (const table of backupTables) {
      const rows = body[table];
      if (!Array.isArray(rows) || rows.length === 0) continue;

      // @ts-ignore - dynamic table access
      const model = db[table];
      if (!model) continue;

      for (const row of rows) {
        // ✅ Try upsert if `id` field exists
        if (row.id) {
          await model.upsert({
            where: { id: row.id },
            update: row,
            create: row,
          });
        } else {
          // fallback: simple create
          await model.create({ data: row });
        }
      }
    }

    // ✅ Log restore success
    await db.backupHistory.create({
      data: {
        action: "restore",
        filename: fileName,
        status: "success",
      },
    });

    await db.systemLogs.create({
      data: {
        action: "restore",
        details: `Restore from ${fileName} completed  successfully.`,
        userId: userId ?? null, // optional if user context available
      },
    });

    return NextResponse.json(
      { message: "Restore completed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Restore failed:", error);

    await db.backupHistory.create({
      data: {
        action: "restore",
        filename: fileName,
        status: "failed",
      },
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
