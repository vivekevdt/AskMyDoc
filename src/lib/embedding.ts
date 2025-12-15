export async function createEmbedding(text: string) {
  const res = await fetch(`${process.env.GEMINI_API_BASE}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      model: "text-embedding-004",
      input: text
    })
  });

  const data = await res.json();
  return data.data[0].embedding;
}
