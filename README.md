# 📄 Ask-My-Doc — Simple RAG Application

Ask-My-Doc is a **Retrieval-Augmented Generation (RAG)** application built with **Next.js**, **Supabase**, **Pinecone**, and **LLMs (Gemini/OpenAI-compatible)**.  
It allows users to upload documents (PDF/DOCX) and chat with them intelligently using semantic search.

---

## 🚀 Features

- 📤 Upload **PDF / DOCX** documents (one at a time)
- 📦 Store files in **Supabase Storage**
- 🧠 Extract text, chunk content, and generate embeddings
- 📊 Store embeddings in **Pinecone Vector DB**
- 💬 Chat with uploaded documents using **RAG**
- 🔍 Retrieve relevant chunks with **document references**
- 🪵 LLM observability using **Langfuse**
- 🎨 Modern UI with **Next.js App Router + shadcn/ui**

---

## 🧩 Tech Stack

| Layer | Technology |
|-----|-----------|
| Frontend | Next.js (App Router), TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| Backend | Next.js Route Handlers |
| Storage | Supabase (Storage + DB) |
| Vector DB | Pinecone |
| Embeddings | Gemini / OpenAI-compatible |
| Observability | Langfuse |

---

## 🏗️ How the Application Works

### 1️⃣ Document Upload
- User uploads a PDF or DOCX file
- File is stored in Supabase Storage
- File metadata is saved in Supabase database

### 2️⃣ Text Processing
- Text is extracted from the document
- Text is split into **small chunks**
- Each chunk is converted into a **vector embedding**

### 3️⃣ Vector Storage
- Embeddings are stored in Pinecone
- Metadata stored with each vector:
  - file_name
  - file_id
  - chunk_index
  - text

### 4️⃣ Chat (RAG Flow)
- User asks a question
- Question is embedded
- Relevant chunks are fetched from Pinecone
- LLM generates an answer using retrieved context
- Response includes **file references**

---

## 📁 Project Structure

```txt
src/
├─ app/
│  ├─ upload/            # Upload UI
│  ├─ api/
│  │  ├─ upload/         # File upload + processing
│  │  ├─ chat/           # Chat endpoint (RAG)
│  │  └─ tool/           # Tool calls (search, list files)
│
├─ components/
│  └─ ChatWidget.tsx
│
├─ lib/
│  ├─ supabase/
│  ├─ pinecone.ts
│  ├─ extractText.ts
│  ├─ chunker.ts
│  ├─ embedding.ts
│
└─ styles/

```

## 🔐 Environment Variables

Create a `.env.local` file in the project root and add the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Pinecone
PINECONE_API_KEY=
PINECONE_INDEX_NAME=
PINECONE_ENVIRONMENT=

# LLM / Embeddings
GEMINI_API_KEY=
GEMINI_API_BASE=
GEMINI_MODEL=gemini-1.5-flash

# Langfuse (Optional)
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

