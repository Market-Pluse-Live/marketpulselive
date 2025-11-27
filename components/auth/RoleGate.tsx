"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, Key, ArrowRight, AlertCircle, Loader2, Lock } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { useTheme } from "@/lib/theme-context";

export function RoleGate({ children }: { children: React.ReactNode }) {
	const { role, isRoleLoading, setAsViewer, setAsAdmin } = useRole();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const [showAdminKeyInput, setShowAdminKeyInput] = useState(false);
	const [adminKey, setAdminKey] = useState("");
	const [error, setError] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	// Show loading while checking stored role
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

	// If role is already selected, show children
	if (role !== null) {
		return <>{children}</>;
	}

	// Handle admin key submission
	const handleAdminSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsVerifying(true);

		// Simulate slight delay for UX
		await new Promise(resolve => setTimeout(resolve, 500));

		const success = setAsAdmin(adminKey);
		if (!success) {
			setError("Invalid admin key. Please try again.");
			setAdminKey("");
		}
		setIsVerifying(false);
	};

	// Handle viewer selection
	const handleViewerSelect = () => {
		setAsViewer();
	};

	return (
		<div className={`min-h-screen flex items-center justify-center p-4 ${
			isDark 
				? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" 
				: "bg-gradient-to-br from-gray-50 via-white to-gray-100"
		}`}>
			{/* Background effects */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className={`absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-20 ${
					isDark ? "bg-purple-600" : "bg-purple-300"
				}`} />
				<div className={`absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-20 ${
					isDark ? "bg-blue-600" : "bg-blue-300"
				}`} />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className={`relative w-full max-w-md p-8 rounded-3xl border backdrop-blur-xl ${
					isDark 
						? "bg-gray-900/80 border-gray-800" 
						: "bg-white/90 border-gray-200"
				}`}
			>
				{/* Logo/Brand */}
				<div className="text-center mb-8">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", delay: 0.1 }}
						className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4"
					>
						<Lock className="h-8 w-8 text-white" />
					</motion.div>
					<h1 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
						Market Pulse Live
					</h1>
					<p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
						Select your access level to continue
					</p>
				</div>

				<AnimatePresence mode="wait">
					{!showAdminKeyInput ? (
						<motion.div
							key="role-select"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="space-y-4"
						>
							<h2 className={`text-center text-lg font-semibold mb-6 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
								Are you the admin?
							</h2>

							{/* Admin Option */}
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => setShowAdminKeyInput(true)}
								className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 group ${
									isDark 
										? "bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/20" 
										: "bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100"
								}`}
							>
								<div className="flex items-center gap-4">
									<div className={`p-3 rounded-xl ${
										isDark ? "bg-purple-500/20" : "bg-purple-100"
									}`}>
										<Shield className={`h-6 w-6 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
									</div>
									<div className="flex-1 text-left">
										<h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
											Yes, I'm the Admin
										</h3>
										<p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
											Full access to manage rooms and streams
										</p>
									</div>
									<ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
										isDark ? "text-purple-400" : "text-purple-600"
									}`} />
								</div>
							</motion.button>

							{/* Viewer Option */}
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleViewerSelect}
								className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 group ${
									isDark 
										? "bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800" 
										: "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
								}`}
							>
								<div className="flex items-center gap-4">
									<div className={`p-3 rounded-xl ${
										isDark ? "bg-gray-700" : "bg-gray-200"
									}`}>
										<Eye className={`h-6 w-6 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
									</div>
									<div className="flex-1 text-left">
										<h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
											No, I'm a Viewer
										</h3>
										<p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
											Watch live streams only
										</p>
									</div>
									<ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
										isDark ? "text-gray-400" : "text-gray-600"
									}`} />
								</div>
							</motion.button>
						</motion.div>
					) : (
						<motion.form
							key="admin-key"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							onSubmit={handleAdminSubmit}
							className="space-y-6"
						>
							<button
								type="button"
								onClick={() => {
									setShowAdminKeyInput(false);
									setError("");
									setAdminKey("");
								}}
								className={`flex items-center gap-2 text-sm transition-colors ${
									isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
								}`}
							>
								← Back
							</button>

							<div className="text-center">
								<div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${
									isDark ? "bg-purple-500/20" : "bg-purple-100"
								}`}>
									<Key className={`h-7 w-7 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
								</div>
								<h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
									Enter Admin Key
								</h2>
								<p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
									Please enter your admin access key
								</p>
							</div>

							<div className="space-y-4">
								<div className="relative">
									<input
										type="password"
										value={adminKey}
										onChange={(e) => {
											setAdminKey(e.target.value);
											setError("");
										}}
										placeholder="Enter admin key..."
										autoFocus
										className={`w-full px-4 py-3.5 rounded-xl border-2 text-center text-lg font-mono tracking-widest transition-colors ${
											isDark 
												? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500" 
												: "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-purple-500"
										} focus:outline-none ${error ? "border-red-500" : ""}`}
									/>
								</div>

								{error && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
									>
										<AlertCircle className="h-4 w-4 text-red-400" />
										<span className="text-sm text-red-400">{error}</span>
									</motion.div>
								)}

								<motion.button
									type="submit"
									disabled={!adminKey.trim() || isVerifying}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
										adminKey.trim() && !isVerifying
											? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25"
											: isDark 
												? "bg-gray-800 text-gray-500 cursor-not-allowed"
												: "bg-gray-200 text-gray-400 cursor-not-allowed"
									}`}
								>
									{isVerifying ? (
										<>
											<Loader2 className="h-5 w-5 animate-spin" />
											Verifying...
										</>
									) : (
										<>
											<Shield className="h-5 w-5" />
											Access Admin Dashboard
										</>
									)}
								</motion.button>
							</div>
						</motion.form>
					)}
				</AnimatePresence>
			</motion.div>
		</div>
	);
}

