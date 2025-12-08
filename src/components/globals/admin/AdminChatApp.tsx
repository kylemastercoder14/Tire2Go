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
          className="bg-primary p-5 sm:p-6 md:p-7 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <Inbox className="size-5 sm:size-6 md:size-7 text-white" />
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
                ? "inset-0 w-full h-full flex items-center justify-center p-2 sm:p-4"
                : "bottom-16 sm:bottom-20 right-2 sm:right-4 w-[calc(100%-1rem)] sm:w-[95%] md:w-[900px]"
            }`}
          >
            <Card className="flex flex-col w-full h-full border-2 shadow-xl">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b p-3 sm:p-6">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg">Inquiries</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Manage customer concerns and inquiries
                  </CardDescription>
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                  <Button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    size="icon"
                    variant="ghost"
                    className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
                  >
                    {isFullscreen ? (
                      <Minimize className="size-4 sm:size-5" />
                    ) : (
                      <Maximize className="size-4 sm:size-5" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    size="icon"
                    variant="ghost"
                    className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <X className="size-4 sm:size-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col md:flex-row flex-1 overflow-hidden !p-0 -mt-6">
                {/* Sidebar */}
                <div className="w-full md:w-1/3 border-r border-b md:border-b-0">
                  <ScrollArea className="h-[200px] sm:h-[300px] md:h-full">
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
                          className={`px-3 sm:px-4 md:px-5 py-2 sm:py-3 cursor-pointer hover:bg-accent ${
                            activeConversation?.id === conv.id
                              ? "bg-accent"
                              : ""
                          }`}
                          onClick={() => setActiveConversation(conv)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-medium text-sm sm:text-base truncate flex-1 min-w-0 pr-2">
                              {conv.user?.email || conv.userId || "Guest"}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground truncate w-full">
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
                <div className="flex-1 flex flex-col min-h-0">
                  {activeConversation ? (
                    <>
                      <ScrollArea
                        className={`${isFullscreen ? "h-full" : "h-[400px] sm:h-[500px]"} p-2 sm:p-3`}
                      >
                        {activeConversation.messages.length === 0 && (
                          <div className="w-full mt-16 sm:mt-32 text-gray-500 items-center justify-center flex gap-3 text-sm sm:text-base">
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
                              className={`mb-3 sm:mb-4 ${msg.senderType === "SYSTEM" ? "text-right" : "text-left"}`}
                            >
                              <div
                                className={`inline-block max-w-[85%] sm:max-w-[75%] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base ${
                                  msg.senderType === "SYSTEM"
                                    ? "bg-primary text-white"
                                    : "bg-muted text-black"
                                }`}
                              >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content}
                                </ReactMarkdown>

                                <div
                                  className={`text-[10px] sm:text-xs ${msg.senderType === "SYSTEM" ? "text-gray-200" : "text-gray-400"} mt-1`}
                                >
                                  {formattedDate}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {loading && (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="animate-spin size-4 sm:size-5" />
                          </div>
                        )}
                        <div ref={scrollRef} />
                      </ScrollArea>

                      <CardFooter className="p-2 sm:p-4 sm:p-6">
                        <form
                          onSubmit={sendMessage}
                          className="flex w-full items-center gap-2"
                        >
                          <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 text-sm sm:text-base"
                            placeholder="Type a reply..."
                          />
                          {loading ? (
                            <Button type="button" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                              <Square className="size-3 sm:size-4" />
                            </Button>
                          ) : (
                            <Button type="submit" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                              <Send className="size-3 sm:size-4" />
                            </Button>
                          )}
                        </form>
                      </CardFooter>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm sm:text-base p-4">
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
