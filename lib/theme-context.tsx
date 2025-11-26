"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("dark");

	useEffect(() => {
		try {
			const stored = localStorage.getItem("mpl-theme") as Theme | null;
			if (stored) {
				setThemeState(stored);
				applyTheme(stored);
			}
		} catch (e) {
			// localStorage might not be available in iframe
			console.warn("Could not access localStorage for theme");
		}
	}, []);

	const applyTheme = (newTheme: Theme) => {
		if (typeof document === "undefined") return;
		const root = document.documentElement;
		
		if (newTheme === "dark") {
			root.classList.add("dark");
			root.classList.remove("light");
			root.style.colorScheme = "dark";
		} else {
			root.classList.remove("dark");
			root.classList.add("light");
			root.style.colorScheme = "light";
		}
	};

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		try {
			localStorage.setItem("mpl-theme", newTheme);
		} catch (e) {
			// Ignore localStorage errors
		}
		applyTheme(newTheme);
	};

	const toggleTheme = () => {
		const newTheme = theme === "dark" ? "light" : "dark";
		setTheme(newTheme);
	};

	// ALWAYS render children - never return null!
	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		return {
			theme: "dark" as Theme,
			toggleTheme: () => {},
			setTheme: () => {},
		};
	}
	return context;
}
