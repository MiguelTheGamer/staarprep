/**
 * middleware.ts
 * 1. Refreshes the Supabase auth session on every request.
 * 2. Guards /dashboard for signed-in users only.
 * 3. If ALLOWED_EMAILS is set, signs out and redirects any user whose email
 *    is not on the allowlist. This is the private-deploy gate.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const isAllowed = (email: string | null | undefined): boolean => {
  const raw = process.env.ALLOWED_EMAILS;
  if (!raw || !raw.trim()) return true;
  if (!email) return false;
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Unauthenticated traffic to /dashboard goes to /login.
  if (!user && path.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Allowlist enforcement: signed-in but not approved.
  if (user && !isAllowed(user.email)) {
    if (path.startsWith("/dashboard") || path.startsWith("/api")) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "not_authorized");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
