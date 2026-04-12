import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Sparkles, Bot, User } from "lucide-react";
import { chatService } from "@/services/chatService";
import {
  CHAT_CLIENT_ACTION_SHOW_REPORTS_DOWNLOAD,
  type ChatMessage,
} from "@/types/chat";
import {
  dispatchChatRefreshTarget,
  isChatRefreshTarget,
  resolveRefreshTargetsFromFunctions,
} from "@/lib/chatbot-refresh";
import { useTranslation } from "@/hooks/useTranslation";

export function ChatBot() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "",
      translationKey: "chatbot.welcomeMessage",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initCalledRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      if (!initCalledRef.current) {
        initCalledRef.current = true;
        chatService.init().catch(() => {});
      }
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage.text);
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + "-ai",
        text: response.message,
        isUser: false,
        timestamp: new Date(response.createdAt),
        clientAction: response.clientAction ?? null,
      };

      setMessages((prev) => [...prev, aiMessage]);

      const targets = new Set(
        resolveRefreshTargetsFromFunctions(response.functionsCalled)
      );
      if (isChatRefreshTarget(response.refreshTarget)) {
        targets.add(response.refreshTarget);
      }

      if (targets.size > 0) {
        setTimeout(() => {
          for (const target of targets) {
            dispatchChatRefreshTarget(target);
          }
        }, 250);
      }
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "-error",
        text: t("chatbot.errorMessage"),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openReportsDownload = (action: ChatMessage["clientAction"]) => {
    if (!action || action.type !== CHAT_CLIENT_ACTION_SHOW_REPORTS_DOWNLOAD) return;
    const params = new URLSearchParams();
    if (action.startMonth) params.set("startMonth", action.startMonth);
    if (action.endMonth) params.set("endMonth", action.endMonth);
    const qs = params.toString();
    navigate(qs ? `/report?${qs}` : "/report");
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Interface */}
      <div
        className={`fixed z-50 right-4 left-4 bottom-56 sm:left-auto sm:right-6 sm:bottom-44 md:bottom-28 sm:w-[25rem] lg:w-[27rem] rounded-3xl border border-sky-200/70 dark:border-sky-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_24px_64px_-24px_rgba(2,132,199,0.45)] transition-all duration-400 origin-bottom-right ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "pointer-events-none opacity-0 translate-y-6 scale-95"
        }`}
      >
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-3xl bg-linear-to-r from-sky-500 via-cyan-500 to-teal-500 px-4 py-3.5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.38),transparent_42%)]"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-white/35 blur-md"></div>
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/20 backdrop-blur-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400"></div>
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-white sm:text-base">
                  {t("chatbot.title")}
                  <Sparkles className="h-4 w-4" />
                </h3>
                <p className="text-xs text-white/85">{t("chatbot.subtitle")}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="max-h-[55vh] min-h-80 space-y-4 overflow-y-auto bg-linear-to-b from-sky-50/60 to-white px-4 py-4 sm:max-h-[60vh]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom duration-500 ${
                message.isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  message.isUser
                    ? "bg-linear-to-br from-sky-500 to-cyan-500"
                    : "bg-linear-to-br from-teal-500 to-cyan-500"
                }`}
              >
                {message.isUser ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[80%] sm:max-w-[72%] ${
                  message.isUser ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm transition-all duration-300 sm:px-4 ${
                    message.isUser
                      ? "rounded-tr-sm bg-linear-to-br from-sky-500 to-cyan-500 text-white"
                      : "rounded-tl-sm border border-sky-100 dark:border-sky-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {message.translationKey ? t(message.translationKey as any) : message.text}
                  </p>
                  {!message.isUser &&
                    message.clientAction?.type === CHAT_CLIENT_ACTION_SHOW_REPORTS_DOWNLOAD && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto min-h-0 p-0 text-left text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                        onClick={() => openReportsDownload(message.clientAction)}
                      >
                        {t("chatbot.downloadExcel" as any)}
                      </Button>
                    )}
                </div>
                <p
                  className={`mt-1 px-1 text-[11px] text-slate-400 ${
                    message.isUser ? "text-right" : "text-left"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom duration-500">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-500">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-sky-100 dark:border-sky-800 bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="rounded-b-3xl border-t border-sky-100 dark:border-sky-800 bg-white dark:bg-slate-900 px-4 py-3.5">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t("chatbot.placeholder")}
              disabled={isLoading}
              className="h-10 flex-1 rounded-full border-sky-200 dark:border-sky-800 px-4 focus:border-sky-400 dark:focus:border-sky-600 focus:ring-sky-400 dark:focus:ring-sky-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="h-10 w-10 rounded-full bg-linear-to-r from-sky-500 to-cyan-500 p-0 text-white shadow-md transition-transform hover:scale-105 hover:from-sky-600 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? t("chatbot.closeChat") : t("chatbot.openChat")}
        className={`group fixed bottom-36 right-4 z-50 overflow-hidden rounded-full bg-linear-to-br from-sky-500 via-cyan-500 to-teal-500 transition-all duration-300 hover:scale-105 active:scale-95 md:bottom-24 sm:right-6 ${
          isOpen
            ? "h-9 w-9 shadow-md opacity-70 hover:opacity-100"
            : "h-14 w-14 sm:h-16 sm:w-16 shadow-[0_14px_34px_-8px_rgba(6,182,212,0.75)]"
        }`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-linear-to-br from-sky-400 via-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Ripple effect */}
        {!isOpen && <div className="absolute inset-0 rounded-full animate-ping bg-sky-200 opacity-25"></div>}
        
        {/* Icon */}
        <div className="relative flex items-center justify-center h-full transition-transform duration-300">
          {isOpen ? (
            <X className="h-4 w-4 text-white group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <MessageCircle className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300" />
          )}
        </div>
      </button>
    </>
  );
}
