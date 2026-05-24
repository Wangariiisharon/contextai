"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utills/supabase/server";

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const result = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (result.error) redirect("/error");

  // If a session/user is returned (no email confirmation required), go to dashboard
  const user =
    (result.data as any)?.user || (result.data as any)?.session?.user;
  if (user) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // Otherwise the user needs to confirm their email
  redirect("/check-email");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) redirect("/error");

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline", // gets a refresh token from Google
        prompt: "consent",
      },
    },
  });

  if (error) redirect("/error");
  if (data.url) redirect(data.url); // redirect to Google's consent screen

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUpWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline", // gets a refresh token from Google
        prompt: "consent",
      },
    },
  });

  if (error) redirect("/error");
  if (data.url) redirect(data.url); // redirect to Google's consent screen
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
