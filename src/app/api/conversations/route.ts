import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  const cookieStore = await cookies();
  const guestConversationId = cookieStore.get("guest_conversation_id")?.value;
  let shouldSetGuestCookie = false;

  let conversation = userId
    ? await db.conversation.findFirst({
        where: { userId, status: "OPEN" },
        include: { messages: true },
      })
    : guestConversationId
      ? await db.conversation.findFirst({
          where: { id: guestConversationId, userId: null, status: "OPEN" },
          include: { messages: true },
        })
      : null;

  if (!conversation) {
    conversation = await db.conversation.create({
      data: { userId: userId ?? null, status: "OPEN" },
      include: { messages: true },
    });

    if (!userId) {
      shouldSetGuestCookie = true;
    }
  }

  const response = NextResponse.json(conversation);

  if (!userId && shouldSetGuestCookie) {
    response.cookies.set("guest_conversation_id", conversation.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}
