"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Search, Filter, Radio, CheckCircle, Pause, AlertCircle, Video, Link2, Edit2 } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { useTheme } from "@/lib/theme-context";
import type { Room, RoomStatus } from "@/lib/types";
import { getRoomStatus } from "@/lib/types";

interface RoomManagerProps {
	rooms: Room[];
	onEditRoom: (room: Room) => void;
	onToggleActive: (roomId: string, isActive: boolean) => void;
}

interface MiniRoomCardProps {
	room: Room;
	onEdit: (room: Room) => void;
	onToggle: (roomId: string, isActive: boolean) => void;
	index: number;
	isDark: boolean;
}

const statusColors: Record<RoomStatus, { bg: string; border: string; text: string; lightBg: string; lightBorder: string }> = {
	live: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", lightBg: "bg-emerald-50", lightBorder: "border-emerald-200" },
	active: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", lightBg: "bg-blue-50", lightBorder: "border-blue-200" },
	configured: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", lightBg: "bg-amber-50", lightBorder: "border-amber-200" },
	inactive: { bg: "bg-gray-500/10", border: "border-gray-500/30", text: "text-gray-400", lightBg: "bg-gray-50", lightBorder: "border-gray-200" },
	error: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", lightBg: "bg-red-50", lightBorder: "border-red-200" },
};

function MiniRoomCard({ room, onEdit, onToggle, index, isDark }: MiniRoomCardProps) {
	const status = getRoomStatus(room);
	const colors = statusColors[status];
	const isLive = status === "live";

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05 }}
			whileHover={{ scale: 1.02, y: -2 }}
			className={`relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-200 cursor-pointer group ${
				isDark 
					? `${colors.border} ${colors.bg}` 
					: `${colors.lightBorder} ${colors.lightBg}`
			}`}
			onClick={() => onEdit(room)}
		>
			{/* Live indicator glow */}
			{isLive && (
				<div className="absolute inset-0 rounded-xl bg-emerald-500/5 animate-pulse pointer-events-none" />
			)}

			<div className="flex items-center gap-3">
				{/* Icon */}
				<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
					room.streamType === "youtube" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
				}`}>
					{room.streamType === "youtube" ? <Video className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
				</div>

				{/* Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h4 className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{room.name}</h4>
						{isLive && (
							<span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
								<span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
								Live
							</span>
						)}
					</div>
					<p className={`text-xs truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>
						{room.streamUrl || "Not configured"}
					</p>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<Tooltip content={room.isActive ? "Deactivate" : "Activate"}>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onToggle(room.id, !room.isActive);
							}}
							disabled={!room.streamUrl}
							className={`p-2 rounded-lg transition-colors ${
								room.isActive 
									? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" 
									: isDark 
										? "bg-gray-700 text-gray-400 hover:bg-gray-600"
										: "bg-gray-200 text-gray-500 hover:bg-gray-300"
							} disabled:opacity-50 disabled:cursor-not-allowed`}
						>
							{room.isActive ? <Radio className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
						</button>
					</Tooltip>
					<Tooltip content="Edit room">
						<button
							onClick={(e) => {
								e.stopPropagation();
								onEdit(room);
							}}
							className={`p-2 rounded-lg transition-colors ${
								isDark 
									? "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
									: "bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700"
							}`}
						>
							<Edit2 className="h-4 w-4" />
						</button>
					</Tooltip>
				</div>
			</div>
		</motion.div>
	);
}

export function RoomManager({ rooms, onEditRoom, onToggleActive }: RoomManagerProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const [searchQuery, setSearchQuery] = useState("");
	const [filterActive, setFilterActive] = useState(false);

	const filteredRooms = rooms.filter(room => {
		const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			room.streamUrl.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = !filterActive || room.isActive;
		return matchesSearch && matchesFilter;
	});

	const activeCount = rooms.filter(r => r.isActive && r.streamUrl).length;
	const configuredCount = rooms.filter(r => r.streamUrl).length;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
				isDark 
					? "border-gray-800 bg-gray-900/50" 
					: "border-gray-200 bg-white/80"
			}`}
		>
			{/* Header */}
			<div className={`px-5 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-purple-500/20">
							<Settings className="h-4 w-4 text-purple-400" />
						</div>
						<div>
							<h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Stream Rooms</h3>
							<p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
								{activeCount} active of {configuredCount} configured ({rooms.length} total)
							</p>
						</div>
					</div>
				</div>

				{/* Search & Filter */}
				<div className="flex gap-2">
					<div className="relative flex-1">
						<Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search rooms..."
							className={`w-full h-9 rounded-lg border pl-9 pr-3 text-sm focus:outline-none transition-colors ${
								isDark 
									? "border-gray-700 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-purple-500"
									: "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-purple-500"
							}`}
						/>
					</div>
					<Tooltip content={filterActive ? "Show all" : "Show active only"}>
						<button
							onClick={() => setFilterActive(!filterActive)}
							className={`p-2 rounded-lg border transition-colors ${
								filterActive 
									? "border-purple-500 bg-purple-500/20 text-purple-400" 
									: isDark 
										? "border-gray-700 bg-gray-800/50 text-gray-400 hover:text-white"
										: "border-gray-300 bg-white text-gray-500 hover:text-gray-700"
							}`}
						>
							<Filter className="h-4 w-4" />
						</button>
					</Tooltip>
				</div>
			</div>

			{/* Room List */}
			<div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
				{filteredRooms.length === 0 ? (
					<div className="text-center py-8">
						<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>No rooms found</p>
					</div>
				) : (
					filteredRooms.map((room, index) => (
						<MiniRoomCard
							key={room.id}
							room={room}
							onEdit={onEditRoom}
							onToggle={onToggleActive}
							index={index}
							isDark={isDark}
						/>
					))
				)}
			</div>

			{/* Quick Stats Footer */}
			<div className={`px-5 py-3 border-t ${isDark ? "border-gray-800 bg-gray-900/30" : "border-gray-200 bg-gray-50"}`}>
				<div className="flex items-center justify-between text-xs">
					<div className="flex items-center gap-4">
						<span className="flex items-center gap-1.5 text-emerald-400">
							<Radio className="h-3 w-3" /> {activeCount} Active
						</span>
						<span className="flex items-center gap-1.5 text-amber-400">
							<CheckCircle className="h-3 w-3" /> {configuredCount - activeCount} Ready
						</span>
						<span className={`flex items-center gap-1.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
							<AlertCircle className="h-3 w-3" /> {rooms.length - configuredCount} Empty
						</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
