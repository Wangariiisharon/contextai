import { createClient as createServerClient } from "@/utills/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

// Native Gemini SDK — supports outputDimensionality natively
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embeddingModel = genAI.getGenerativeModel({
  model: "gemini-embedding-001",
});

// ✅ systemInstruction must be a Content object, not a plain string
const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: {
    role: "system",
    parts: [
      {
        text: "You are a helpful assistant. Use the provided context to answer questions. If the answer is not in the context, say you do not know.",
      },
    ],
  },
});

export async function POST(req: Request) {
  try {
    // Get authenticated user from session cookies
    const serverSupabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await serverSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated" },
        { status: 401 },
      );
    }

    const { query } = await req.json();

    // Generate 768-dimensional embedding for the user's query
    // RETRIEVAL_QUERY task type is optimized for search queries
    const embResult = await embeddingModel.embedContent({
      content: { parts: [{ text: query }], role: "user" },
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: 768, // ✅ must match vector(768) in DB & upload route
    } as any);

    const embeddingVector = embResult.embedding.values;

    // Find similar documents using vector similarity search
    // match_documents filters by auth.uid() automatically via SECURITY INVOKER
    const { data: results, error } = await serverSupabase.rpc(
      "match_documents",
      {
        query_embedding: JSON.stringify(embeddingVector),
        match_threshold: 0.0, // Accept any similarity (increase for stricter matching)
        match_count: 5, // Return top 5 most similar chunks
      },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Combine retrieved chunks into context
    const context = results?.map((r: any) => r.content).join("\n---\n") || "";

    // Generate answer using Gemini chat with retrieved context
    const chat = chatModel.startChat();

    const chatResponse = await chat.sendMessage(
      `Context: ${context}\n\nQuestion: ${query}`,
    );

    return NextResponse.json({
      answer: chatResponse.response.text(),
      sources: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
