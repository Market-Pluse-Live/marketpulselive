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

const ROLE_STORAGE_KEY = "mpl-user-role";

export function RoleProvider({ children }: { children: ReactNode }) {
	const [role, setRole] = useState<UserRole>(null);
	const [isRoleLoading, setIsRoleLoading] = useState(true);

	// Load role from localStorage on mount
	useEffect(() => {
		try {
			if (typeof window !== "undefined") {
				const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole;
				if (storedRole === "admin" || storedRole === "viewer") {
					setRole(storedRole);
				}
			}
		} catch (error) {
			console.warn("Role check failed:", error);
		} finally {
			setIsRoleLoading(false);
		}
	}, []);

	// Verify admin key
	const verifyAdminKey = (key: string): boolean => {
		return key === ADMIN_KEY;
	};

	// Set role as viewer
	const setAsViewer = () => {
		setRole("viewer");
		if (typeof window !== "undefined") {
			localStorage.setItem(ROLE_STORAGE_KEY, "viewer");
		}
	};

	// Set role as admin (requires key verification)
	const setAsAdmin = (key: string): boolean => {
		if (verifyAdminKey(key)) {
			setRole("admin");
			if (typeof window !== "undefined") {
				localStorage.setItem(ROLE_STORAGE_KEY, "admin");
			}
			return true;
		}
		return false;
	};

	// Reset role (logout from role)
	const resetRole = () => {
		setRole(null);
		if (typeof window !== "undefined") {
			localStorage.removeItem(ROLE_STORAGE_KEY);
		}
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

