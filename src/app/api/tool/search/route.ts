import { NextResponse } from "next/server";
import { index } from "@/lib/pinecone";
import { createEmbedding } from "@/lib/embedding";

export async function POST(req: Request) {
  const { query } = await req.json();

  const vector = await createEmbedding(query);

  const res = await index.query({
    vector,
    topK: 5,
    includeMetadata: true,
  });

  return NextResponse.json({
    ok: true,
    matches: res.matches?.map(m => ({
      text: m.metadata?.text,
      file_name: m.metadata?.file_name,
    })),
  });
}
