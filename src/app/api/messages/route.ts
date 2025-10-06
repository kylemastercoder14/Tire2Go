import { NextResponse } from "next/server";
import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  const body = await req.json();
  const { conversationId, content, senderType } = body;

  if (!conversationId || !content || !senderType) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Save message
  const message = await db.message.create({
    data: {
      conversationId,
      content,
      senderType,
      senderId: senderType === "SYSTEM" ? userId : null,
    },
  });

  // Update conversation's updatedAt
  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json(message);
}
