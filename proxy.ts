import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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

	const { data: { session } } = await supabase.auth.getSession();
	const { pathname } = request.nextUrl;
	const isLoginPage = pathname === "/admin/login";
	const isAdminPage = pathname.startsWith("/admin");

	if (isAdminPage && !isLoginPage && !session) {
		return NextResponse.redirect(new URL("/admin/login", request.url));
	}

	if (isLoginPage && session) {
		return NextResponse.redirect(new URL("/admin/orders", request.url));
	}

	return response;
}

export const config = {
	matcher: ["/admin/:path*"],
};
