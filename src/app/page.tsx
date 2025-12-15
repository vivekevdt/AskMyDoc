import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          📄 askmydoc
        </h1>

        <p className="text-neutral-400 text-base sm:text-lg mb-8">
          Upload documents and chat with them using AI-powered search.
        </p>

        <ul className="space-y-2 text-neutral-300 mb-8 text-sm sm:text-base">
          <li>✅ Upload PDF / DOCX</li>
          <li>✅ Semantic search</li>
          <li>✅ Chat with references</li>
        </ul>

        <Link
          href="/upload"
          className="inline-block bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-lg font-medium"
        >
          Ask My Doc →
        </Link>
      </div>
    </main>
  );
}
