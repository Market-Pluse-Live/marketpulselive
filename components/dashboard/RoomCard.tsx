"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
	Edit2, Video, Link2, Eye, Users, Wifi, Activity, Clock,
	MoreVertical, Copy, Trash2, ExternalLink, GripVertical, Zap,
	AlertTriangle
} from "lucide-react";
import { RoomStatusBadge } from "./RoomStatusBadge";
import { Tooltip } from "./Tooltip";
import type { Room, RoomStatus, StreamMetrics } from "@/lib/types";
import { getRoomStatus, generateMockMetrics } from "@/lib/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RoomCardProps {
	room: Room;
	onEdit: (room: Room) => void;
	onToggleActive: (roomId: string, isActive: boolean) => void;
	onDelete?: (roomId: string) => void;
	index?: number;
	isDraggable?: boolean;
}

function formatTimeAgo(timestamp?: string): string {
	if (!timestamp) return "Never";
	const now = new Date();
	const time = new Date(timestamp);
	const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
	
	if (diff < 60) return "Just now";
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

function MetricPill({ icon: Icon, value, label, color, tooltip }: { 
	icon: React.ComponentType<{ className?: string }>; 
	value: string | number; 
	label: string;
	color: string;
	tooltip: string;
}) {
	return (
		<Tooltip content={tooltip}>
			<div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-800/50 ${color} cursor-default`}>
				<Icon className="h-3 w-3" />
				<span className="text-xs font-semibold">{value}</span>
				<span className="text-[10px] text-gray-500 hidden sm:inline">{label}</span>
			</div>
		</Tooltip>
	);
}

export function RoomCard({ room, onEdit, onToggleActive, onDelete, index = 0, isDraggable = true }: RoomCardProps) {
	const [isUpdating, setIsUpdating] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	
	const status: RoomStatus = getRoomStatus(room);
	const isLive = status === "live";
	const metrics: StreamMetrics = room.metrics || generateMockMetrics();
	const hasError = !room.streamUrl && room.isActive;

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: room.id, disabled: !isDraggable });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const handleToggle = async (checked: boolean) => {
		setIsUpdating(true);
		try {
			await onToggleActive(room.id, checked);
		} finally {
			setIsUpdating(false);
		}
	};

	const healthColors: Record<string, string> = {
		good: "text-emerald-400",
		fair: "text-amber-400",
		poor: "text-red-400",
	};

	return (
		<motion.div
			ref={setNodeRef}
			style={style}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
			transition={{ delay: index * 0.05, duration: 0.3, ease: "easeOut" }}
			whileHover={{ y: -4, transition: { duration: 0.2 } }}
			className={`group relative rounded-2xl border bg-gray-900/70 backdrop-blur-sm p-5 transition-all duration-300 ${
				isLive 
					? "border-emerald-500/40 shadow-lg shadow-emerald-500/10" 
					: hasError 
						? "border-red-500/40 shadow-lg shadow-red-500/10"
						: "border-gray-800 hover:border-gray-700 hover:shadow-xl hover:shadow-black/20"
			} ${isDragging ? "z-50 shadow-2xl" : ""}`}
		>
			{/* Live glow effect */}
			{isLive && (
				<div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none animate-pulse" />
			)}

			{/* Error indicator */}
			{hasError && (
				<div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 animate-bounce">
					<AlertTriangle className="h-3 w-3 text-white" />
				</div>
			)}

			{/* Header */}
			<div className="flex items-start justify-between mb-4 relative">
				<div className="flex items-center gap-3 flex-1 min-w-0">
					{/* Drag Handle */}
					{isDraggable && (
						<div 
							{...attributes} 
							{...listeners}
							className="cursor-grab active:cursor-grabbing p-1 -ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300"
						>
							<GripVertical className="h-4 w-4" />
						</div>
					)}
					
					{/* Icon */}
					<div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
						room.streamType === "youtube" 
							? "bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-400 shadow-lg shadow-red-500/10" 
							: "bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-400 shadow-lg shadow-blue-500/10"
					}`}>
						{room.streamType === "youtube" ? (
							<Video className="h-5 w-5" />
						) : (
							<Link2 className="h-5 w-5" />
						)}
					</div>
					
					{/* Title */}
					<div className="min-w-0 flex-1">
						<h3 className="text-base font-semibold text-white truncate">{room.name}</h3>
						<p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
							{room.streamType} Stream
						</p>
					</div>
				</div>
				
				<div className="flex items-center gap-2">
					<RoomStatusBadge status={status} />
					
					{/* Menu */}
					<div className="relative">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setShowMenu(!showMenu)}
							className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
						>
							<MoreVertical className="h-4 w-4" />
						</motion.button>
						
						{showMenu && (
							<>
								<div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-700 bg-gray-800 shadow-xl z-20 py-1 overflow-hidden"
								>
									<button
										onClick={() => { onEdit(room); setShowMenu(false); }}
										className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2.5 transition-colors"
									>
										<Edit2 className="h-4 w-4" /> Edit Room
									</button>
									<button
										onClick={() => { navigator.clipboard.writeText(room.streamUrl); setShowMenu(false); }}
										className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2.5 transition-colors"
									>
										<Copy className="h-4 w-4" /> Copy URL
									</button>
									{room.isActive && room.streamUrl && (
										<Link
											href={`/rooms/${room.id}`}
											target="_blank"
											className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2.5 transition-colors"
											onClick={() => setShowMenu(false)}
										>
											<ExternalLink className="h-4 w-4" /> Open Stream
										</Link>
									)}
									<div className="border-t border-gray-700 my-1" />
									{onDelete && (
										<button
											onClick={() => { onDelete(room.id); setShowMenu(false); }}
											className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2.5 transition-colors"
										>
											<Trash2 className="h-4 w-4" /> Delete
										</button>
									)}
								</motion.div>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Thumbnail */}
			<div className="aspect-video rounded-xl mb-4 bg-gray-800/50 border border-gray-700/50 overflow-hidden relative group/thumb">
				{room.thumbnail ? (
					<img src={room.thumbnail} alt={room.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105" />
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<Video className="h-10 w-10 text-gray-600" />
					</div>
				)}
				
				{/* Overlay on hover */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
					{room.isActive && room.streamUrl && (
						<Link href={`/rooms/${room.id}`}>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-medium flex items-center gap-2"
							>
								<Eye className="h-4 w-4" /> Watch Stream
							</motion.button>
						</Link>
					)}
				</div>

				{/* Live indicator */}
				{isLive && (
					<div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
						<span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
						Live
					</div>
				)}
			</div>

			{/* Metrics - Only show when live/active */}
			{(isLive || status === "active") && (
				<div className="flex flex-wrap gap-2 mb-4">
					<MetricPill 
						icon={Users} 
						value={metrics.viewerCount} 
						label="viewers" 
						color="text-gray-300" 
						tooltip="Current viewer count"
					/>
					<MetricPill 
						icon={Activity} 
						value={metrics.health.charAt(0).toUpperCase() + metrics.health.slice(1)} 
						label="" 
						color={healthColors[metrics.health]} 
						tooltip="Stream health status"
					/>
					<MetricPill 
						icon={Wifi} 
						value={`${Math.round(metrics.bitrate / 1000)}k`} 
						label="bps" 
						color="text-gray-300" 
						tooltip={`Bitrate: ${metrics.bitrate} kbps`}
					/>
					<MetricPill 
						icon={Zap} 
						value={`${metrics.latency}ms`} 
						label="" 
						color="text-gray-300" 
						tooltip="Stream latency"
					/>
				</div>
			)}

			{/* Stream URL */}
			<div className="mb-4 p-3 rounded-xl bg-gray-800/40 border border-gray-700/50">
				<p className="text-[10px] text-gray-500 mb-1 flex items-center gap-1 uppercase tracking-wider font-medium">
					<Link2 className="h-3 w-3" /> Stream URL
				</p>
				<p className="text-sm text-gray-300 truncate font-mono">
					{room.streamUrl || <span className="text-gray-500 italic">Not configured</span>}
				</p>
			</div>

			{/* Last Updated */}
			<div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-4 uppercase tracking-wider">
				<Clock className="h-3 w-3" />
				<span>Updated {formatTimeAgo(room.lastUpdated)}</span>
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between pt-4 border-t border-gray-800">
				<Tooltip content={room.isActive ? "Deactivate room" : "Activate room"}>
					<label className="flex items-center gap-3 cursor-pointer select-none">
						<button
							type="button"
							role="switch"
							aria-checked={room.isActive}
							onClick={() => handleToggle(!room.isActive)}
							disabled={isUpdating || !room.streamUrl}
							className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
								room.isActive 
									? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30" 
									: "bg-gray-600"
							}`}
						>
							<motion.span
								layout
								className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 ${
									room.isActive ? "translate-x-5" : "translate-x-0"
								}`}
							/>
						</button>
						<span className="text-sm font-medium text-gray-400">
							{room.isActive ? "Active" : "Inactive"}
						</span>
					</label>
				</Tooltip>
				
				<div className="flex items-center gap-1">
					{room.isActive && room.streamUrl && (
						<Tooltip content="Preview stream">
							<Link href={`/rooms/${room.id}`}>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="p-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
								>
									<Eye className="h-4 w-4" />
								</motion.button>
							</Link>
						</Tooltip>
					)}
					<Tooltip content="Edit room">
						<motion.button 
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => onEdit(room)}
							className="p-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
						>
							<Edit2 className="h-4 w-4" />
						</motion.button>
					</Tooltip>
				</div>
			</div>
		</motion.div>
	);
}
