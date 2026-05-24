"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/nav";

export default function Dashboard() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [documentsCount, setDocumentsCount] = useState<number>(0);
  const [totalChunks, setTotalChunks] = useState<number>(0);
  const [lastIndexed, setLastIndexed] = useState<string | null>(null);

  // Fetch documents summary for the logged-in user
  const fetchDocumentsSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data?.documents && Array.isArray(data.documents)) {
        const docs = data.documents;
        setDocuments(docs);
        setDocumentsCount(docs.length);
        const chunks = docs.reduce(
          (acc: number, d: any) => acc + (Number(d.total_chunks) || 0),
          0,
        );
        setTotalChunks(chunks);
        const latest = docs.reduce((max: string | null, d: any) => {
          if (!d.upload_date) return max;
          if (!max) return d.upload_date;
          return new Date(d.upload_date) > new Date(max) ? d.upload_date : max;
        }, null);
        setLastIndexed(latest);
      } else {
        setDocuments([]);
        setDocumentsCount(0);
        setTotalChunks(0);
        setLastIndexed(null);
      }
    } catch (err) {
      setDocuments([]);
      setDocumentsCount(0);
      setTotalChunks(0);
      setLastIndexed(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle search with user-specific documents
  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
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
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchDocumentsSummary();
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0E1A]">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm mb-2 text-[#2DD4BF] font-medium">DASHBOARD</p>
        <p className="text-white md:text-[26px] text-[20px] mb-2">
          My Documents & Search
        </p>
        <p className="text-[13px] text-gray-600 mb-6">
          Search across your uploaded documents using AI
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="h-24 bg-[#13131F] rounded-lg border border-gray-800 md:p-6 pt-6 px-3 shadow-sm">
            <div className="block">
              <p className="md:text-base text-xs text-gray-400">DOCUMENTS</p>
              <p className="md:text-2xl text-lg text-[#A78BFA] font-semibold">
                {documentsCount}
              </p>
            </div>
          </div>
          <div className="h-24 bg-[#13131F] rounded-lg border border-gray-800 md:p-6 pt-6 px-3 shadow-sm">
            <div className="block">
              <p className="md:text-base text-xs text-gray-400">TOTAL CHUNKS</p>
              <p className="md:text-2xl text-lg text-[#2DD4BF] font-semibold">
                {totalChunks}
              </p>
            </div>
          </div>
          <div className="h-24 bg-[#13131F] rounded-lg border border-gray-800 md:p-6 pt-6 px-3 shadow-sm">
            <div className="block">
              <p className="md:text-base text-xs text-gray-400">LAST INDEXED</p>
              <p className="md:text-base text-xs text-gray-500 font-semibold">
                {lastIndexed
                  ? new Date(lastIndexed).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "No documents"}
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-[#13131F] border border-1 border-violet-800 rounded-lg p-6 shadow-sm mb-6">
          <textarea
            className="w-full bg-[#30302E] p-4 border border-1 border-gray-600 rounded-lg shadow-sm text-[#64748B] resize-none focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-transparent"
            placeholder="Ask a question about your documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={4}
          />
          <div className="mt-4 flex justify-between">
            <p className="mt-4 text-sm text-[#64748B]">
              Press Cmd/Ctrl + Enter to search
            </p>
            <button
              onClick={handleSearch}
              className="mt-4 bg-[#13131F] border border-gray-700 text-white px-8 py-3 rounded-lg hover:bg-purple-900 font-medium disabled:opacity-50"
              disabled={searchLoading || !query.trim()}
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Answer Section */}
        {answer && (
          <div className="bg-transparent border border-gray-800 rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-xl font-medium mb-3 text-gray-600">ANSWER:</h2>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {answer}
            </p>
          </div>
        )}

        {/* Sources Section */}
        {sources && sources.length > 0 && (
          <div className="border border-gray-800 rounded-lg p-6 shadow-sm mb-6">
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
                    <div className="bg-gradient-to-br from-violet-500 to-teal-400 w-2 h-2 rounded-full" />
                    <p className="text-sm text-[#2DD4BF] font-medium mb-1">
                      {source.metadata?.source ||
                        source.metadata?.file_name ||
                        "Unknown"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {source.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents List */}
        {documentsCount > 0 && (
          <div className="border border-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-white">
              Your Documents
            </h2>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 bg-[#13131F] rounded-lg border border-gray-800 hover:border-violet-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white font-medium">{doc.file_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {doc.total_chunks} chunks • {doc.file_size} bytes
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Uploaded:{" "}
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && documentsCount === 0 && (
          <div className="border border-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">
              No documents uploaded yet. Upload documents in the Documents
              section to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
