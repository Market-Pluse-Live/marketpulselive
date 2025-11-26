"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
	Settings, ArrowLeft, Tv, User, Palette, Bell, Video, Shield, Trash2,
	Globe, Sun, Moon, Monitor, Check, Download, AlertTriangle
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { useNotification } from "@/lib/notification-context";
import { useTheme } from "@/lib/theme-context";
import { NotificationContainer } from "@/components/dashboard/NotificationToast";

type SettingsTab = "general" | "appearance" | "notifications" | "streaming" | "security" | "danger";

const tabs = [
	{ id: "general", label: "General", icon: Settings },
	{ id: "appearance", label: "Appearance", icon: Palette },
	{ id: "notifications", label: "Notifications", icon: Bell },
	{ id: "streaming", label: "Streaming", icon: Video },
	{ id: "security", label: "Security", icon: Shield },
	{ id: "danger", label: "Danger Zone", icon: AlertTriangle },
] as const;

const timezones = [
	"America/New_York",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"Europe/London",
	"Europe/Paris",
	"Asia/Tokyo",
	"Asia/Shanghai",
	"Australia/Sydney",
];

const languages = [
	{ code: "en", name: "English" },
	{ code: "es", name: "Spanish" },
	{ code: "fr", name: "French" },
	{ code: "de", name: "German" },
	{ code: "ja", name: "Japanese" },
];

const accentColors = [
	{ name: "Purple", value: "#8b5cf6" },
	{ name: "Pink", value: "#ec4899" },
	{ name: "Blue", value: "#3b82f6" },
	{ name: "Emerald", value: "#10b981" },
	{ name: "Orange", value: "#f97316" },
	{ name: "Red", value: "#ef4444" },
];

