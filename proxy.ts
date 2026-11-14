import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Shop Pulse is an owner-only internal tool: every route requires a session,
// except the login page itself. (Next.js 16 renamed Middleware → Proxy.)
export async function proxy(request: NextRequest) {
	const response = NextResponse.next({ request });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						response.cookies.set(name, value, options);
					}
				},
			},
		},
	);

	const {
		data: { session },
	} = await supabase.auth.getSession();
	const { pathname } = request.nextUrl;
	const isLoginPage = pathname === "/login";

	if (!isLoginPage && !session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (isLoginPage && session) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return response;
}

export const config = {
	// Run on everything except Next internals and static assets.
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
