"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";

const navItems = [
	{ href: "/dashboard/dev-company", label: "Dashboard", icon: "📊" },
	{ href: "/discover", label: "Browse Streams", icon: "📺" },
	{ href: "/analytics", label: "Analytics", icon: "📈" },
];

interface UserProfile {
	name: string;
	email: string;
	avatar: string | null;
}

export function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const { theme, toggleTheme } = useTheme();
	const { logout, user } = useAuth();
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [notifications, setNotifications] = useState<Array<{
		id: number;
		message: string;
		time: string;
		read: boolean;
	}>>([]);

	// Use real user data from auth context
	const userProfile: UserProfile = {
		name: user?.name || "User",
		email: user?.email || "user@example.com",
		avatar: user?.avatar || null,
	};

	const unreadCount = notifications.filter((n) => !n.read).length;

	// Fetch real notifications (could be from API)
	useEffect(() => {
		// For now, generate notifications based on recent activity
		// In production, this would fetch from /api/notifications
		const fetchNotifications = async () => {
			try {
				// Mock: In real app, fetch from API
				// const res = await fetch('/api/notifications');
				// const data = await res.json();
				// setNotifications(data.notifications);
				
				// For now, show empty or minimal notifications
				setNotifications([]);
			} catch (error) {
				console.error("Failed to fetch notifications:", error);
			}
		};
		
		if (user) {
			fetchNotifications();
		}
	}, [user]);

	const handleAvatarClick = () => {
		setShowUserMenu((prev) => !prev);
		setShowNotifications(false);
	};

	const handleNotificationClick = () => {
		setShowNotifications((prev) => !prev);
		setShowUserMenu(false);
	};

	return (
		<motion.nav
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="sticky top-0 z-50 glass border-b transition-colors duration-300"
			style={{
				backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.9)',
				borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
			}}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link href="/dashboard/dev-company">
						<motion.div
							className="flex items-center gap-3 cursor-pointer"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<motion.div
								className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
								style={{
									background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
								}}
								whileHover={{
									boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
								}}
							>
								📡
							</motion.div>
							<div className="flex items-center">
								<span
									className="text-xl font-bold"
									style={{
										background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										backgroundClip: "text",
									}}
								>
									Market Pulse
								</span>
								<span
									className="text-xl font-bold ml-1"
									style={{
										background: "linear-gradient(135deg, #10b981, #06b6d4)",
										WebkitBackgroundClip: "text",
										WebkitTextFillColor: "transparent",
										backgroundClip: "text",
									}}
								>
									Live
								</span>
							</div>
						</motion.div>
					</Link>

					{/* Nav Links */}
					<div className="hidden md:flex items-center gap-1">
						{navItems.map((item, index) => {
							const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
							return (
								<motion.div
									key={item.href}
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<Link href={item.href}>
										<motion.div
											className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
												isActive
													? "bg-purple-500/20 text-purple-400"
													: theme === 'dark'
														? "text-gray-400 hover:text-white hover:bg-gray-800"
														: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
											}`}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<span>{item.icon}</span>
											<span>{item.label}</span>
											{isActive && (
												<motion.div
													layoutId="activeTab"
													className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
												/>
											)}
										</motion.div>
									</Link>
								</motion.div>
							);
						})}
					</div>

					{/* Right Side */}
					<div className="flex items-center gap-3">
						{/* Theme Toggle */}
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={toggleTheme}
							className={`p-2.5 rounded-lg transition-all duration-200 ${
								theme === 'dark'
									? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
									: "bg-gray-100 hover:bg-gray-200 text-gray-700"
							}`}
							title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
						>
							<motion.span
								key={theme}
								initial={{ rotate: -180, opacity: 0 }}
								animate={{ rotate: 0, opacity: 1 }}
								exit={{ rotate: 180, opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="block text-lg"
							>
								{theme === 'dark' ? '☀️' : '🌙'}
							</motion.span>
						</motion.button>

						{/* Notifications */}
						<div className="relative">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleNotificationClick}
								className={`relative p-2.5 rounded-lg transition-all duration-200 ${
									theme === 'dark'
										? "bg-gray-800 hover:bg-gray-700"
										: "bg-gray-100 hover:bg-gray-200"
								}`}
							>
								<span className="text-lg">🔔</span>
								{unreadCount > 0 && (
									<motion.span
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
									>
										{unreadCount}
									</motion.span>
								)}
							</motion.button>

							<AnimatePresence>
								{showNotifications && (
									<motion.div
										initial={{ opacity: 0, y: 10, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 10, scale: 0.95 }}
										transition={{ duration: 0.2 }}
										className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50 ${
											theme === 'dark'
												? "bg-gray-900 border-gray-700"
												: "bg-white border-gray-200"
										}`}
									>
										<div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
											<h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
										</div>
										<div className="max-h-64 overflow-y-auto">
											{notifications.map((notif) => (
												<div
													key={notif.id}
													className={`px-4 py-3 border-b last:border-b-0 transition-colors ${
														theme === 'dark'
															? `border-gray-800 ${notif.read ? "" : "bg-purple-500/10"}`
															: `border-gray-100 ${notif.read ? "" : "bg-purple-50"}`
													}`}
												>
													<p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{notif.message}</p>
													<p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{notif.time}</p>
												</div>
											))}
										</div>
										<div className={`px-4 py-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
											<button className="text-sm text-purple-400 hover:text-purple-300 font-medium">
												View all notifications
											</button>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* User Avatar */}
						<div className="relative">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleAvatarClick}
								className="flex items-center gap-2"
							>
								{userProfile.avatar ? (
									<img
										src={userProfile.avatar}
										alt="Profile"
										className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/50"
									/>
								) : (
									<div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-purple-500/50">
										{userProfile.name.charAt(0).toUpperCase()}
									</div>
								)}
							</motion.button>

							<AnimatePresence>
								{showUserMenu && (
									<motion.div
										initial={{ opacity: 0, y: 10, scale: 0.95 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: 10, scale: 0.95 }}
										transition={{ duration: 0.2 }}
										className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border overflow-hidden z-50 ${
											theme === 'dark'
												? "bg-gray-900 border-gray-700"
												: "bg-white border-gray-200"
										}`}
									>
										<div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
											<p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userProfile.name}</p>
											<p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{userProfile.email}</p>
										</div>
										<div className="py-1">
											<Link href="/profile">
												<button
													className={`w-full px-4 py-2 text-left text-sm transition-colors ${
														theme === 'dark'
															? "text-gray-300 hover:bg-gray-800"
															: "text-gray-700 hover:bg-gray-100"
													}`}
													onClick={() => setShowUserMenu(false)}
												>
													👤 Profile
												</button>
											</Link>
											<Link href="/settings">
												<button
													className={`w-full px-4 py-2 text-left text-sm transition-colors ${
														theme === 'dark'
															? "text-gray-300 hover:bg-gray-800"
															: "text-gray-700 hover:bg-gray-100"
													}`}
													onClick={() => setShowUserMenu(false)}
												>
													⚙️ Settings
												</button>
											</Link>
											<button
												className={`w-full px-4 py-2 text-left text-sm transition-colors ${
													theme === 'dark'
														? "text-red-400 hover:bg-gray-800"
														: "text-red-600 hover:bg-gray-100"
												}`}
												onClick={() => {
													setShowUserMenu(false);
													logout();
													router.push("/");
												}}
											>
												🚪 Sign Out
											</button>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</motion.nav>
	);
}
