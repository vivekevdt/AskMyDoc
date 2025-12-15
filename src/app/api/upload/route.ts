import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { extractText } from "@/lib/extractText";

import { index } from "@/lib/pinecone";
import { createEmbedding } from "@/lib/embedding";
import { createChunks } from "@/lib/chunker";

export async function POST(req: Request) {
  try {
    // ----------------------------------------------------
    // 1️⃣ Read Form Data
    // ----------------------------------------------------
    console.log("📥 Step 1: Reading form data...");
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      console.error("❌ No file received");
      return NextResponse.json({ ok: false, step: "read-file", error: "No file uploaded" }, { status: 400 });
    }

    console.log(`📄 File received: ${file.name}, type=${file.type}, size=${file.size}`);


    // ----------------------------------------------------
    // 2️⃣ Supabase Upload
    // ----------------------------------------------------
    console.log("⬆️ Step 2: Uploading file to Supabase...");
    const supabase = supabaseServer();

    const filePath = `docs/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("❌ Supabase upload failed:", uploadError);
      return NextResponse.json({ ok: false, step: "supabase-upload", error: uploadError.message });
    }

    console.log("✅ File uploaded to Supabase:", filePath);


    // ----------------------------------------------------
    // 3️⃣ Save Metadata
    // ----------------------------------------------------
    console.log("🗂 Step 3: Saving metadata to database...");

    const { data: metadata, error: metaError } = await supabase
      .from("files_metadata")
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: filePath,
      })
      .select()
      .single();

    if (metaError) {
      console.error("❌ Metadata insert failed:", metaError);
      return NextResponse.json({ ok: false, step: "metadata-save", error: metaError.message });
    }

    console.log("✅ Metadata saved:", metadata);


    // ----------------------------------------------------
    // 4️⃣ Extract Text
    // ----------------------------------------------------
    console.log("📚 Step 4: Extracting text from document...");

    let text: string;
    try {
      text = await extractText(file);
      console.log("✅ Text extracted successfully");
    } catch (ex: any) {
      console.error("❌ Text extraction failed:", ex);
      return NextResponse.json({ ok: false, step: "text-extraction", error: ex.message });
    }


    // ----------------------------------------------------
    // 5️⃣ Chunking
    // ----------------------------------------------------
    console.log("✂️ Step 5: Chunking text...");
    const chunks = createChunks(text);

    console.log(`✅ Total Chunks Created: ${chunks.length}`);


    // ----------------------------------------------------
    // 6️⃣ Embedding + Pinecone Upsert
    // ----------------------------------------------------
    console.log("🧠 Step 6: Creating embeddings & uploading to Pinecone...");

    const vectors: any[] = [];

    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await createEmbedding(chunks[i]);

        vectors.push({
          id: `${metadata.id}_chunk_${i}`,
          values: embedding,
          metadata: {
            text: chunks[i],
            file_id: metadata.id,
            file_name: metadata.file_name,
            chunk_index: i
          }
        });
      } catch (embedError: any) {
        console.error(`❌ Embedding failed for chunk ${i}:`, embedError);
        return NextResponse.json({
          ok: false,
          step: "embedding",
          chunk: i,
          error: embedError.message
        });
      }
    }

    console.log("📌 Uploading vectors to Pinecone...");
    try {
      await index.upsert(vectors);
      console.log("✅ Pinecone upsert completed");
    } catch (pcErr: any) {
      console.error("❌ Pinecone upsert failed:", pcErr);
      return NextResponse.json({ ok: false, step: "pinecone-upsert", error: pcErr.message });
    }


    // ----------------------------------------------------
    // 7️⃣ Success
    // ----------------------------------------------------
    console.log("🎉 Upload pipeline complete!");
    return NextResponse.json({ ok: true, fileId: metadata.id });

  } catch (err: any) {
    console.error("🔥 Fatal Error:", err);
    return NextResponse.json({
      ok: false,
      step: "fatal",
      error: err.message || "Unknown error"
    }, { status: 500 });
  }
}
