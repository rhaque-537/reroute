"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Globe } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const DEMO_RESPONSES: Record<string, string> = {
  default:
    "I understand your concern. Based on your situation, I've found several alternatives that can get you there on time and save you money. Want me to walk you through the options?",
  cheapest:
    "Great choice! The Greyhound + short flight combo is $97 — that's $192 less than rebooking the same airline. It gets you to DFW by 9pm, plenty of time for your morning shift. Want me to lock it in?",
  rights:
    "Under DOT rules (14 CFR Part 259), when an airline cancels your flight, they MUST rebook you on the next available flight at no extra cost. You're also entitled to a full refund if you choose not to travel. Since your delay exceeds 3 hours on a domestic flight, you may also be eligible for meal vouchers.",
  spanish:
    "Entiendo tu preocupación. He encontrado varias alternativas que pueden llevarte allí a tiempo y ahorrarte dinero. ¿Quieres que te explique las opciones?",
};

const PROACTIVE_MESSAGE =
  "Hey — I detected your flight AA 1247 was just canceled. I've already found you 4 alternatives. Want me to walk you through them, or should I just book the cheapest option?";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [lang, setLang] = useState<"en" | "es">("en");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const msgId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        { id: ++msgId.current, role: "assistant", content: PROACTIVE_MESSAGE },
      ]);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getDemoResponse = (text: string): string => {
    const lower = text.toLowerCase();
    if (lang === "es") return DEMO_RESPONSES.spanish;
    if (lower.includes("cheap") || lower.includes("book")) return DEMO_RESPONSES.cheapest;
    if (lower.includes("right") || lower.includes("owe") || lower.includes("compensation")) return DEMO_RESPONSES.rights;
    return DEMO_RESPONSES.default;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { id: ++msgId.current, role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language: lang,
          tripDetails: {
            origin: "JFK",
            destination: "DFW",
            flight: "AA 1247",
            date: "2026-04-02",
            status: "canceled",
          },
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const assistantMsg: Message = {
        id: ++msgId.current,
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMsg]);

      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                assistantMsg.content += content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: assistantMsg.content } : m
                  )
                );
              }
            } catch {
              // skip non-JSON lines
            }
          }
        }
      }
    } catch {
      const fallback = getDemoResponse(text);
      const assistantMsg: Message = {
        id: ++msgId.current,
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMsg]);

      for (let i = 0; i < fallback.length; i++) {
        await new Promise((r) => setTimeout(r, 15));
        const partial = fallback.slice(0, i + 1);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: partial } : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;
    const SpeechRecognitionCtor = W.SpeechRecognition || W.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang === "es" ? "es-ES" : "en-US";
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      sendMessage(transcript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between px-5 pt-6 pb-3">
        <h1 className="text-xl font-bold">ReRoute Chat</h1>
        <button
          onClick={() => setLang((l) => (l === "en" ? "es" : "en"))}
          className="flex items-center gap-1.5 bg-navy-light border border-navy-lighter rounded-lg px-3 py-2 text-sm min-h-[44px]"
        >
          <Globe size={16} />
          {lang === "en" ? "EN" : "ES"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-teal text-navy rounded-br-md"
                    : "bg-navy-light border border-navy-lighter text-gray-200 rounded-bl-md"
                }`}
              >
                {msg.content}
                {msg.role === "assistant" && msg.content === "" && (
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">·</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>·</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>·</span>
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="px-5 pb-5 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder={lang === "es" ? "Escribe un mensaje..." : "Type a message..."}
              className="w-full bg-navy-light border border-navy-lighter rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-teal transition-colors"
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="w-12 h-12 bg-teal rounded-xl flex items-center justify-center hover:bg-teal-dark transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px]"
          >
            <Send size={20} className="text-navy" />
          </button>
          <button
            onClick={toggleRecording}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all min-w-[44px] min-h-[44px] ${
              isRecording
                ? "bg-teal animate-pulse ring-4 ring-teal/30"
                : "bg-navy-light border border-navy-lighter hover:border-teal"
            }`}
          >
            <Mic size={20} className={isRecording ? "text-navy" : "text-gray-400"} />
          </button>
        </div>
      </div>
    </div>
  );
}
