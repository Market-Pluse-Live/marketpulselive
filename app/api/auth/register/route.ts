import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password, name } = body;

		if (!email || !password || !name) {
			return NextResponse.json(
				{ error: "Email, password, and name are required" },
				{ status: 400 }
			);
		}

		const result = await registerUser(email, password, name);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 400 });
		}

		// Create response with token in cookie
		const response = NextResponse.json(
			{ user: result.user, message: "Registration successful" },
			{ status: 201 }
		);

		// Set HTTP-only cookie for the token
		response.cookies.set("auth-token", result.token!, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 60 * 60 * 24 * 7, // 7 days
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Registration error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

