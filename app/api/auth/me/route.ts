import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("auth-token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Not authenticated" },
				{ status: 401 }
			);
		}

		const user = getUserFromToken(token);

		if (!user) {
			// Clear invalid token
			const response = NextResponse.json(
				{ error: "Invalid or expired token" },
				{ status: 401 }
			);
			response.cookies.set("auth-token", "", {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 0,
				path: "/",
			});
			return response;
		}

		return NextResponse.json({ user }, { status: 200 });
	} catch (error) {
		console.error("Auth check error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

