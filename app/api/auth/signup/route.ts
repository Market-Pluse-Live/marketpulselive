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
		const { name, email, password } = body;

		// Validation
		if (!name || !email || !password) {
			return NextResponse.json(
				{ error: "Name, email, and password are required" },
				{ status: 400 }
			);
		}

		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters" },
				{ status: 400 }
			);
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Invalid email address" },
				{ status: 400 }
			);
		}

		// Check if Supabase is configured
		if (!isSupabaseConfigured || !supabase) {
			// In dev mode without Supabase, create a mock user
			const userId = `dev_${Date.now()}`;
			const token = generateToken();
			return NextResponse.json({
				user: {
					id: userId,
					name: name.trim(),
					email: email.toLowerCase().trim(),
					avatar: null,
					createdAt: new Date().toISOString(),
				},
				token,
				message: "Account created successfully (dev mode)",
			});
		}

		// Check if email already exists in Supabase
		const { data: existingUser, error: checkError } = await supabase
			.from("users")
			.select("id")
			.eq("email", email.toLowerCase())
			.single();

		if (existingUser) {
			return NextResponse.json(
				{ error: "An account with this email already exists. Please sign in instead." },
				{ status: 400 }
			);
		}

		// Only throw error if it's not a "no rows" error
		if (checkError && checkError.code !== "PGRST116") {
			console.error("Database check error:", checkError);
			return NextResponse.json(
				{ error: "Database error. Please try again." },
				{ status: 500 }
			);
		}

		// Create new user in Supabase
		const userId = `user_${crypto.randomBytes(8).toString("hex")}`;
		const { data: newUser, error: insertError } = await supabase
			.from("users")
			.insert({
				id: userId,
				name: name.trim(),
				email: email.toLowerCase().trim(),
				password_hash: hashPassword(password),
			})
			.select("id, name, email, avatar, created_at")
			.single();

		if (insertError) {
			console.error("Error creating user:", insertError);
			return NextResponse.json(
				{ error: "Unable to create account. Please try again." },
				{ status: 500 }
			);
		}

		// Generate token
		const token = generateToken();

		// Return user
		return NextResponse.json({
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
				avatar: newUser.avatar,
				createdAt: newUser.created_at,
			},
			token,
			message: "Account created successfully",
		});
	} catch (error) {
		console.error("Signup error:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json(
			{ error: `Failed to create account: ${errorMessage}` },
			{ status: 500 }
		);
	}
}
