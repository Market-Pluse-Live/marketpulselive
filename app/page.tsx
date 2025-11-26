"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tv, Play, Sparkles, Zap, ArrowRight, Radio, Shield, BarChart3 } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { AuthModal, SignupPrompt } from "@/components/auth/AuthModal";

export default function HomePage() {
	const { theme } = useTheme();
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const isDark = theme === "dark";
	
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
	const [showSignupPrompt, setShowSignupPrompt] = useState(false);
	const [hasSeenPrompt, setHasSeenPrompt] = useState(false);

	// Redirect authenticated users to dashboard
	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			router.push("/dashboard/dev-company");
		}
	}, [isAuthenticated, isLoading, router]);

	// 30-second popup timer (must be before early returns!)
	useEffect(() => {
		// Don't show if already authenticated or has seen prompt
		if (isAuthenticated || hasSeenPrompt) return;

		// Check if user has dismissed the prompt before
		const dismissed = sessionStorage.getItem("mpl-prompt-dismissed");
		if (dismissed) {
			setHasSeenPrompt(true);
			return;
		}

		const timer = setTimeout(() => {
			setShowSignupPrompt(true);
			setHasSeenPrompt(true);
		}, 30000); // 30 seconds

		return () => clearTimeout(timer);
	}, [isAuthenticated, hasSeenPrompt]);

	const handleGetStarted = () => {
		setAuthMode("signup");
		setShowAuthModal(true);
	};

	const handleSignupPromptClose = () => {
		setShowSignupPrompt(false);
		sessionStorage.setItem("mpl-prompt-dismissed", "true");
	};

	const handleAuthSuccess = () => {
		router.push("/dashboard/dev-company");
	};

	// Show loading while checking auth
	if (isLoading) {
		return (
			<div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
				<div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	// Don't render home page for authenticated users (they'll be redirected)
	if (isAuthenticated) {
		return (
			<div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
				<div className="text-center">
					<div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
					<p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Redirecting to dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={`min-h-screen overflow-hidden transition-colors duration-300 ${
			isDark 
				? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
				: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
		}`}>
			{/* Auth Modal */}
			<AuthModal 
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				onSuccess={handleAuthSuccess}
				initialMode={authMode}
			/>

			{/* 30-second Signup Prompt */}
			<SignupPrompt
				isOpen={showSignupPrompt}
				onClose={handleSignupPromptClose}
				onSignUp={() => {
					setShowSignupPrompt(false);
					setAuthMode("signup");
					setShowAuthModal(true);
				}}
				onLogin={() => {
					setShowSignupPrompt(false);
					setAuthMode("login");
					setShowAuthModal(true);
				}}
			/>

			{/* Background Effects */}
			<div className="fixed inset-0 pointer-events-none">
				<div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-purple-500/10" : "bg-purple-500/5"}`} />
				<div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-pink-500/10" : "bg-pink-500/5"}`} />
			</div>

			{/* Header */}
			<motion.header 
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className={`relative border-b backdrop-blur-xl transition-colors duration-300 ${
					isDark 
						? "border-gray-800/50 bg-gray-900/30" 
						: "border-gray-200/50 bg-white/70"
				}`}
			>
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
					<Link href="/">
						<motion.div 
							className="flex items-center gap-3"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
								<Tv className="h-5 w-5 text-white" />
							</div>
							<span className={`text-lg font-bold flex items-center gap-1.5 ${isDark ? "text-white" : "text-gray-900"}`}>
								Market Pulse{" "}
								<span 
									style={{ 
										background: "linear-gradient(to right, #a78bfa, #ec4899)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										backgroundClip: "text"
									}}
								>
									Live
								</span>
							</span>
						</motion.div>
					</Link>
					
					<div className="flex items-center gap-3">
						<Link href="/discover">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
									isDark 
										? "text-gray-400 hover:text-white hover:bg-gray-800/50" 
										: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
								}`}
							>
								Browse Streams
							</motion.button>
						</Link>
						
						<motion.button
							whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)" }}
							whileTap={{ scale: 0.95 }}
							onClick={handleGetStarted}
							className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 transition-all duration-200"
						>
							Get Started
						</motion.button>
					</div>
				</div>
			</motion.header>

			<div className="relative">
				{/* Hero Section */}
				<div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-center max-w-3xl mx-auto"
					>
						{/* Badge */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 }}
							className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${
								isDark 
									? "bg-purple-500/10 border border-purple-500/20 text-purple-300" 
									: "bg-purple-100 border border-purple-200 text-purple-700"
							}`}
						>
							<Sparkles className="h-4 w-4" />
							Powered by Whop
						</motion.div>
						
						{/* Title */}
						<motion.h1 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className={`text-5xl md:text-7xl font-bold leading-tight mb-6 ${isDark ? "text-white" : "text-gray-900"}`}
						>
							Professional
							<br />
							<span 
							style={{ 
								background: "linear-gradient(to right, #a78bfa, #ec4899, #fb923c)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text"
							}}
						>
								Livestreaming
							</span>
							<br />
							Platform
						</motion.h1>
						
						{/* Subtitle */}
						<motion.p 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className={`text-lg md:text-xl max-w-xl mx-auto mb-10 ${isDark ? "text-gray-400" : "text-gray-600"}`}
						>
							Manage multiple streaming rooms, control access, and deliver premium content to your community.
						</motion.p>

						{/* CTA Buttons */}
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="flex flex-col sm:flex-row gap-4 justify-center items-center"
						>
							<motion.button
								onClick={handleGetStarted}
								whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(139, 92, 246, 0.4)" }}
								whileTap={{ scale: 0.95 }}
								className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-size-200 bg-pos-0 hover:bg-pos-100 shadow-xl shadow-purple-500/30 transition-all duration-500"
							>
								Get Started
								<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
							</motion.button>
							<Link href="/discover">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-semibold border transition-all duration-200 ${
										isDark 
											? "text-gray-300 bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-700/50" 
											: "text-gray-700 bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
									}`}
								>
									<Play className="h-5 w-5" />
									Browse Streams
								</motion.button>
							</Link>
						</motion.div>
					</motion.div>
				</div>

				{/* Features Grid */}
				<div className="max-w-6xl mx-auto px-6 py-16">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="grid md:grid-cols-3 gap-6"
					>
						{[
							{
								icon: Radio,
								title: "8 Stream Rooms",
								description: "Manage multiple concurrent streams with individual controls and settings.",
								color: "purple",
							},
							{
								icon: Zap,
								title: "YouTube & HLS",
								description: "Support for YouTube embeds and HLS streams with seamless playback.",
								color: "pink",
							},
							{
								icon: Shield,
								title: "Access Control",
								description: "Whop-powered membership gating for exclusive content delivery.",
								color: "orange",
							},
						].map((feature, index) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.7 + index * 0.1 }}
								whileHover={{ y: -8, transition: { duration: 0.2 } }}
								className={`group p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
									isDark 
										? "bg-gray-900/50 border-gray-800 hover:border-gray-700" 
										: "bg-white/80 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
								}`}
							>
								<div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
									feature.color === "purple" 
										? "bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 group-hover:shadow-lg group-hover:shadow-purple-500/20" 
										: feature.color === "pink"
											? "bg-pink-500/20 text-pink-400 group-hover:bg-pink-500/30 group-hover:shadow-lg group-hover:shadow-pink-500/20"
											: "bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/30 group-hover:shadow-lg group-hover:shadow-orange-500/20"
								}`}>
									<feature.icon className="h-6 w-6" />
								</div>
								<h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{feature.title}</h3>
								<p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>{feature.description}</p>
							</motion.div>
						))}
					</motion.div>
				</div>

				{/* Stats Section */}
				<div className="max-w-6xl mx-auto px-6 py-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.9 }}
						className="grid grid-cols-2 md:grid-cols-4 gap-6"
					>
						{[
							{ label: "Active Streams", value: "8", suffix: "" },
							{ label: "Peak Viewers", value: "2.4", suffix: "K" },
							{ label: "Uptime", value: "99.9", suffix: "%" },
							{ label: "Latency", value: "<100", suffix: "ms" },
						].map((stat) => (
							<motion.div
								key={stat.label}
								whileHover={{ scale: 1.05 }}
								className={`text-center p-6 rounded-2xl border ${
									isDark 
										? "bg-gray-800/30 border-gray-800" 
										: "bg-white border-gray-200 shadow-sm"
								}`}
							>
								<p className={`text-3xl md:text-4xl font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
									{stat.value}<span className="text-purple-400">{stat.suffix}</span>
								</p>
								<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>{stat.label}</p>
							</motion.div>
						))}
					</motion.div>
				</div>

				{/* Bottom CTA */}
				<div className="max-w-6xl mx-auto px-6 py-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1 }}
						className={`relative overflow-hidden rounded-3xl border p-12 text-center ${
							isDark 
								? "bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 border-purple-500/20" 
								: "bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 border-purple-200"
						}`}
					>
						{/* Background glow */}
						<div className={`absolute inset-0 blur-3xl ${
							isDark 
								? "bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10" 
								: "bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5"
						}`} />
						
						<div className="relative">
							<h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
								Ready to start streaming?
							</h2>
							<p className={`mb-8 max-w-md mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}>
								Set up your streaming rooms in minutes and start delivering content to your audience.
							</p>
							<motion.button
								onClick={handleGetStarted}
								whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(139, 92, 246, 0.5)" }}
								whileTap={{ scale: 0.95 }}
								className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-xl shadow-purple-500/30 transition-all duration-300"
							>
								<BarChart3 className="h-5 w-5" />
								Get Started Free
							</motion.button>
						</div>
					</motion.div>
				</div>

				{/* Footer */}
				<footer className={`border-t py-8 transition-colors duration-300 ${
					isDark ? "border-gray-800/50" : "border-gray-200"
				}`}>
					<div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
						<div className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
							<Tv className="h-4 w-4" />
							<span>Market Pulse Live</span>
						</div>
						<p className={`text-sm ${isDark ? "text-gray-600" : "text-gray-400"}`}>
							Powered by Whop · Built with Next.js
						</p>
					</div>
				</footer>
			</div>
		</div>
	);
}
