import { type NextRequest } from "next/server";
import { updateSession } from "@/utills/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on all routes except static files and _next internals
    // runs on every request and silently refreshes expired tokens using the refresh token in the cookie
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
