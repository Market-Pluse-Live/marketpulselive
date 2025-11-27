"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, Loader2, Tv, AlertCircle } from "lucide-react";
import { StreamPlayer } from "@/components/viewer/StreamPlayer";
import { Navbar } from "@/components/dashboard/Navbar";
import { useTheme } from "@/lib/theme-context";
import { useRole } from "@/lib/role-context";
import type { Room } from "@/lib/types";

export default function RoomViewerPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const [roomId, setRoomId] = useState<string | null>(null);
	const [room, setRoom] = useState<Room | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const companyId = searchParams.get("companyId") || "dev-company";
	const { theme } = useTheme();
	const { isAdmin } = useRole();
	const isDark = theme === "dark";

	// Unwrap params
	useEffect(() => {
		params.then((p) => setRoomId(p.roomId));
	}, [params]);

	// Fetch room data
	useEffect(() => {
		if (!roomId) return;

		const fetchRoom = async () => {
			try {
				const response = await fetch(`/api/rooms/${roomId}?companyId=${companyId}`);
				if (response.ok) {
					const data = await response.json();
					setRoom(data.room);
				} else if (response.status === 404) {
					setError("Room not found");
				} else {
					setError("Failed to load room");
				}
			} catch (err) {
				console.error("Error fetching room:", err);
				setError("Failed to load room");
			} finally {
				setIsLoading(false);
			}
		};

		fetchRoom();
	}, [roomId, companyId]);

	// Loading state
	if (isLoading || !roomId) {
		return (
			<div className={`min-h-screen flex items-center justify-center ${
				isDark ? "bg-gray-950" : "bg-gray-50"
			}`}>
				<div className="text-center space-y-4">
					<Loader2 className={`h-8 w-8 animate-spin mx-auto ${
						isDark ? "text-purple-400" : "text-purple-600"
					}`} />
					<p className={isDark ? "text-gray-400" : "text-gray-500"}>
						Loading stream...
					</p>
				</div>
			</div>
		);
	}

	// Error state
	if (error || !room) {
		return (
			<div className={`min-h-screen flex items-center justify-center ${
				isDark ? "bg-gray-950" : "bg-gray-50"
			}`}>
				<div className="text-center space-y-4">
					<div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
						isDark ? "bg-red-500/20" : "bg-red-100"
					}`}>
						<AlertCircle className={`h-8 w-8 ${isDark ? "text-red-400" : "text-red-500"}`} />
					</div>
					<h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
						{error || "Room Not Found"}
					</h1>
					<p className={isDark ? "text-gray-400" : "text-gray-500"}>
						The requested livestream room does not exist.
					</p>
					<Link 
						href="/dashboard/dev-company"
						className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
							isDark 
								? "bg-gray-800 text-white hover:bg-gray-700" 
								: "bg-gray-200 text-gray-900 hover:bg-gray-300"
						}`}
					>
						<Home className="h-4 w-4" />
						Go to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	// Stream offline
	if (!room.isActive) {
		return (
			<div className={`min-h-screen flex items-center justify-center ${
				isDark ? "bg-gray-950" : "bg-gray-50"
			}`}>
				<div className="text-center space-y-4">
					<div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
						isDark ? "bg-gray-800" : "bg-gray-200"
					}`}>
						<Tv className={`h-8 w-8 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
					</div>
					<h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
						Stream Offline
					</h1>
					<p className={isDark ? "text-gray-400" : "text-gray-500"}>
						This room is currently inactive.
					</p>
					<Link 
						href="/dashboard/dev-company"
						className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
							isDark 
								? "bg-gray-800 text-white hover:bg-gray-700" 
								: "bg-gray-200 text-gray-900 hover:bg-gray-300"
						}`}
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	// No stream URL
	if (!room.streamUrl) {
		return (
			<div className={`min-h-screen flex items-center justify-center ${
				isDark ? "bg-gray-950" : "bg-gray-50"
			}`}>
				<div className="text-center space-y-4">
					<h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
						{room.name}
					</h1>
					<p className={isDark ? "text-gray-400" : "text-gray-500"}>
						Stream URL not configured yet.
					</p>
					<Link 
						href="/dashboard/dev-company"
						className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
							isDark 
								? "bg-gray-800 text-white hover:bg-gray-700" 
								: "bg-gray-200 text-gray-900 hover:bg-gray-300"
						}`}
					>
						Go to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	// Main stream view
	return (
		<div className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
			{/* Show admin navbar if admin, otherwise show simple header */}
			{isAdmin ? (
				<Navbar />
			) : (
				<header className={`border-b sticky top-0 z-10 backdrop-blur-sm ${
					isDark 
						? "border-gray-800 bg-gray-900/80" 
						: "border-gray-200 bg-white/80"
				}`}>
					<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link 
								href="/dashboard/dev-company"
								className={`p-2 rounded-lg transition-colors ${
									isDark 
										? "hover:bg-gray-800 text-gray-400 hover:text-white" 
										: "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
								}`}
							>
								<ArrowLeft className="h-5 w-5" />
							</Link>
							<div>
								<h1 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
									{room.name}
								</h1>
								<div className="flex items-center gap-2">
									<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
									<span className={`text-xs uppercase ${isDark ? "text-gray-400" : "text-gray-500"}`}>
										Live
									</span>
								</div>
							</div>
						</div>
						<Link 
							href="/dashboard/dev-company"
							className={`p-2 rounded-lg transition-colors ${
								isDark 
									? "hover:bg-gray-800 text-gray-400 hover:text-white" 
									: "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
							}`}
						>
							<Home className="h-5 w-5" />
						</Link>
					</div>
				</header>
			)}

			{/* Stream info bar for admin */}
			{isAdmin && (
				<div className={`border-b ${isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"}`}>
					<div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Link 
								href="/dashboard/dev-company"
								className={`flex items-center gap-2 text-sm ${
									isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
								}`}
							>
								<ArrowLeft className="h-4 w-4" />
								Back to Dashboard
							</Link>
							<span className={isDark ? "text-gray-700" : "text-gray-300"}>|</span>
							<h1 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
								{room.name}
							</h1>
						</div>
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
							<span className={`text-sm font-medium ${isDark ? "text-red-400" : "text-red-500"}`}>
								LIVE
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Stream Player */}
			<div className="max-w-7xl mx-auto px-6 py-6">
				<StreamPlayer
					streamUrl={room.streamUrl}
					streamType={room.streamType}
					roomName={room.name}
				/>
			</div>
		</div>
	);
}
