"use client";

import { useRole } from "@/lib/role-context";
import { useTheme } from "@/lib/theme-context";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function RoleGate({ children }: { children: React.ReactNode }) {
	const { isRoleLoading } = useRole();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	// Show loading while initializing
	if (isRoleLoading) {
		return (
			<div className={`min-h-screen flex items-center justify-center ${
				isDark 
					? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" 
					: "bg-gradient-to-br from-gray-50 via-white to-gray-100"
			}`}>
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex flex-col items-center gap-4"
				>
					<Loader2 className={`h-8 w-8 animate-spin ${isDark ? "text-purple-400" : "text-purple-600"}`} />
					<p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading...</p>
				</motion.div>
			</div>
		);
	}

	// Default to viewer - no role selection modal needed
	// Admin access is via the navbar badge (click 5 times)
	return <>{children}</>;
}

