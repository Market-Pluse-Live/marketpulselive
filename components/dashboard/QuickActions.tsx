"use client";

import { motion } from "framer-motion";
import { Search, Plus, LayoutGrid, List, Filter, Radio, CheckCircle, Pause, SlidersHorizontal } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface QuickActionsProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	filter: string;
	onFilterChange: (filter: string) => void;
	viewMode: "grid" | "list";
	onViewModeChange: (mode: "grid" | "list") => void;
	onCreateRoom?: () => void;
}

export function QuickActions({
	searchQuery,
	onSearchChange,
	filter,
	onFilterChange,
	viewMode,
	onViewModeChange,
	onCreateRoom,
}: QuickActionsProps) {
	const filters = [
		{ id: "all", label: "All", icon: null },
		{ id: "live", label: "Live", icon: Radio },
		{ id: "active", label: "Active", icon: CheckCircle },
		{ id: "configured", label: "Ready", icon: Pause },
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
			className="flex flex-col lg:flex-row gap-3 mb-6"
		>
			{/* Search */}
			<div className="relative flex-1 max-w-md">
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Search rooms by name or URL..."
					className="w-full h-11 rounded-xl border border-gray-700 bg-gray-800/50 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
				/>
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				{/* Filters */}
				<div className="flex items-center rounded-xl border border-gray-700 bg-gray-800/50 p-1">
					{filters.map((f) => (
						<Tooltip key={f.id} content={`Show ${f.label.toLowerCase()} rooms`}>
							<button
								onClick={() => onFilterChange(f.id)}
								className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
									filter === f.id
										? "bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/10"
										: "text-gray-400 hover:text-white hover:bg-gray-700/50"
								}`}
							>
								{f.icon && <f.icon className="h-3 w-3" />}
								{f.label}
							</button>
						</Tooltip>
					))}
				</div>

				{/* View Toggle */}
				<div className="flex items-center rounded-xl border border-gray-700 bg-gray-800/50 p-1">
					<Tooltip content="Grid view">
						<button
							onClick={() => onViewModeChange("grid")}
							className={`p-2 rounded-lg transition-all duration-200 ${
								viewMode === "grid"
									? "bg-gray-700 text-white"
									: "text-gray-500 hover:text-white"
							}`}
						>
							<LayoutGrid className="h-4 w-4" />
						</button>
					</Tooltip>
					<Tooltip content="List view">
						<button
							onClick={() => onViewModeChange("list")}
							className={`p-2 rounded-lg transition-all duration-200 ${
								viewMode === "list"
									? "bg-gray-700 text-white"
									: "text-gray-500 hover:text-white"
							}`}
						>
							<List className="h-4 w-4" />
						</button>
					</Tooltip>
				</div>

				{/* More Filters Button */}
				<Tooltip content="Advanced filters">
					<button className="p-2.5 rounded-xl border border-gray-700 bg-gray-800/50 text-gray-400 hover:text-white hover:border-gray-600 transition-all duration-200">
						<SlidersHorizontal className="h-4 w-4" />
					</button>
				</Tooltip>

				{/* Create Room */}
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={onCreateRoom}
					className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200"
				>
					<Plus className="h-4 w-4" />
					<span>New Room</span>
				</motion.button>
			</div>
		</motion.div>
	);
}

