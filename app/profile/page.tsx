"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
	User, Camera, Mail, Shield, Calendar, BarChart3, Clock, Eye,
	Edit2, Check, X, ArrowLeft, Tv, Settings
} from "lucide-react";
import { useUser } from "@/lib/user-context";
import { useNotification } from "@/lib/notification-context";
import { useTheme } from "@/lib/theme-context";
import { NotificationContainer } from "@/components/dashboard/NotificationToast";

export default function ProfilePage() {
	const { profile, updateProfile, uploadAvatar } = useUser();
	const { success, error } = useNotification();
	const { theme } = useTheme();
	const isDark = theme === "dark";
	
	const [isEditingName, setIsEditingName] = useState(false);
	const [newName, setNewName] = useState(profile.name);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleAvatarClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			error("Invalid file", "Please select an image file");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			error("File too large", "Please select an image under 5MB");
			return;
		}

		setIsUploading(true);
		try {
			await uploadAvatar(file);
			success("Avatar updated", "Your profile picture has been changed");
		} catch {
			error("Upload failed", "Could not upload avatar");
		} finally {
			setIsUploading(false);
		}
	};

	const handleSaveName = () => {
		if (newName.trim()) {
			updateProfile({ name: newName.trim() });
			setIsEditingName(false);
			success("Name updated", "Your display name has been changed");
		}
	};

	const roleColors = {
		admin: isDark ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-purple-100 text-purple-700 border-purple-200",
		moderator: isDark ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-blue-100 text-blue-700 border-blue-200",
		viewer: isDark ? "bg-gray-500/20 text-gray-300 border-gray-500/30" : "bg-gray-100 text-gray-700 border-gray-200",
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
				<div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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
							<span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Profile</span>
						</div>
					</div>
					<Link href="/settings">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
								isDark 
									? "text-gray-400 hover:text-white hover:bg-gray-800" 
									: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
							}`}
						>
							<Settings className="h-4 w-4" />
							Settings
						</motion.button>
					</Link>
				</div>
			</header>

			<div className="max-w-4xl mx-auto px-6 py-8">
				{/* Profile Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className={`rounded-2xl border backdrop-blur-sm overflow-hidden mb-6 ${
						isDark 
							? "border-gray-800 bg-gray-900/50" 
							: "border-gray-200 bg-white/80"
					}`}
				>
					{/* Cover */}
					<div className="h-32 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20" />
					
					{/* Avatar & Info */}
					<div className="px-6 pb-6">
						<div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
							{/* Avatar */}
							<div className="relative">
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={handleAvatarClick}
									disabled={isUploading}
									className={`relative w-24 h-24 rounded-2xl border-4 overflow-hidden group ${
										isDark 
											? "bg-gray-800 border-gray-900" 
											: "bg-gray-100 border-white"
									}`}
								>
									{profile.avatar ? (
										<img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
											{profile.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<Camera className="h-6 w-6 text-white" />
									</div>
									{isUploading && (
										<div className="absolute inset-0 bg-black/70 flex items-center justify-center">
											<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
										</div>
									)}
								</motion.button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									className="hidden"
								/>
							</div>

							{/* Name & Role */}
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-1">
									{isEditingName ? (
										<div className="flex items-center gap-2">
											<input
												type="text"
												value={newName}
												onChange={(e) => setNewName(e.target.value)}
												className={`h-10 px-3 rounded-lg border text-lg font-semibold focus:outline-none ${
													isDark 
														? "border-gray-700 bg-gray-800 text-white focus:border-purple-500" 
														: "border-gray-300 bg-white text-gray-900 focus:border-purple-500"
												}`}
												autoFocus
											/>
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={handleSaveName}
												className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
											>
												<Check className="h-4 w-4" />
											</motion.button>
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={() => { setIsEditingName(false); setNewName(profile.name); }}
												className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
											>
												<X className="h-4 w-4" />
											</motion.button>
										</div>
									) : (
										<>
											<h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{profile.name}</h1>
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={() => setIsEditingName(true)}
												className={`p-1.5 rounded-lg transition-colors ${
													isDark 
														? "hover:bg-gray-800 text-gray-500 hover:text-white" 
														: "hover:bg-gray-100 text-gray-400 hover:text-gray-700"
												}`}
											>
												<Edit2 className="h-4 w-4" />
											</motion.button>
										</>
									)}
								</div>
								<div className="flex items-center gap-3">
									<span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${roleColors[profile.role]}`}>
										<Shield className="h-3 w-3 inline mr-1" />
										{profile.role}
									</span>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Info Cards */}
				<div className="grid md:grid-cols-2 gap-6 mb-6">
					{/* Contact Info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className={`rounded-2xl border p-6 ${
							isDark 
								? "border-gray-800 bg-gray-900/50" 
								: "border-gray-200 bg-white"
						}`}
					>
						<h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Contact Information</h2>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-blue-500/20">
									<Mail className="h-4 w-4 text-blue-400" />
								</div>
								<div>
									<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Email</p>
									<p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{profile.email}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-purple-500/20">
									<User className="h-4 w-4 text-purple-400" />
								</div>
								<div>
									<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>User ID</p>
									<p className={`text-sm font-mono ${isDark ? "text-white" : "text-gray-900"}`}>{profile.id}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-emerald-500/20">
									<Calendar className="h-4 w-4 text-emerald-400" />
								</div>
								<div>
									<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Member Since</p>
									<p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{new Date(profile.createdAt).toLocaleDateString()}</p>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className={`rounded-2xl border p-6 ${
							isDark 
								? "border-gray-800 bg-gray-900/50" 
								: "border-gray-200 bg-white"
						}`}
					>
						<h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Activity Stats</h2>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-pink-500/20">
									<BarChart3 className="h-4 w-4 text-pink-400" />
								</div>
								<div className="flex-1">
									<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Streams Managed</p>
									<p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{profile.stats.streamsManaged}</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-amber-500/20">
									<Clock className="h-4 w-4 text-amber-400" />
								</div>
								<div className="flex-1">
									<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Hours Streamed</p>
									<p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{profile.stats.hoursStreamed}h</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-2 rounded-lg bg-cyan-500/20">
									<Eye className="h-4 w-4 text-cyan-400" />
								</div>
								<div className="flex-1">
									<p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>Total Views</p>
									<p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{profile.stats.totalViews.toLocaleString()}</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Actions */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					className="flex flex-wrap gap-3"
				>
					<Link href="/settings">
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
								isDark 
									? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" 
									: "bg-purple-100 text-purple-700 hover:bg-purple-200"
							}`}
						>
							<Settings className="h-4 w-4" />
							Account Settings
						</motion.button>
					</Link>
					<Link href="/dashboard/dev-company">
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className={`px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 ${
								isDark 
									? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
									: "bg-gray-100 text-gray-700 hover:bg-gray-200"
							}`}
						>
							<BarChart3 className="h-4 w-4" />
							Go to Dashboard
						</motion.button>
					</Link>
				</motion.div>
			</div>
		</div>
	);
}
