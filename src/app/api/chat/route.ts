/* eslint-disable @typescript-eslint/no-explicit-any */
import { convertToModelMessages, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { initialPrompt } from "@/constants/prompt";
import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const groq = createOpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const { userId } = await auth();
    const cookieStore = await cookies();
    const guestConversationId = cookieStore.get("guest_conversation_id")?.value;
    let shouldSetGuestCookie = false;

    // Get or create conversation
    let conversation = userId
      ? await db.conversation.findFirst({
          where: { userId, status: "OPEN" },
        })
      : guestConversationId
        ? await db.conversation.findFirst({
            where: { id: guestConversationId, userId: null, status: "OPEN" },
          })
        : null;

    if (!conversation) {
      conversation = await db.conversation.create({
        data: { userId: userId ?? null, status: "OPEN" },
      });

      if (!userId) {
        shouldSetGuestCookie = true;
      }
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq chat service is not configured yet." },
        { status: 500 }
      );
    }

    const lastUserMessage =
      messages[messages.length - 1]?.parts
        ?.map((p: any) => p.text)
        .join(" ")
        .trim() || "No content";

    await db.message.create({
      data: {
        conversationId: conversation.id,
        senderType: "CUSTOMER",
        content: lastUserMessage,
      },
    });

    const result = streamText({
      model: groq("llama-3.1-8b-instant"),
      messages: [initialPrompt, ...convertToModelMessages(messages)],
      temperature: 0.5,
      onError({ error }) {
        console.error("Groq streaming error:", error);
      },
      async onFinish({ text }) {
        if (!text.trim()) {
          return;
        }

        await db.message.create({
          data: {
            conversationId: conversation.id,
            senderType: "SYSTEM",
            content: text,
          },
        });
      },
    });

    const response = result.toUIMessageStreamResponse({
      onError(error) {
        console.error("UI chat response error:", error);
        return "The assistant could not respond right now. Please try again.";
      },
    });

    if (!userId && shouldSetGuestCookie) {
      response.headers.append(
        "Set-Cookie",
        [
          `guest_conversation_id=${conversation.id}`,
          "Path=/",
          "HttpOnly",
          "SameSite=Lax",
          process.env.NODE_ENV === "production" ? "Secure" : "",
          `Max-Age=${60 * 60 * 24 * 30}`,
        ]
          .filter(Boolean)
          .join("; ")
      );
    }

    return response;
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request." },
      { status: 500 }
    );
  }
}