export default function SettingsPage() {
	const { settings, updateSettings } = useUser();
	const { success, info } = useNotification();
	const { theme, setTheme } = useTheme();
	const isDark = theme === "dark";
	const [activeTab, setActiveTab] = useState<SettingsTab>("general");

	const handleToggle = (category: keyof typeof settings, key: string, value: boolean) => {
		updateSettings({
			[category]: {
				...settings[category as keyof typeof settings],
				[key]: value,
			},
		} as any);
		success("Settings saved", "Your preferences have been updated");
	};

	const handleSelect = (category: keyof typeof settings, key: string, value: string) => {
		updateSettings({
			[category]: {
				...settings[category as keyof typeof settings],
				[key]: value,
			},
		} as any);
		success("Settings saved", "Your preferences have been updated");
	};

	const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
		if (newTheme === "system") {
			const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			setTheme(prefersDark ? "dark" : "light");
		} else {
			setTheme(newTheme);
		}
		handleSelect("appearance", "theme", newTheme);
	};

	return (
		<div className={`min-h-screen transition-colors duration-300 ${
			isDark 
				? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
				: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
		}`}>
			<NotificationContainer />
			
			{/* Header */}
			<header className={`border-b backdrop-blur-xl sticky top-0 z-10 transition-colors duration-300 ${
				isDark 
					? "border-gray-800/50 bg-gray-900/30" 
					: "border-gray-200 bg-white/70"
			}`}>
				<div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Link href="/dashboard/dev-company">
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className={`p-2 rounded-xl transition-colors ${
									isDark 
										? "hover:bg-gray-800 text-gray-400 hover:text-white" 
										: "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
								}`}
							>
								<ArrowLeft className="h-5 w-5" />
							</motion.button>
						</Link>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
								<Tv className="h-5 w-5 text-white" />
							</div>
							<span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Settings</span>
						</div>
					</div>
					<Link href="/profile">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
								isDark 
									? "text-gray-400 hover:text-white hover:bg-gray-800" 
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
							}`}
						>
							<User className="h-4 w-4" />
							Profile
						</motion.button>
					</Link>
				</div>
			</header>

			<div className="max-w-5xl mx-auto px-6 py-8">
				<div className="flex flex-col md:flex-row gap-6">
					{/* Sidebar */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="md:w-56 flex-shrink-0"
					>
						<nav className="space-y-1">
							{tabs.map((tab) => (
								<motion.button
									key={tab.id}
									whileHover={{ x: 4 }}
									onClick={() => setActiveTab(tab.id as SettingsTab)}
									className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
										activeTab === tab.id
											? isDark 
												? "bg-purple-500/20 text-purple-300"
												: "bg-purple-100 text-purple-700"
											: tab.id === "danger"
												? isDark 
													? "text-red-400 hover:bg-red-500/10"
													: "text-red-600 hover:bg-red-50"
												: isDark 
													? "text-gray-400 hover:bg-gray-800 hover:text-white"
													: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
									}`}
								>
									<tab.icon className="h-4 w-4" />
									{tab.label}
								</motion.button>
							))}
						</nav>
					</motion.div>

					{/* Content */}
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className={`flex-1 rounded-2xl border p-6 ${
							isDark 
								? "border-gray-800 bg-gray-900/50" 
								: "border-gray-200 bg-white"
						}`}
					>
						{activeTab === "general" && (
							<div className="space-y-6">
								<div>
									<h2 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>General Settings</h2>
									<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>Manage your app preferences</p>
								</div>

								<div className="space-y-4">
									<div>
										<label className={`text-sm font-medium mb-2 block flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
											<Globe className="h-4 w-4" /> Timezone
										</label>
										<select
											value={settings.general.timezone}
											onChange={(e) => handleSelect("general", "timezone", e.target.value)}
											className={`w-full h-11 rounded-xl border px-4 text-sm focus:outline-none transition-colors ${
												isDark 
													? "border-gray-700 bg-gray-800/50 text-white focus:border-purple-500" 
													: "border-gray-300 bg-white text-gray-900 focus:border-purple-500"
											}`}
										>
											{timezones.map((tz) => (
												<option key={tz} value={tz}>{tz}</option>
											))}
										</select>
									</div>

									<div>
										<label className={`text-sm font-medium mb-2 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>Language</label>
										<select
											value={settings.general.language}
											onChange={(e) => handleSelect("general", "language", e.target.value)}
											className={`w-full h-11 rounded-xl border px-4 text-sm focus:outline-none transition-colors ${
												isDark 
													? "border-gray-700 bg-gray-800/50 text-white focus:border-purple-500" 
													: "border-gray-300 bg-white text-gray-900 focus:border-purple-500"
											}`}
										>
											{languages.map((lang) => (
												<option key={lang.code} value={lang.code}>{lang.name}</option>
											))}
										</select>
									</div>
								</div>
							</div>
						)}

						{activeTab === "appearance" && (
							<div className="space-y-6">
								<div>
									<h2 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Appearance</h2>
									<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>Customize how the app looks</p>
								</div>

								<div>
									<label className={`text-sm font-medium mb-3 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>Theme</label>
									<div className="grid grid-cols-3 gap-3">
										{[
											{ id: "light", icon: Sun, label: "Light" },
											{ id: "dark", icon: Moon, label: "Dark" },
											{ id: "system", icon: Monitor, label: "System" },
										].map((themeOption) => (
											<motion.button
												key={themeOption.id}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												onClick={() => handleThemeChange(themeOption.id as "light" | "dark" | "system")}
												className={`p-4 rounded-xl border-2 transition-all ${
													settings.appearance.theme === themeOption.id
														? "border-purple-500 bg-purple-500/10"
														: isDark 
															? "border-gray-700 bg-gray-800/30 hover:border-gray-600"
															: "border-gray-200 bg-gray-50 hover:border-gray-300"
												}`}
											>
												<themeOption.icon className={`h-6 w-6 mx-auto mb-2 ${
													settings.appearance.theme === themeOption.id 
														? "text-purple-400" 
														: isDark ? "text-gray-400" : "text-gray-500"
												}`} />
												<p className={`text-sm font-medium ${
													settings.appearance.theme === themeOption.id 
														? "text-purple-300" 
														: isDark ? "text-gray-400" : "text-gray-600"
												}`}>{themeOption.label}</p>
											</motion.button>
										))}
									</div>
								</div>

								<div>
									<label className={`text-sm font-medium mb-3 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>Accent Color</label>
									<div className="flex flex-wrap gap-3">
										{accentColors.map((color) => (
											<motion.button
												key={color.value}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={() => handleSelect("appearance", "accentColor", color.value)}
												className={`w-10 h-10 rounded-xl transition-all ${
													settings.appearance.accentColor === color.value
														? isDark 
															? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
															: "ring-2 ring-gray-900 ring-offset-2 ring-offset-white"
														: ""
												}`}
												style={{ backgroundColor: color.value }}
												title={color.name}
											>
												{settings.appearance.accentColor === color.value && (
													<Check className="h-5 w-5 text-white mx-auto" />
												)}
											</motion.button>
										))}
									</div>
								</div>
							</div>
						)}

						{activeTab === "notifications" && (
							<div className="space-y-6">
								<div>
									<h2 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Notifications</h2>
									<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>Control how you receive alerts</p>
								</div>

								<div className="space-y-4">
									{[
										{ key: "emailAlerts", label: "Email Alerts", desc: "Receive email notifications" },
										{ key: "pushNotifications", label: "Push Notifications", desc: "Browser push notifications" },
										{ key: "streamStartAlerts", label: "Stream Start Alerts", desc: "Get notified when streams go live" },
										{ key: "weeklyReport", label: "Weekly Report", desc: "Receive weekly analytics summary" },
									].map((item) => (
										<div key={item.key} className={`flex items-center justify-between p-4 rounded-xl border ${
											isDark 
												? "border-gray-700 bg-gray-800/30" 
												: "border-gray-200 bg-gray-50"
										}`}>
											<div>
												<p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{item.label}</p>
												<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{item.desc}</p>
											</div>
											<motion.button
												whileTap={{ scale: 0.95 }}
												onClick={() => handleToggle("notifications", item.key, !settings.notifications[item.key as keyof typeof settings.notifications])}
												className={`relative w-12 h-7 rounded-full transition-colors ${
													settings.notifications[item.key as keyof typeof settings.notifications]
														? "bg-purple-500"
														: isDark ? "bg-gray-600" : "bg-gray-300"
												}`}
											>
												<motion.div
													layout
													className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
													animate={{ left: settings.notifications[item.key as keyof typeof settings.notifications] ? 26 : 4 }}
												/>
											</motion.button>
										</div>
									))}
								</div>
							</div>
						)}

						{activeTab === "streaming" && (
							<div className="space-y-6">
								<div>
									<h2 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Streaming</h2>
									<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>Configure default stream settings</p>
								</div>

								<div className="space-y-4">
									<div>
										<label className={`text-sm font-medium mb-2 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>Default Stream Type</label>
										<div className="grid grid-cols-2 gap-3">
											{[
												{ id: "youtube", label: "YouTube" },
												{ id: "hls", label: "HLS Stream" },
											].map((type) => (
												<motion.button
													key={type.id}
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													onClick={() => handleSelect("streaming", "defaultStreamType", type.id)}
													className={`p-4 rounded-xl border-2 transition-all ${
														settings.streaming.defaultStreamType === type.id
															? "border-purple-500 bg-purple-500/10 text-purple-300"
															: isDark 
																? "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600"
																: "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
													}`}
												>
													{type.label}
												</motion.button>
											))}
										</div>
									</div>

									<div>
										<label className={`text-sm font-medium mb-2 block ${isDark ? "text-gray-300" : "text-gray-700"}`}>Default Quality</label>
										<select
											value={settings.streaming.defaultQuality}
											onChange={(e) => handleSelect("streaming", "defaultQuality", e.target.value)}
											className={`w-full h-11 rounded-xl border px-4 text-sm focus:outline-none transition-colors ${
												isDark 
													? "border-gray-700 bg-gray-800/50 text-white focus:border-purple-500" 
													: "border-gray-300 bg-white text-gray-900 focus:border-purple-500"
											}`}
										>
											<option value="auto">Auto</option>
											<option value="1080p">1080p</option>
											<option value="720p">720p</option>
											<option value="480p">480p</option>
										</select>
									</div>

									<div className={`flex items-center justify-between p-4 rounded-xl border ${
										isDark 
											? "border-gray-700 bg-gray-800/30" 
											: "border-gray-200 bg-gray-50"
									}`}>
										<div>
											<p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Auto-start Streams</p>
											<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>Start streaming when room is activated</p>
										</div>
										<motion.button
											whileTap={{ scale: 0.95 }}
											onClick={() => handleToggle("streaming", "autoStart", !settings.streaming.autoStart)}
											className={`relative w-12 h-7 rounded-full transition-colors ${
												settings.streaming.autoStart ? "bg-purple-500" : isDark ? "bg-gray-600" : "bg-gray-300"
											}`}
										>
											<motion.div
												layout
												className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
												animate={{ left: settings.streaming.autoStart ? 26 : 4 }}
											/>
										</motion.button>
									</div>
								</div>
							</div>
						)}

						{activeTab === "security" && (
							<div className="space-y-6">
								<div>
									<h2 className={`text-lg font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>Security</h2>
									<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>Manage your account security</p>
								</div>

								<div className="space-y-4">
									<motion.button
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
										onClick={() => info("Coming Soon", "Password change will be available soon")}
										className={`w-full p-4 rounded-xl border text-left transition-colors ${
											isDark 
												? "border-gray-700 bg-gray-800/30 hover:border-gray-600" 
												: "border-gray-200 bg-gray-50 hover:border-gray-300"
										}`}
									>
										<p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Change Password</p>
										<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>Update your account password</p>
									</motion.button>

									<div className={`flex items-center justify-between p-4 rounded-xl border ${
										isDark 
											? "border-gray-700 bg-gray-800/30" 
											: "border-gray-200 bg-gray-50"
									}`}>
										<div>
											<p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Two-Factor Authentication</p>
											<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>Add an extra layer of security</p>
										</div>
										<span className={`px-2 py-1 rounded text-xs font-medium ${
											isDark 
												? "bg-amber-500/20 text-amber-300" 
												: "bg-amber-100 text-amber-700"
										}`}>Coming Soon</span>
									</div>

									<motion.button
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
										onClick={() => info("Sessions", "You have 1 active session")}
										className={`w-full p-4 rounded-xl border text-left transition-colors ${
											isDark 
												? "border-gray-700 bg-gray-800/30 hover:border-gray-600" 
												: "border-gray-200 bg-gray-50 hover:border-gray-300"
										}`}
									>
										<p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Active Sessions</p>
										<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>Manage your logged-in devices</p>
									</motion.button>
								</div>
							</div>
						)}

						{activeTab === "danger" && (
							<div className="space-y-6">
								<div>
									<h2 className="text-lg font-semibold text-red-400 mb-1">Danger Zone</h2>
									<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>Irreversible actions</p>
								</div>

								<div className="space-y-4">
									<motion.button
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
										onClick={() => info("Export Data", "Your data export will be ready shortly")}
										className={`w-full p-4 rounded-xl border text-left transition-colors flex items-center gap-3 ${
											isDark 
												? "border-gray-700 bg-gray-800/30 hover:border-gray-600" 
												: "border-gray-200 bg-gray-50 hover:border-gray-300"
										}`}
									>
										<Download className={`h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
										<div>
											<p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Export Data</p>
											<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>Download all your data</p>
										</div>
									</motion.button>

									<motion.button
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
										onClick={() => info("Delete Account", "Contact support to delete your account")}
										className={`w-full p-4 rounded-xl border text-left transition-colors flex items-center gap-3 ${
											isDark 
												? "border-red-500/30 bg-red-500/10 hover:bg-red-500/20" 
												: "border-red-200 bg-red-50 hover:bg-red-100"
										}`}
									>
										<Trash2 className="h-5 w-5 text-red-400" />
										<div>
											<p className={`text-sm font-medium ${isDark ? "text-red-300" : "text-red-700"}`}>Delete Account</p>
											<p className={`text-xs ${isDark ? "text-red-400/70" : "text-red-500"}`}>Permanently delete your account and data</p>
										</div>
									</motion.button>
								</div>
							</div>
						)}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
