/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { IconBubbleTextFilled, IconX } from "@tabler/icons-react";
import { Loader2, Send, Square, X, Maximize, Minimize } from "lucide-react";
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

const ChatApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(true);
  const chatIconRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);

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
        if (res.ok) {
          const data = await res.json();

          // Map DB messages to useChat format
          const mapped = data?.messages?.map((msg: any) => ({
            id: msg.id,
            role: msg.senderType === "CUSTOMER" ? "user" : "assistant",
            content: msg.content,
            parts: [{ type: "text", text: msg.content }],
          }));

          if (mapped) setMessages(mapped);
        }
      } catch (e) {
        console.error("Failed to load conversation", e);
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

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!loaded) return null; // wag muna mag render kung di pa loaded

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
              className="bg-primary p-7 rounded-full cursor-pointer shadow-lg hover:shadow-xl hover:bg-primay/90 transition-all hover:scale-110 z-50"
            >
              {isOpen ? (
                <IconX className="size-7 text-white" />
              ) : (
                <IconBubbleTextFilled className="size-7 text-white" />
              )}
            </Button>
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
                ? "inset-0 w-full h-full flex items-center justify-center p-4"
                : "bottom-20 right-4 w-[95%] md:w-[900px]"
            }`}
          >
            <Card className="flex flex-col w-full h-full border-2 shadow-xl">
              <CardHeader className="flex flex-row justify-between items-center border-b">
                <div>
                  <CardTitle>Chat Support</CardTitle>
                  <CardDescription>How can we help you?</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    size="icon"
                    className="rounded-full"
                    variant="ghost"
                  >
                    {isFullscreen ? (
                      <Minimize className="size-5" />
                    ) : (
                      <Maximize className="size-5" />
                    )}
                  </Button>
                  <Button
                    onClick={toggleChat}
                    size="icon"
                    className="rounded-full"
                    variant="ghost"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 overflow-hidden">
                <ScrollArea
                  className={`${isFullscreen ? "h-full" : "h-[500px]"} pr-4`}
                >
                  {messages.length === 0 && (
                    <div className="w-full mt-32 text-gray-500 items-center justify-center flex gap-3">
                      No message yet.
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
                        className={`mb-4 ${
                          message.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`inline-block rounded-lg px-3 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-white"
                              : "bg-muted text-black"
                          }`}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ children, ...props }) {
                                return (
                                  <code
                                    className="bg-gray-200 px-1 rounded"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                              ul: ({ children }) => (
                                <ul className="list-disc ml-4">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal ml-4">
                                  {children}
                                </ol>
                              ),
                            }}
                          >
                            {textContent}
                          </ReactMarkdown>
                        </div>
                      </div>
                    );
                  })}

                  {(status === "submitted" || status === "streaming") && (
                    <div className="w-full items-center flex justify-center flex-col gap-3">
                      {status === "submitted" && (
                        <Loader2 className="animate-spin size-5" />
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="text-center w-full flex items-center justify-center gap-1 mt-2">
                      <span>An error occured.</span>
                      <button
                        type="button"
                        className="underline cursor-pointer text-destructive"
                        onClick={() => regenerate()}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (input.trim()) {
                      sendMessage({ text: input });
                      setInput("");
                    }
                  }}
                  className="flex w-full items-center space-x-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={status !== "ready"}
                    className="flex-1"
                    placeholder="Ask something..."
                  />
                  {status === "streaming" ? (
                    <Button type="button" onClick={() => stop()}>
                      <Square className="size-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={status !== "ready"}>
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
