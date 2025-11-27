import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function hashPassword(password: string): string {
	return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(): string {
	return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password } = body;

		// Validation
		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 }
			);
		}

		// Check if Supabase is configured
		if (!isSupabaseConfigured || !supabase) {
			// In dev mode without Supabase, allow any login
			const token = generateToken();
			return NextResponse.json({
				user: {
					id: `dev_${Date.now()}`,
					name: email.split("@")[0],
					email: email.toLowerCase().trim(),
					avatar: null,
					createdAt: new Date().toISOString(),
				},
				token,
				message: "Login successful (dev mode)",
			});
		}

		// Find user in Supabase
		const { data: user, error } = await supabase
			.from("users")
			.select("id, name, email, password_hash, avatar, created_at")
			.eq("email", email.toLowerCase().trim())
			.single();

		if (error || !user) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		// Verify password
		const hashedPassword = hashPassword(password);
		if (user.password_hash !== hashedPassword) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		// Generate token
		const token = generateToken();

		// Return user without password
		return NextResponse.json({
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar,
				createdAt: user.created_at,
			},
			token,
			message: "Login successful",
		});
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Login failed. Please try again." },
			{ status: 500 }
		);
	}
}
