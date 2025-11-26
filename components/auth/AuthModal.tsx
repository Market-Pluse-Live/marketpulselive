"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	initialMode?: "login" | "signup";
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = "signup" }: AuthModalProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const { login, signup } = useAuth();
	
	const [mode, setMode] = useState<"login" | "signup">(initialMode);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			let result;
			if (mode === "signup") {
				if (!name.trim()) {
					setError("Please enter your name");
					setIsLoading(false);
					return;
				}
				result = await signup(name, email, password);
			} else {
				result = await login(email, password);
			}

			if (result.success) {
				onSuccess?.();
				onClose();
				// Reset form
				setName("");
				setEmail("");
				setPassword("");
			} else {
				setError(result.error || "Something went wrong");
			}
		} catch (err) {
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const switchMode = () => {
		setMode(mode === "login" ? "signup" : "login");
		setError("");
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
				onClick={onClose}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.95, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 20 }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
					onClick={(e) => e.stopPropagation()}
					className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden ${
						isDark 
							? "bg-gray-900 border-gray-800" 
							: "bg-white border-gray-200"
					}`}
				>
					{/* Header */}
					<div className="relative px-8 pt-8 pb-6 text-center">
						{/* Logo */}
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: 0.1 }}
							className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-purple-500/30"
						>
							<Sparkles className="h-8 w-8 text-white" />
						</motion.div>
						
						<motion.h2
							initial={{ y: 10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.15 }}
							className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
						>
							{mode === "signup" ? "Create your account" : "Welcome back"}
						</motion.h2>
						<motion.p
							initial={{ y: 10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.2 }}
							className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
						>
							{mode === "signup" 
								? "Start streaming with Market Pulse Live" 
								: "Sign in to access your dashboard"
							}
						</motion.p>

						{/* Close button */}
						<motion.button
							whileHover={{ scale: 1.1, rotate: 90 }}
							whileTap={{ scale: 0.9 }}
							onClick={onClose}
							className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
								isDark 
									? "hover:bg-gray-800 text-gray-400 hover:text-white" 
									: "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
							}`}
						>
							<X className="h-5 w-5" />
						</motion.button>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="px-8 pb-8">
						<div className="space-y-4">
							{/* Name (signup only) */}
							<AnimatePresence mode="wait">
								{mode === "signup" && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.2 }}
									>
										<label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>
											Full Name
										</label>
										<div className="relative">
											<User className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
											<input
												type="text"
												value={name}
												onChange={(e) => setName(e.target.value)}
												placeholder="John Doe"
												className={`w-full h-12 rounded-xl border pl-11 pr-4 text-sm focus:outline-none focus:ring-2 transition-all ${
													isDark 
														? "border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
														: "border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
												}`}
											/>
										</div>
									</motion.div>
								)}
							</AnimatePresence>

							{/* Email */}
							<div>
								<label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>
									Email Address
								</label>
								<div className="relative">
									<Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										required
										className={`w-full h-12 rounded-xl border pl-11 pr-4 text-sm focus:outline-none focus:ring-2 transition-all ${
											isDark 
												? "border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
												: "border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
										}`}
									/>
								</div>
							</div>

							{/* Password */}
							<div>
								<label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${isDark ? "text-gray-400" : "text-gray-500"}`}>
									Password
								</label>
								<div className="relative">
									<Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="••••••••"
										required
										minLength={6}
										className={`w-full h-12 rounded-xl border pl-11 pr-12 text-sm focus:outline-none focus:ring-2 transition-all ${
											isDark 
												? "border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500/20"
												: "border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
										}`}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								{mode === "signup" && (
									<p className={`text-xs mt-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
										Must be at least 6 characters
									</p>
								)}
							</div>

							{/* Error Message */}
							<AnimatePresence>
								{error && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
									>
										{error}
									</motion.div>
								)}
							</AnimatePresence>

							{/* Submit Button */}
							<motion.button
								type="submit"
								disabled={isLoading}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
							>
								{isLoading ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										{mode === "signup" ? "Creating account..." : "Signing in..."}
									</>
								) : (
									<>
										{mode === "signup" ? "Create Account" : "Sign In"}
										<ArrowRight className="h-4 w-4" />
									</>
								)}
							</motion.button>
						</div>

						{/* Switch Mode */}
						<div className={`mt-6 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
							{mode === "signup" ? (
								<>
									Already have an account?{" "}
									<button
										type="button"
										onClick={switchMode}
										className="text-purple-400 hover:text-purple-300 font-semibold"
									>
										Sign in
									</button>
								</>
							) : (
								<>
									Don't have an account?{" "}
									<button
										type="button"
										onClick={switchMode}
										className="text-purple-400 hover:text-purple-300 font-semibold"
									>
										Sign up
									</button>
								</>
							)}
						</div>

						{/* Terms */}
						{mode === "signup" && (
							<p className={`mt-4 text-xs text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
								By signing up, you agree to our{" "}
								<a href="#" className="text-purple-400 hover:underline">Terms of Service</a>
								{" "}and{" "}
								<a href="#" className="text-purple-400 hover:underline">Privacy Policy</a>
							</p>
						)}
					</form>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

// 30-second popup component
interface SignupPromptProps {
	isOpen: boolean;
	onClose: () => void;
	onSignUp: () => void;
	onLogin: () => void;
}

export function SignupPrompt({ isOpen, onClose, onSignUp, onLogin }: SignupPromptProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
				onClick={onClose}
			>
				<motion.div
					initial={{ opacity: 0, scale: 0.9, y: 30 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.9, y: 30 }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
					onClick={(e) => e.stopPropagation()}
					className={`w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden text-center ${
						isDark 
							? "bg-gray-900 border-gray-800" 
							: "bg-white border-gray-200"
					}`}
				>
					{/* Gradient top */}
					<div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400" />
					
					<div className="p-8">
						{/* Icon */}
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", delay: 0.1 }}
							className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"
						>
							<Sparkles className="h-10 w-10 text-purple-400" />
						</motion.div>

						<motion.h3
							initial={{ y: 10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.15 }}
							className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
						>
							Join Market Pulse Live
						</motion.h3>
						<motion.p
							initial={{ y: 10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.2 }}
							className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
						>
							Create an account to manage your streams, access analytics, and more!
						</motion.p>

						{/* Buttons */}
						<div className="space-y-3">
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={onSignUp}
								className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
							>
								Sign Up Free
								<ArrowRight className="h-4 w-4" />
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={onLogin}
								className={`w-full h-12 rounded-xl border font-semibold transition-all ${
									isDark 
										? "border-gray-700 text-gray-300 hover:bg-gray-800"
										: "border-gray-300 text-gray-700 hover:bg-gray-50"
								}`}
							>
								I already have an account
							</motion.button>
						</div>

						{/* Skip */}
						<button
							onClick={onClose}
							className={`mt-4 text-xs ${isDark ? "text-gray-500 hover:text-gray-400" : "text-gray-400 hover:text-gray-500"}`}
						>
							Maybe later
						</button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
