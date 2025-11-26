import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

interface User {
	id: string;
	name: string;
	email: string;
	password: string; // hashed
	avatar?: string;
	createdAt: string;
}

interface UsersData {
	users: User[];
}

async function getUsers(): Promise<UsersData> {
	try {
		const data = await fs.readFile(USERS_FILE, "utf-8");
		return JSON.parse(data);
	} catch {
		return { users: [] };
	}
}

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

		// Get users
		const usersData = await getUsers();

		// Find user by email
		const user = usersData.users.find(
			(u) => u.email.toLowerCase() === email.toLowerCase()
		);

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		// Check password
		const hashedPassword = hashPassword(password);
		if (user.password !== hashedPassword) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 }
			);
		}

		// Generate token
		const token = generateToken();

		// Return user without password
		const { password: _, ...userWithoutPassword } = user;

		return NextResponse.json({
			user: userWithoutPassword,
			token,
			message: "Login successful",
		});
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Failed to login" },
			{ status: 500 }
		);
	}
}
