import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  // Only admins/staff should see all conversations
  // TODO: add role check (Clerk or custom logic)
  const conversations = await db.conversation.findMany({
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(conversations);
}
