// app/dashboard/page.tsx
import { createClient } from "@/utills/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  // RLS automatically filters — this query only returns the logged-in user's posts
  const { data: documents } = await supabase.from("documents").select("*");

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <pre>{JSON.stringify(documents, null, 2)}</pre>
    </div>
  );
}
