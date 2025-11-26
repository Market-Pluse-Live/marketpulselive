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
		// Create the file if it doesn't exist
		const initial: UsersData = { users: [] };
		await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
		await fs.writeFile(USERS_FILE, JSON.stringify(initial, null, 2));
		return initial;
	}
}

async function saveUsers(data: UsersData): Promise<void> {
	await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
	await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
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

		// Get existing users
		let usersData: UsersData;
		try {
			usersData = await getUsers();
		} catch (fileError) {
			console.error("Error reading users file:", fileError);
			// Initialize with empty users if file doesn't exist
			usersData = { users: [] };
		}

		// Check if email already exists
		const existingUser = usersData.users.find(
			(u) => u.email.toLowerCase() === email.toLowerCase()
		);
		if (existingUser) {
			return NextResponse.json(
				{ error: "An account with this email already exists. Please sign in instead." },
				{ status: 400 }
			);
		}

		// Create new user
		const newUser: User = {
			id: `user_${crypto.randomBytes(8).toString("hex")}`,
			name: name.trim(),
			email: email.toLowerCase().trim(),
			password: hashPassword(password),
			createdAt: new Date().toISOString(),
		};

		usersData.users.push(newUser);
		
		try {
			await saveUsers(usersData);
		} catch (saveError) {
			console.error("Error saving user:", saveError);
			return NextResponse.json(
				{ error: "Unable to save account. Please try again." },
				{ status: 500 }
			);
		}

		// Generate token
		const token = generateToken();

		// Return user without password
		const { password: _, ...userWithoutPassword } = newUser;

		return NextResponse.json({
			user: userWithoutPassword,
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

