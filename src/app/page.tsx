"use client";
import { useEffect, useState } from "react";
import Navigation from "@/components/nav";

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  // <-- added states
  const [documentsCount, setDocumentsCount] = useState<number>(0);
  const [totalChunks, setTotalChunks] = useState<number>(0);
  const [lastIndexed, setLastIndexed] = useState<string | null>(null);

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

  // Fetch documents summary for the cards
  const fetchDocumentsSummary = async () => {
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data?.documents && Array.isArray(data.documents)) {
        const docs = data.documents;
        setDocumentsCount(docs.length);
        const chunks = docs.reduce(
          (acc: number, d: any) => acc + (Number(d.total_chunks) || 0),
          0
        );
        setTotalChunks(chunks);
        const latest = docs.reduce((max: string | null, d: any) => {
          if (!d.upload_date) return max;
          if (!max) return d.upload_date;
          return new Date(d.upload_date) > new Date(max) ? d.upload_date : max;
        }, null);
        setLastIndexed(latest);
      } else {
        setDocumentsCount(0);
        setTotalChunks(0);
        setLastIndexed(null);
      }
    } catch (err) {
      setDocumentsCount(0);
      setTotalChunks(0);
      setLastIndexed(null);
    }
  };

  useEffect(() => {
    fetchDocumentsSummary();
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0E1A]">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm mb-2 text-[#2DD4BF] font-medium">
          SEMANTIC SEARCH
        </p>
        <p className="text-white md:text-[26px] text-[20px] mb-2">
          Ask your documents anything
        </p>
        <p className="text-[13px] text-gray-600 mb-6">
          Powered by vector embeddings & RAG retrieval
        </p>

        {/* cards */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-6 mb-6">
          <div className="flex-1 h-24 bg-[#13131F]  rounded-lg border border-gray-800 md:p-6  pt-6 px-3 shadow-sm ">
            <div className="block">
              <p className="md:text-base text-xs text-gray-400 ">DOCUMENTS</p>
              <p className="md:text-base text-xs text-base text-[#A78BFA] ">
                {documentsCount}
              </p>
            </div>
          </div>
          <div className="flex-1 h-24 bg-[#13131F]  rounded-lg border border-gray-800 md:p-6  pt-6 px-3 shadow-sm ">
            <div className="block">
              <p className="md:text-base text-xs text-gray-400">TOTAL CHUNKS</p>
              <p className="md:text-base text-xs text-base  text-[#2DD4BF]  ">
                {totalChunks}
              </p>
            </div>
          </div>
          <div className="flex-1 h-24 bg-[#13131F] rounded-lg border border-gray-800 md:p-6  pt-6 px-3 shadow-sm ">
            <div className="block">
              <p className="md:text-base text-xs text-gray-400 ">
                LAST INDEXED
              </p>
              <p className="md:text-base text-xs text-base text-gray-600">
                {lastIndexed
                  ? new Date(lastIndexed).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No documents uploaded"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#13131F] border border-1 border-violet-800 rounded-lg p-6 shadow-sm mb-6">
          <textarea
            className="w-full bg-[#30302E] p-4 border border-1 border-gray-600 rounded-lg shadow-sm  text-[#64748B]  resize-none focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent"
            placeholder="Ask a question about your uploaded documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={4}
          />
          <div className="mt-4 flex justify-between ">
            <p className="mt-4 text-sm text-[#64748B]">
              Press Cmd/Ctrl + Enter to search
            </p>

            <button
              onClick={handleSearch}
              className="mt-4 bg-[#13131F]  border border-gray-700 text-white px-8 py-3 rounded-lg hover:bg-blue-[#7C3AED] font-medium"
              disabled={loading || !query.trim()}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {answer && (
          <div className="bg-transparent  border border-gray-800 rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-xl font-medium mb-3 text-gray-600">ANSWER:</h2>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {answer}
            </p>
          </div>
        )}

        {sources && sources.length > 0 && (
          <div className="bg-[#] border border-gray-800  rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-semibold mb-3 text-gray-600">
              SOURCES ({sources.length}):
            </h2>
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#13131F] rounded-lg border border-1 border-violet-800"
                >
                  <div className="flex flex-row items-center gap-2">
                    <div className="bg-gradient-to-br from-violet-500 to-teal-400 w-2 h-2 rounded-full" />{" "}
                    <p className="text-sm text-[#2DD4BF] font-medium mb-1">
                      {source.metadata?.source ||
                        source.metadata?.file_name ||
                        "Unknown"}
                    </p>
                  </div>
                  <p className="text-sm  text-gray-500 line-clamp-3">
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
