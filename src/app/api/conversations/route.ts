import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Hanapin existing OPEN conversation
  let conversation = await db.conversation.findFirst({
    where: { userId, status: "OPEN" },
    include: { messages: true },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: { userId, status: "OPEN" },
      include: { messages: true },
    });
  }

  return NextResponse.json(conversation);
}
