"use client";

import UploadCard from "@/components/UploadCard";
import ChatWidget from "@/components/ChatWidget";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row">
      
      {/* Upload section */}
      <section className="flex-1 flex justify-center items-center px-4 py-10">
        <UploadCard />
      </section>

      {/* Chat section */}
      <aside className="w-full lg:w-[480px] border-t lg:border-t-0 lg:border-l border-neutral-800">
        <ChatWidget />
      </aside>

    </div>
  );
}
