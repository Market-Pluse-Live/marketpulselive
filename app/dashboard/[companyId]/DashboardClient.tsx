"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Navbar } from "@/components/dashboard/Navbar";
import { LiveGrid } from "@/components/livestream/LiveGrid";
import { RoomManager } from "@/components/dashboard/RoomManager";
import { RoomEditor } from "@/components/dashboard/RoomEditor";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
import { SkeletonStats } from "@/components/dashboard/SkeletonCard";
import { NotificationContainer } from "@/components/dashboard/NotificationToast";
import { useNotification } from "@/lib/notification-context";
import { useTheme } from "@/lib/theme-context";

import type { Room, StreamType, ActivityLogEntry } from "@/lib/types";
import { getRoomStatus } from "@/lib/types";

interface DashboardClientProps {
	companyId: string;
}

// Mock activity log entries
const generateMockActivity = (rooms: Room[]): ActivityLogEntry[] => {
	const actions: ActivityLogEntry["action"][] = ["updated", "activated", "deactivated", "started_stream", "created"];
	return rooms.slice(0, 8).map((room, i) => ({
		id: `log-${i}`,
		roomId: room.id,
		roomName: room.name,
		action: actions[i % actions.length],
		timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
	})).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export function DashboardClient({ companyId }: DashboardClientProps) {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [editingRoom, setEditingRoom] = useState<Room | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const { success, error } = useNotification();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const loadRooms = useCallback(async (showRefreshNotification = false) => {
		try {
			const response = await fetch(`/api/rooms?companyId=${companyId}`);
			if (response.ok) {
				const data = await response.json();
				const roomsWithMeta = (data.rooms || []).map((room: Room) => ({
					...room,
					lastUpdated: room.lastUpdated || new Date(Date.now() - Math.random() * 86400000).toISOString(),
				}));
				setRooms(roomsWithMeta);
				if (showRefreshNotification) {
					success("Refreshed", "Room data updated successfully");
				}
			}
		} catch (err) {
			console.error("Failed to load rooms:", err);
			error("Failed to load rooms", "Please try again later");
		} finally {
			setIsLoading(false);
		}
	}, [companyId, success, error]);

	useEffect(() => {
		loadRooms();
	}, [loadRooms]);

	// Real-time updates - poll every 10 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			loadRooms(false);
		}, 10000);
		return () => clearInterval(interval);
	}, [loadRooms]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await loadRooms(true);
		setTimeout(() => setIsRefreshing(false), 500);
	};

	const handleToggleActive = async (roomId: string, isActive: boolean) => {
		try {
			const response = await fetch(`/api/rooms/${roomId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ companyId, isActive }),
			});

			if (response.ok) {
				const { room } = await response.json();
				setRooms((prev) =>
					prev.map((r) => (r.id === room.id ? { ...room, lastUpdated: new Date().toISOString() } : r)),
				);
				success(
					isActive ? "Room Activated" : "Room Deactivated",
					`${room.name} is now ${isActive ? "active" : "inactive"}`
				);
			}
		} catch (err) {
			console.error("Failed to toggle room:", err);
			error("Failed to update room", "Please try again");
		}
	};

	const handleSaveRoom = async (
		roomId: string,
		data: { name: string; streamUrl: string; streamType: StreamType; thumbnail?: string; autoStart?: boolean },
	) => {
		const response = await fetch(`/api/rooms/${roomId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ companyId, ...data }),
		});

		if (response.ok) {
			const { room } = await response.json();
			setRooms((prev) => prev.map((r) => (r.id === room.id ? { ...room, lastUpdated: new Date().toISOString() } : r)));
			success("Room Updated", `${room.name} settings saved successfully`);
		} else {
			error("Failed to save", "Could not update room settings");
			throw new Error("Failed to save room");
		}
	};

	// Calculate stats
	const stats = useMemo(() => {
		return {
			totalRooms: rooms.length,
			liveRooms: rooms.filter(r => getRoomStatus(r) === "live").length,
			activeRooms: rooms.filter(r => r.isActive).length,
			readyRooms: rooms.filter(r => r.streamUrl && !r.isActive).length,
			notConfigured: rooms.filter(r => !r.streamUrl).length,
			errors: rooms.filter(r => !r.streamUrl && r.isActive).length,
		};
	}, [rooms]);

	const activityLog = useMemo(() => generateMockActivity(rooms), [rooms]);

	// Loading state
	if (isLoading) {
		return (
			<div className={`min-h-screen transition-colors duration-300 ${
				isDark 
					? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
					: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
			}`}>
				<Navbar isRefreshing={true} />
				<div className="max-w-[1800px] mx-auto px-6 py-6">
					<SkeletonStats />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
						{[...Array(4)].map((_, i) => (
							<div key={i} className={`aspect-video rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`min-h-screen transition-colors duration-300 ${
			isDark 
				? "bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900" 
				: "bg-gradient-to-b from-gray-50 via-white to-gray-100"
		}`}>
			<NotificationContainer />
			
			{/* Navbar */}
			<Navbar 
				onRefresh={handleRefresh} 
				isRefreshing={isRefreshing}
				notificationCount={stats.errors > 0 ? stats.errors : 0}
			/>

			<div className="max-w-[1800px] mx-auto px-6 py-6">
				{/* Stats Overview */}
				<DashboardStats {...stats} />

				{/* Main Content */}
				<div className="flex flex-col xl:flex-row gap-6">
					{/* Left: Live Grid + Room Manager */}
					<div className="flex-1 min-w-0">
						{/* Live Grid - 4 Stream Windows */}
						<LiveGrid 
							rooms={rooms} 
							onEditRoom={setEditingRoom}
						/>

						{/* Room Manager - 8 Rooms */}
						<RoomManager
							rooms={rooms}
							onEditRoom={setEditingRoom}
							onToggleActive={handleToggleActive}
						/>
					</div>

					{/* Right Sidebar */}
					<div className="xl:w-[340px] flex-shrink-0 space-y-6">
						<ActivityTimeline entries={activityLog} />
						<AnalyticsPanel />
					</div>
				</div>
			</div>

			{/* Edit Modal */}
			<AnimatePresence>
				{editingRoom && (
					<RoomEditor
						room={editingRoom}
						onClose={() => setEditingRoom(null)}
						onSave={handleSaveRoom}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
