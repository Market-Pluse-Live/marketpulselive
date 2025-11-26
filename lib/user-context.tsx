"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./auth-context";

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	avatar: string | null;
	role: "admin" | "moderator" | "viewer";
	createdAt: string;
	stats: {
		streamsManaged: number;
		hoursStreamed: number;
		totalViews: number;
	};
}

export interface UserSettings {
	general: {
		timezone: string;
		language: string;
	};
	appearance: {
		theme: "dark" | "light" | "system";
		accentColor: string;
	};
	notifications: {
		emailAlerts: boolean;
		pushNotifications: boolean;
		streamStartAlerts: boolean;
		weeklyReport: boolean;
	};
	streaming: {
		defaultStreamType: "youtube" | "hls";
		autoStart: boolean;
		defaultQuality: "auto" | "1080p" | "720p" | "480p";
	};
}

interface UserContextType {
	profile: UserProfile;
	settings: UserSettings;
	updateProfile: (updates: Partial<UserProfile>) => void;
	updateSettings: (updates: Partial<UserSettings>) => void;
	uploadAvatar: (file: File) => Promise<string>;
}

const defaultProfile: UserProfile = {
	id: "user_1",
	name: "Admin User",
	email: "admin@example.com",
	avatar: null,
	role: "admin",
	createdAt: "2024-01-15T00:00:00Z",
	stats: {
		streamsManaged: 8,
		hoursStreamed: 156,
		totalViews: 12400,
	},
};

const defaultSettings: UserSettings = {
	general: {
		timezone: "America/New_York",
		language: "en",
	},
	appearance: {
		theme: "dark",
		accentColor: "#8b5cf6",
	},
	notifications: {
		emailAlerts: true,
		pushNotifications: true,
		streamStartAlerts: true,
		weeklyReport: false,
	},
	streaming: {
		defaultStreamType: "youtube",
		autoStart: false,
		defaultQuality: "auto",
	},
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
	const { user, isAuthenticated } = useAuth();
	const [profile, setProfile] = useState<UserProfile>(defaultProfile);
	const [settings, setSettings] = useState<UserSettings>(defaultSettings);

	// Sync with authenticated user data
	useEffect(() => {
		if (isAuthenticated && user) {
			// Update profile with real user data from auth
			setProfile((prev) => ({
				...prev,
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar || prev.avatar,
				createdAt: user.createdAt,
			}));
		}
	}, [isAuthenticated, user]);

	// Load additional profile data and settings from localStorage on mount
	useEffect(() => {
		try {
			if (typeof window === "undefined") return;
			
			const savedProfile = localStorage.getItem("mpl-profile");
			const savedSettings = localStorage.getItem("mpl-settings");
			
			if (savedProfile) {
				try {
					const parsed = JSON.parse(savedProfile);
					setProfile((prev) => ({
						...prev,
						avatar: parsed.avatar || prev.avatar,
						role: parsed.role || prev.role,
						stats: parsed.stats || prev.stats,
					}));
				} catch {}
			}
			if (savedSettings) {
				try {
					setSettings(JSON.parse(savedSettings));
				} catch {}
			}
		} catch (e) {
			console.warn("Could not access localStorage for user settings");
		}
	}, []);

	const updateProfile = (updates: Partial<UserProfile>) => {
		setProfile((prev) => {
			const updated = { ...prev, ...updates };
			localStorage.setItem("mpl-profile", JSON.stringify(updated));
			return updated;
		});
	};

	const updateSettings = (updates: Partial<UserSettings>) => {
		setSettings((prev) => {
			const updated = { ...prev, ...updates };
			localStorage.setItem("mpl-settings", JSON.stringify(updated));
			return updated;
		});
	};

	const uploadAvatar = async (file: File): Promise<string> => {
		// In production, this would upload to a server
		// For now, convert to base64 data URL
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const dataUrl = reader.result as string;
				updateProfile({ avatar: dataUrl });
				resolve(dataUrl);
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	return (
		<UserContext.Provider value={{ profile, settings, updateProfile, updateSettings, uploadAvatar }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}

