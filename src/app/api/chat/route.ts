import { NextResponse } from "next/server";
import { langfuse } from "@/lib/langfuse";
import { getSystemPrompt } from "@/lib/prompts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_BASE = process.env.GEMINI_API_BASE!;
const MODEL = "gemini-2.5-flash";

/* ============================
   SAFE LLM CALL
============================ */
async function callLLM(messages: any[], span?: any) {
  const res = await fetch(`${GEMINI_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GEMINI_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });

  if (res.status === 429) {
    span?.event({ name: "llm-error", output: "RESOURCE_EXHAUSTED" });
    throw new Error("RESOURCE_EXHAUSTED");
  }

  if (!res.ok) {
    const text = await res.text();
    span?.event({ name: "llm-http-error", output: text });
    throw new Error("LLM_REQUEST_FAILED");
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    span?.event({ name: "llm-empty-response", output: data });
    throw new Error("EMPTY_LLM_RESPONSE");
  }

  span?.end({ output: content });
  return content;
}

/* ============================
   CHAT API
============================ */
export async function POST(req: Request) {
  const body = await req.json();
  const { message, messages } = body;

  const trace = langfuse.trace({
    name: "chat-request",
    input: body,
  });

  try {
    if (!message) {
      return NextResponse.json(
        { ok: false, reply: "Message is required." },
        { status: 400 }
      );
    }

    const lower = message.toLowerCase();

    const isFileList =
      lower.includes("files") || lower.includes("documents");

    const isDocQuery =
      lower.includes("pdf") ||
      lower.includes("document") ||
      lower.includes("from file") ||
      lower.includes("uploaded");

    trace.event({
      name: "tool-decision",
      input: { isFileList, isDocQuery },
    });

    /* ============================
       TOOL 1: LIST FILES
    ============================ */
    if (isFileList) {
      const span = trace.span({ name: "get-files-tool" });

      const res = await fetch(new URL("/api/tool/get-files", req.url));
      const data = await res.json();

      span.end({ output: data });

      const reply =
        data?.files?.length
          ? data.files.map((f: any) => `• ${f.file_name}`).join("\n")
          : "No documents uploaded yet.";

      return NextResponse.json({
        ok: true,
        reply: `📂 **Uploaded Documents**\n\n${reply}`,
      });
    }

    /* ============================
       TOOL 2: SEARCH DOCUMENTS
    ============================ */
    if (isDocQuery) {
      const searchSpan = trace.span({
        name: "pinecone-search",
        input: message,
      });

      const toolRes = await fetch(new URL("/api/tool/search", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: message }),
      });

      const data = await toolRes.json();
      searchSpan.end({ output: data });

      if (!data?.matches?.length) {
        trace.event({
          name: "no-matches",
          output: message,
        });

        return NextResponse.json({
          ok: true,
          reply:
            "⚠️ I couldn't find relevant information in the uploaded documents.",
        });
      }

      const context = data.matches
        .map((m: any) => `File: ${m.file_name}\n${m.text}`)
        .join("\n\n");

      const systemPrompt = await getSystemPrompt("rag-system-prompt");

      const llmMessages = [
        { role: "system", content: systemPrompt },
        { role: "system", content: `CONTEXT:\n${context}` },
        { role: "user", content: message },
      ];

      const llmSpan = trace.span({
        name: "llm-rag-call",
        input: llmMessages,
      });

      const reply = await callLLM(llmMessages, llmSpan);

      return NextResponse.json({ ok: true, reply });
    }

    /* ============================
       NORMAL CHAT
    ============================ */
    const llmSpan = trace.span({
      name: "llm-normal-chat",
      input: messages,
    });

    const reply = await callLLM(messages, llmSpan);

    return NextResponse.json({ ok: true, reply });

  } catch (err: any) {
    trace.event({
      name: "error",
      level: "ERROR",
      output: err.message,
    });

    if (err.message === "RESOURCE_EXHAUSTED") {
      return NextResponse.json(
        {
          ok: false,
          reply:
            "⚠️ Gemini free quota is exhausted. Please add a new API key.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        reply:
          "⚠️ Something went wrong while generating the response. Please try again.",
      },
      { status: 500 }
    );
  }
}
