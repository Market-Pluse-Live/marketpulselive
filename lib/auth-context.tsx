"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	createdAt: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Check for existing session on mount
		const checkAuth = async () => {
			try {
				if (typeof window !== "undefined") {
					const stored = localStorage.getItem("mpl-auth-user");
					if (stored) {
						const userData = JSON.parse(stored);
						setUser(userData);
					}
				}
			} catch (error) {
				// localStorage might not be available in iframe
				console.warn("Auth check failed:", error);
			} finally {
				setIsLoading(false);
			}
		};
		checkAuth();
	}, []);

	const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok && data.user) {
				setUser(data.user);
				localStorage.setItem("mpl-auth-user", JSON.stringify(data.user));
				localStorage.setItem("mpl-auth-token", data.token);
				return { success: true };
			} else {
				return { success: false, error: data.error || "Login failed" };
			}
		} catch (error) {
			console.error("Login error:", error);
			return { success: false, error: "Network error. Please try again." };
		}
	};

	const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
		try {
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});

			const data = await response.json();

			if (response.ok && data.user) {
				setUser(data.user);
				localStorage.setItem("mpl-auth-user", JSON.stringify(data.user));
				localStorage.setItem("mpl-auth-token", data.token);
				return { success: true };
			} else {
				return { success: false, error: data.error || "Signup failed" };
			}
		} catch (error) {
			console.error("Signup error:", error);
			return { success: false, error: "Network error. Please try again." };
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("mpl-auth-user");
		localStorage.removeItem("mpl-auth-token");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				isAuthenticated: !!user,
				login,
				signup,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
