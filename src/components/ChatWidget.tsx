"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type FileItem = { id: string; file_name: string };

type Message =
  | { role: "user" | "assistant"; content: string }
  | { role: "assistant"; type: "files"; files: FileItem[] };

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "👋 Ask about your uploaded documents." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          messages: [...messages, userMsg],
        }),
      });

      const data = await res.json();

      if (data.type === "files") {
        setMessages((p) => [
          ...p,
          { role: "assistant", type: "files", files: data.files },
        ]);
      } else {
        setMessages((p) => [
          ...p,
          { role: "assistant", content: data.reply },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-neutral-950 text-white">
      {/* Header */}
      <div className="border-b border-neutral-800 p-4 font-semibold shrink-0">
        📄 askmydoc Chat
      </div>

      {/* Messages (SCROLLABLE) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map((m, i) =>
          "type" in m ? (
            <div
              key={i}
              className="bg-neutral-800 border border-neutral-700 p-3 rounded-lg"
            >
              <p className="text-sm font-semibold mb-2">📂 Documents</p>
              <ul className="space-y-1">
                {m.files.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-2 text-sm text-neutral-300"
                  >
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="truncate">{f.file_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-100"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.content}
              </ReactMarkdown>
            </div>
          )
        )}

        {loading && (
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking…
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-800 p-3 flex gap-2 shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something…"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="bg-neutral-800 text-white"
        />
        <Button onClick={sendMessage} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
