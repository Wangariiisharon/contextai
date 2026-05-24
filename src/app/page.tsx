import { redirect } from "next/navigation";
import { createClient } from "@/utills/supabase/server";
import Dashboard from "./dashboard/page";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // If not authenticated, send the user to the login page
    redirect("/login");
  }

  return <Dashboard />;
}
