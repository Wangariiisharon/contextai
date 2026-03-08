"use client";
import { useState } from "react";
import Navigation from "@/components/nav";

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");
    setSources([]);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) {
        setAnswer(`Error: ${data.error}`);
      } else {
        setAnswer(data.answer || "No answer generated");
        setSources(data.sources || []);
      }
    } catch (error: any) {
      setAnswer(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <Navigation />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#F8FAFC]">RAG Search</h1>

        <div className="bg-[#] border border-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <textarea
            className="w-full bg-[#1E293B] p-4 border border-[#4F46E5] rounded-lg shadow-sm  text-[#64748B]  resize-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent"
            placeholder="Ask a question about your uploaded documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={4}
          />
          <button
            onClick={handleSearch}
            className="mt-4 bg-[#4F46E5] text-white px-8 py-3 rounded-lg hover:bg-blue-[#7C3AED] font-medium"
            disabled={loading || !query.trim()}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <p className="mt-4 text-sm text-[#64748B]">
            Press Cmd/Ctrl + Enter to search
          </p>
        </div>

        {answer && (
          <div className=" bg-[#]  border border-gray-800 rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-3 text-[#F8FAFC]">
              Answer:
            </h2>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {answer}
            </p>
          </div>
        )}

        {sources && sources.length > 0 && (
          <div className="bg-[#] border border-gray-800  rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-[#F8FAFC]">
              Sources ({sources.length}):
            </h2>
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#1E293B] rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">Source:</span>{" "}
                    {source.metadata?.source ||
                      source.metadata?.file_name ||
                      "Unknown"}
                  </p>
                  <p className="text-sm dark:text-gray-200 line-clamp-3">
                    {source.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
