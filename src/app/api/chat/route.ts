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

  // Run the model with streaming
  const result = streamText({
    model: google("gemini-2.5-pro"),
    messages: [initialPrompt, ...convertToModelMessages(messages)],
    temperature: 0.5,
  });

  // Collect full response text (blocking, but allows inspection)
  const fullText = await result.text;

  if (
    fullText.includes("I’m sorry, that’s beyond my scope") ||
    fullText.includes("forward your concern to a real Tire2Go staff")
  ) {
    await db.forwardedMessage.create({
      data: {
        userId: userId || null,
        message:
          messages[messages.length - 1]?.parts
            ?.map((p: any) => p.text)
            .join(" ")
            .trim() || "No content",
        status: "PENDING",
      },
    });
  }

  // Return stream back to client
  return result.toUIMessageStreamResponse();
}
