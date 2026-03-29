"use client";

import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, Globe } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-6 pt-12"><div className="h-8 w-48 bg-white/5 rounded animate-pulse" /></div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();

  const tripDetails = useMemo(() => ({
    origin: searchParams.get("origin") || "JFK",
    destination: searchParams.get("destination") || "DFW",
    flight: searchParams.get("flight") || "AA 1247",
    date: searchParams.get("date") || "2026-04-02",
    status: searchParams.get("status") || "canceled",
  }), [searchParams]);

  const proactiveMessage = `Hey — I detected your flight ${tripDetails.flight} from ${tripDetails.origin} to ${tripDetails.destination} was just canceled. I've already searched Wanderu, Rome2Rio, and direct airlines and found you 4 alternatives. Want me to walk you through them, or should I just book the cheapest option?`;

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
      setMessages([{ id: ++msgId.current, role: "assistant", content: proactiveMessage }]);
    }, 600);
    return () => clearTimeout(timer);
  }, [proactiveMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: Message = { id: ++msgId.current, role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          language: lang,
          tripDetails,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const assistantMsg: Message = { id: ++msgId.current, role: "assistant", content: "" };
      setMessages(prev => [...prev, assistantMsg]);

      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                assistantMsg.content += content;
                setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: assistantMsg.content } : m));
              }
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      // The API route handles all fallback tiers server-side now,
      // so this catch only fires for network-level failures
      const fallback = `I'm having trouble connecting right now, but I can tell you that your flight ${tripDetails.flight} from ${tripDetails.origin} to ${tripDetails.destination} has been disrupted. Under DOT rules, you're entitled to a full refund or free rebooking. I found alternatives starting at $97 via Wanderu. Try sending your message again in a moment.`;
      const assistantMsg: Message = { id: ++msgId.current, role: "assistant", content: "" };
      setMessages(prev => [...prev, assistantMsg]);
      for (let i = 0; i < fallback.length; i++) {
        await new Promise(r => setTimeout(r, 12));
        const partial = fallback.slice(0, i + 1);
        setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content: partial } : m));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const W = window as any;
    const SpeechRecognitionCtor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang === "es" ? "es-ES" : "en-US";
    recognition.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => { setIsRecording(false); sendMessage(event.results[0][0].transcript); };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-8 pt-8 pb-4">
        <div>
          <h1 className="font-serif text-2xl">ReRoute <span className="font-serif-italic">Chat</span></h1>
        </div>
        <button
          onClick={() => setLang(l => (l === "en" ? "es" : "en"))}
          className="flex items-center gap-2 text-xs opacity-40 hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px] justify-center"
        >
          <Globe size={14} />
          {lang === "en" ? "EN" : "ES"}
        </button>
      </div>

      <div className="dashed-divider mx-6 md:mx-8" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                {msg.role === "assistant" && (
                  <p className="text-[10px] tracking-[0.25em] uppercase opacity-25 mb-2">ReRoute</p>
                )}
                <div className={`text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-white/[0.04] rounded-2xl rounded-br-sm px-5 py-3.5"
                    : "opacity-80"
                }`}>
                  {msg.content}
                  {msg.role === "assistant" && msg.content === "" && (
                    <span className="inline-flex gap-1 opacity-30">
                      <span className="animate-bounce">·</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>·</span>
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 md:px-8 pb-6 pt-2">
        <div className="dashed-divider mb-4" />
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage(input)}
            placeholder={lang === "es" ? "Escribe o toca el mic..." : "Type or tap mic..."}
            className="flex-1 bg-transparent text-sm placeholder-white/25 focus:outline-none py-3"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity disabled:opacity-10 min-w-[44px] min-h-[44px]"
          >
            <Send size={16} />
          </button>
          <button
            onClick={toggleRecording}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all min-w-[44px] min-h-[44px] ${
              isRecording
                ? "bg-teal/20 ring-2 ring-teal/40 animate-pulse"
                : "border border-white/15 hover:border-white/30"
            }`}
          >
            <Mic size={16} className={isRecording ? "text-teal" : "opacity-40"} />
          </button>
        </div>
      </div>
    </div>
  );
}
