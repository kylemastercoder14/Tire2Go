/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { IconBubbleTextFilled, IconX } from "@tabler/icons-react";
import {
  Bot,
  Loader2,
  Maximize,
  MessageCircleMore,
  Minimize,
  Send,
  Sparkles,
  Square,
  UserCircle2,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DefaultChatTransport } from "ai";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const quickPrompts = [
  "What tire size fits my car?",
  "Recommend a budget-friendly tire for city driving.",
  "Do you have same-day installation available?",
];

const ChatApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(true);
  const chatIconRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  // Fetch messages from DB on mount
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const res = await fetch("/api/conversations");

        if (!res.ok) {
          throw new Error("Unable to load chat history.");
        }

        const data = await res.json();

        const mapped = data?.messages?.map((msg: any) => ({
          id: msg.id,
          role: msg.senderType === "CUSTOMER" ? "user" : "assistant",
          content: msg.content,
          parts: [{ type: "text", text: msg.content }],
        }));

        if (mapped) setMessages(mapped);
        setLoadError(null);
      } catch (e) {
        console.error("Failed to load conversation", e);
        setLoadError("We couldn't load the conversation right now.");
      } finally {
        setLoaded(true);
      }
    };
    fetchConversation();
  }, [setMessages]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowChatIcon(true);
      } else {
        setShowChatIcon(false);
        setIsOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsFullscreen(false);
  };

  const handleSend = (text: string) => {
    const nextValue = text.trim();

    if (!nextValue || status !== "ready") {
      return;
    }

    sendMessage({ text: nextValue });
    setInput("");
  };

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!loaded) return null; // wag muna mag render kung di pa loaded

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <>
      <AnimatePresence>
        {showChatIcon && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              ref={chatIconRef}
              onClick={toggleChat}
              size="icon"
              className="group relative h-14 w-14 rounded-full border border-primary/20 bg-primary p-0 shadow-[0_18px_40px_-18px_rgba(220,38,38,0.9)] transition-all hover:scale-110 hover:bg-primary/90"
            >
              {isOpen ? (
                <IconX className="size-5 sm:size-6 md:size-7 text-white" />
              ) : (
                <IconBubbleTextFilled className="size-5 sm:size-6 md:size-7 text-white" />
              )}
            </Button>
            {!isOpen && (
              <div className="pointer-events-none absolute -left-44 top-1/2 hidden -translate-y-1/2 rounded-full border border-border/60 bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur md:block">
                Chat with Tire2Go support
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 ${
              isFullscreen
                ? "inset-0 flex h-full w-full items-center justify-center p-2 sm:p-4"
                : "bottom-20 right-2 top-4 w-[calc(100%-1rem)] sm:right-4 sm:top-6 sm:w-[min(92vw,40rem)] lg:w-[min(92vw,46rem)]"
            }`}
          >
            <Card
              className={cn(
                "flex w-full py-0 flex-col overflow-hidden border-none bg-background/95 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur",
                isFullscreen
                  ? "h-full"
                  : "h-[calc(100dvh-6rem)] max-h-[52rem] min-h-[38rem]"
              )}
            >
              <CardHeader className="border-b border-border/60 bg-gradient-to-br from-primary via-primary to-red-700 p-0 text-primary-foreground">
                <div className="flex flex-col gap-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase text-white/90">
                          <span className="h-2 w-2 rounded-full bg-emerald-300" />
                          Live support
                        </span>
                      </div>
                      <CardTitle className="text-base sm:text-lg">
                        Tire2Go Assistant
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs text-white/80 sm:text-sm">
                        Ask about tire sizes, availability, fitment, and booking help.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        size="icon"
                        className="h-8 w-8 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:h-9 sm:w-9"
                        variant="ghost"
                      >
                        {isFullscreen ? (
                          <Minimize className="size-4 sm:size-5" />
                        ) : (
                          <Maximize className="size-4 sm:size-5" />
                        )}
                      </Button>
                      <Button
                        onClick={toggleChat}
                        size="icon"
                        className="h-8 w-8 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 sm:h-9 sm:w-9"
                        variant="ghost"
                      >
                        <X className="size-4 sm:size-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/90 sm:text-sm">
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2">
                      <div className="font-medium">Fast answers</div>
                      <div className="text-white/75">Product and service guidance</div>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2">
                      <div className="font-medium">Chat history</div>
                      <div className="text-white/75">Saved for this session automatically</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.08),_transparent_38%),linear-gradient(180deg,_rgba(248,250,252,0.92),_rgba(255,255,255,1))] p-0 dark:bg-background">
                <ScrollArea
                  className={cn(
                    "h-full w-full px-4 py-4 sm:px-5",
                    isFullscreen ? "max-h-full" : "max-h-full"
                  )}
                >
                  {loadError && (
                    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:text-sm">
                      {loadError}
                    </div>
                  )}

                  {messages.length === 0 && (
                    <div className="mt-8 rounded-[28px] border border-border/60 bg-background/90 p-5 shadow-sm sm:mt-10 sm:p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Sparkles className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold sm:text-base">
                            Start with a quick question
                          </p>
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            We can help with fitment, pricing guidance, and booking concerns.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {quickPrompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => handleSend(prompt)}
                            disabled={status !== "ready"}
                            className="flex w-full items-center justify-between rounded-2xl border border-border/70 bg-muted/30 px-3 py-3 text-left text-sm transition-colors hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span>{prompt}</span>
                            <MessageCircleMore className="size-4 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message, index) => {
                    const textContent = message.parts
                      .filter((part) => part.type === "text")
                      .map((part) => part.text)
                      .join("\n");

                    return (
                      <div
                        key={index}
                        className={cn(
                          "mb-4 flex sm:mb-5",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "flex max-w-[88%] items-end gap-2 sm:max-w-[80%]",
                          message.role === "user" && "flex-row-reverse"
                        )}>
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold shadow-sm",
                              message.role === "user"
                                ? "border-primary/20 bg-primary text-white"
                                : "border-border/70 bg-background text-foreground"
                            )}
                          >
                            {message.role === "user" ? (
                              <UserCircle2 className="size-4" />
                            ) : (
                              <Bot className="size-4" />
                            )}
                          </div>
                          <div
                            className={cn(
                              "rounded-[22px] border px-3 py-2.5 text-sm shadow-sm sm:px-4 sm:text-base",
                              message.role === "user"
                                ? "border-primary/10 bg-primary text-primary-foreground"
                                : "border-border/70 bg-background/95 text-foreground"
                            )}
                          >
                            <div className="mb-1 text-[11px] font-semibold uppercase opacity-70">
                              {message.role === "user" ? "You" : "Tire2Go"}
                            </div>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ children, ...props }) {
                                return (
                                  <code
                                    className={cn(
                                      "rounded px-1.5 py-0.5 text-[0.95em]",
                                      message.role === "user"
                                        ? "bg-white/15"
                                        : "bg-muted"
                                    )}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              p: ({ children }) => (
                                <p className="leading-6 [&:not(:last-child)]:mb-2">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="ml-4 list-disc space-y-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="ml-4 list-decimal space-y-1">
                                  {children}
                                </ol>
                              ),
                            }}
                          >
                            {textContent}
                          </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isBusy && (
                    <div className="flex w-full justify-start py-2">
                      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/95 px-4 py-3 text-sm text-muted-foreground shadow-sm">
                        <Loader2 className="size-4 animate-spin" />
                        <span>
                          {status === "submitted"
                            ? "Sending your message..."
                            : "Tire2Go is typing..."}
                        </span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-3 flex w-full items-center justify-center">
                      <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive sm:text-sm">
                        <span>Something went wrong while sending your message.</span>
                        <button
                          type="button"
                          className="cursor-pointer font-semibold underline underline-offset-2"
                          onClick={() => regenerate()}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t border-border/60 bg-background/95 p-3 sm:p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(input);
                  }}
                  className="flex w-full items-center gap-2"
                >
                  <div className="flex-1">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={status !== "ready"}
                      className="h-12 rounded-2xl border-border/70 bg-muted/25 px-4 text-sm sm:text-base"
                      placeholder="Ask about tire fitment, availability, or bookings..."
                    />
                    <p className="mt-2 px-1 text-[11px] text-muted-foreground sm:text-xs">
                      Tip: include your car make, model, and tire size for better suggestions.
                    </p>
                  </div>
                  {status === "streaming" ? (
                    <Button
                      type="button"
                      onClick={() => stop()}
                      size="icon"
                      className="h-12 -mt-5 w-12 flex-shrink-0 rounded-2xl"
                    >
                      <Square className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={status !== "ready" || !input.trim()}
                      size="icon"
                      className="h-12 -mt-5 w-12 flex-shrink-0 rounded-2xl"
                    >
                      <Send className="size-4" />
                    </Button>
                  )}
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatApp;
