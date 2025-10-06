/* eslint-disable @typescript-eslint/no-explicit-any */
import { convertToModelMessages, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { initialPrompt } from "@/constants/prompt";
import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create conversation
  let conversation = await db.conversation.findFirst({
    where: { userId, status: "OPEN" },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: { userId, status: "OPEN" },
    });
  }

  // Run the model with streaming
  const result = streamText({
    model: google("gemini-2.5-pro"),
    messages: [initialPrompt, ...convertToModelMessages(messages)],
    temperature: 0.5,
  });

  // Collect full response
  const fullText = await result.text;

  // Last user message
  const lastUserMessage =
    messages[messages.length - 1]?.parts
      ?.map((p: any) => p.text)
      .join(" ")
      .trim() || "No content";

  // Save customer message
  await db.message.create({
    data: {
      conversationId: conversation.id,
      senderType: "CUSTOMER",
      content: lastUserMessage,
    },
  });

  // Save AI/system reply
  await db.message.create({
    data: {
      conversationId: conversation.id,
      senderType: "SYSTEM",
      content: fullText,
    },
  });

  // Always return streaming response to the UI
  return result.toUIMessageStreamResponse();
}
