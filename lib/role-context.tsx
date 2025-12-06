"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Hard-coded admin key - in production, this should be in environment variables
const ADMIN_KEY = "mpl-admin-2024";

export type UserRole = "admin" | "viewer" | null;

interface RoleContextType {
	role: UserRole;
	isRoleLoading: boolean;
	isRoleSelected: boolean;
	verifyAdminKey: (key: string) => boolean;
	setAsViewer: () => void;
	setAsAdmin: (key: string) => boolean;
	resetRole: () => void;
	isAdmin: boolean;
	isViewer: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
	// Default to viewer role - no selection needed
	const [role, setRole] = useState<UserRole>("viewer");
	const [isRoleLoading, setIsRoleLoading] = useState(true);

	// Set loading to false on mount - default is already viewer
	useEffect(() => {
		// Clear any previously stored role
		if (typeof window !== "undefined") {
			localStorage.removeItem("mpl-user-role");
		}
		// Small delay to prevent flash
		const timer = setTimeout(() => {
			setIsRoleLoading(false);
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	// Verify admin key
	const verifyAdminKey = (key: string): boolean => {
		return key === ADMIN_KEY;
	};

	// Set role as viewer (session only - no localStorage)
	const setAsViewer = () => {
		setRole("viewer");
	};

	// Set role as admin (requires key verification, session only)
	const setAsAdmin = (key: string): boolean => {
		if (verifyAdminKey(key)) {
			setRole("admin");
			return true;
		}
		return false;
	};

	// Reset role (go back to selection screen)
	const resetRole = () => {
		setRole(null);
	};

	return (
		<RoleContext.Provider
			value={{
				role,
				isRoleLoading,
				isRoleSelected: role !== null,
				verifyAdminKey,
				setAsViewer,
				setAsAdmin,
				resetRole,
				isAdmin: role === "admin",
				isViewer: role === "viewer",
			}}
		>
			{children}
		</RoleContext.Provider>
	);
}

export function useRole() {
	const context = useContext(RoleContext);
	if (!context) {
		throw new Error("useRole must be used within a RoleProvider");
	}
	return context;
}

// Export the admin key validation for API routes
export function validateAdminKey(key: string | null): boolean {
	return key === ADMIN_KEY;
}
