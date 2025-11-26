import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface User {
	id: string;
	email: string;
	name: string;
	password: string; // hashed
	avatar?: string;
	createdAt: string;
}

export interface SafeUser {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	createdAt: string;
}

export interface AuthToken {
	userId: string;
	email: string;
	name: string;
}

// Ensure data directory and users file exist
function ensureUsersFile() {
	const dataDir = path.join(process.cwd(), "data");
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
	if (!fs.existsSync(USERS_FILE)) {
		fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
	}
}

// Read users from file
function readUsers(): User[] {
	ensureUsersFile();
	const data = fs.readFileSync(USERS_FILE, "utf-8");
	return JSON.parse(data).users;
}

// Write users to file
function writeUsers(users: User[]) {
	ensureUsersFile();
	fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

// Generate unique ID
function generateId(): string {
	return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: SafeUser): string {
	const payload: AuthToken = {
		userId: user.id,
		email: user.email,
		name: user.name,
	};
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): AuthToken | null {
	try {
		return jwt.verify(token, JWT_SECRET) as AuthToken;
	} catch {
		return null;
	}
}

// Get safe user (without password)
function toSafeUser(user: User): SafeUser {
	const { password, ...safeUser } = user;
	return safeUser;
}

// Register new user
export async function registerUser(
	email: string,
	password: string,
	name: string
): Promise<{ success: boolean; user?: SafeUser; token?: string; error?: string }> {
	const users = readUsers();

	// Check if email already exists
	if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
		return { success: false, error: "Email already registered" };
	}

	// Validate email
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return { success: false, error: "Invalid email format" };
	}

	// Validate password
	if (password.length < 6) {
		return { success: false, error: "Password must be at least 6 characters" };
	}

	// Validate name
	if (name.trim().length < 2) {
		return { success: false, error: "Name must be at least 2 characters" };
	}

	// Create new user
	const hashedPassword = await hashPassword(password);
	const newUser: User = {
		id: generateId(),
		email: email.toLowerCase(),
		name: name.trim(),
		password: hashedPassword,
		createdAt: new Date().toISOString(),
	};

	users.push(newUser);
	writeUsers(users);

	const safeUser = toSafeUser(newUser);
	const token = generateToken(safeUser);

	return { success: true, user: safeUser, token };
}

// Login user
export async function loginUser(
	email: string,
	password: string
): Promise<{ success: boolean; user?: SafeUser; token?: string; error?: string }> {
	const users = readUsers();

	// Find user by email
	const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
	if (!user) {
		return { success: false, error: "Invalid email or password" };
	}

	// Verify password
	const isValidPassword = await verifyPassword(password, user.password);
	if (!isValidPassword) {
		return { success: false, error: "Invalid email or password" };
	}

	const safeUser = toSafeUser(user);
	const token = generateToken(safeUser);

	return { success: true, user: safeUser, token };
}

// Get user by ID
export function getUserById(userId: string): SafeUser | null {
	const users = readUsers();
	const user = users.find((u) => u.id === userId);
	return user ? toSafeUser(user) : null;
}

// Get user from token
export function getUserFromToken(token: string): SafeUser | null {
	const decoded = verifyToken(token);
	if (!decoded) return null;
	return getUserById(decoded.userId);
}

