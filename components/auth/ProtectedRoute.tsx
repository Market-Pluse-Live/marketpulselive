"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { AuthModal } from "./AuthModal";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const { theme } = useTheme();
	const router = useRouter();
	const isDark = theme === "dark";
	const [showAuthModal, setShowAuthModal] = useState(false);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			setShowAuthModal(true);
		}
	}, [isLoading, isAuthenticated]);

	const handleAuthSuccess = () => {
		setShowAuthModal(false);
	};

	const handleClose = () => {
		router.push("/");
	};

	// Show loading state while checking auth
	if (isLoading) {
		return (
			<div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
				isDark 
					? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
					: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
			}`}>
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="flex flex-col items-center gap-4"
				>
					<Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
					<p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
						Checking authentication...
					</p>
				</motion.div>
			</div>
		);
	}

	// Show auth modal if not authenticated
	if (!isAuthenticated) {
		return (
			<div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
				isDark 
					? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
					: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
			}`}>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className={`text-center p-8 rounded-2xl border max-w-md mx-4 ${
						isDark 
							? "bg-gray-900/50 border-gray-800" 
							: "bg-white border-gray-200"
					}`}
				>
					<div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
						isDark ? "bg-purple-500/20" : "bg-purple-100"
					}`}>
						<Lock className="h-8 w-8 text-purple-500" />
					</div>
					<h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
						Authentication Required
					</h2>
					<p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
						Please sign in to access the dashboard
					</p>
					<motion.button
						onClick={() => setShowAuthModal(true)}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25"
					>
						Sign In
					</motion.button>
				</motion.div>

				<AuthModal
					isOpen={showAuthModal}
					onClose={handleClose}
					initialMode="login"
					onSuccess={handleAuthSuccess}
				/>
			</div>
		);
	}

	// User is authenticated, render children
	return <>{children}</>;
}

