"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Minimize,
  Maximize,
  Inbox,
  Loader2,
  Square,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  userId: string | null;
  user?: { authId: string; email?: string | null };
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  senderType: "CUSTOMER" | "SYSTEM";
  createdAt: string;
}

const AdminChatApp = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    fetch("/api/admin/conversations")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        if (data.length > 0) {
          setActiveConversation(data[0]); // auto select first conversation
        }
      });
  }, []);

  // Auto set activeConversation kung hindi pa naka-set at may conversations
  useEffect(() => {
    if (!activeConversation && conversations.length > 0) {
      setActiveConversation(conversations[0]);
    }
  }, [conversations, activeConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !input.trim()) return;

    setLoading(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: activeConversation.id,
        content: input,
        senderType: "SYSTEM",
      }),
    });

    if (res.ok) {
      const newMessage = await res.json();
      setActiveConversation({
        ...activeConversation,
        messages: [...activeConversation.messages, newMessage],
      });
      setInput("");
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating Inbox Button */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="bg-primary p-7 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Inbox className="size-7 text-white" />
        </Button>
      </motion.div>

      {/* Modal Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
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
                  <CardTitle>Inquiries</CardTitle>
                  <CardDescription>
                    Manage customer concerns and inquiries
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                  >
                    {isFullscreen ? (
                      <Minimize className="size-5" />
                    ) : (
                      <Maximize className="size-5" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 overflow-hidden !p-0 -mt-6">
                {/* Sidebar */}
                <div className="w-1/3 border-r">
                  <ScrollArea className="h-full">
                    {conversations.map((conv) => {
                      const lastMessage =
                        conv.messages[conv.messages.length - 1];
                      const lastMessageTime = lastMessage?.createdAt
                        ? formatDistanceToNow(new Date(lastMessage.createdAt), {
                            addSuffix: true,
                          })
                        : null;

                      return (
                        <div
                          key={conv.id}
                          className={`px-5 py-3 cursor-pointer hover:bg-accent ${
                            activeConversation?.id === conv.id
                              ? "bg-accent"
                              : ""
                          }`}
                          onClick={() => setActiveConversation(conv)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium">
                              {conv.user?.email || conv.userId || "Guest"}
                            </div>
                          </div>
                          <div className="text-xs w-60 text-muted-foreground truncate">
                            {lastMessage?.content || "No messages"}
                          </div>
                          {lastMessageTime && (
                            <span className="text-[10px] text-muted-foreground">
                              {lastMessageTime}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </ScrollArea>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                  {activeConversation ? (
                    <>
                      <ScrollArea
                        className={`${isFullscreen ? "h-full" : "h-[500px]"} p-3`}
                      >
                        {activeConversation.messages.length === 0 && (
                          <div className="w-full mt-32 text-gray-500 items-center justify-center flex gap-3">
                            No message yet.
                          </div>
                        )}

                        {activeConversation.messages.map((msg) => {
                          const formattedDate = new Date(
                            msg.createdAt
                          ).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <div
                              key={msg.id}
                              className={`mb-4 ${msg.senderType === "SYSTEM" ? "text-right" : "text-left"}`}
                            >
                              <div
                                className={`inline-block rounded-lg px-3 py-2 ${
                                  msg.senderType === "SYSTEM"
                                    ? "bg-primary text-white"
                                    : "bg-muted text-black"
                                }`}
                              >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content}
                                </ReactMarkdown>

                                <div
                                  className={`text-[10px] ${msg.senderType === "SYSTEM" ? "text-gray-200" : "text-gray-400"} mt-1`}
                                >
                                  {formattedDate}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {loading && (
                          <div className="flex items-center justify-center">
                            <Loader2 className="animate-spin size-5" />
                          </div>
                        )}
                        <div ref={scrollRef} />
                      </ScrollArea>

                      <CardFooter>
                        <form
                          onSubmit={sendMessage}
                          className="flex w-full items-center space-x-2"
                        >
                          <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1"
                            placeholder="Type a reply..."
                          />
                          {loading ? (
                            <Button type="button">
                              <Square className="size-4" />
                            </Button>
                          ) : (
                            <Button type="submit">
                              <Send className="size-4" />
                            </Button>
                          )}
                        </form>
                      </CardFooter>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      Select a conversation to start
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminChatApp;
