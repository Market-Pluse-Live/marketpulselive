"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
	X, Clock, Power, Edit, Plus, PowerOff, Radio, Search, 
	Filter, Calendar, Download, ChevronDown 
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import type { ActivityLogEntry } from "@/lib/types";

interface ActivityLogModalProps {
	isOpen: boolean;
	onClose: () => void;
	entries: ActivityLogEntry[];
}

type ActionFilter = "all" | ActivityLogEntry["action"];

const actionConfig: Record<ActivityLogEntry["action"], { 
	icon: React.ElementType; 
	color: string;
	bgColor: string;
	label: string;
}> = {
	created: { 
		icon: Plus, 
		color: "text-blue-400", 
		bgColor: "bg-blue-500/20",
		label: "Created room" 
	},
	updated: { 
		icon: Edit, 
		color: "text-amber-400", 
		bgColor: "bg-amber-500/20",
		label: "Updated settings" 
	},
	activated: { 
		icon: Power, 
		color: "text-emerald-400", 
		bgColor: "bg-emerald-500/20",
		label: "Activated" 
	},
	deactivated: { 
		icon: PowerOff, 
		color: "text-gray-400", 
		bgColor: "bg-gray-500/20",
		label: "Deactivated" 
	},
	started_stream: { 
		icon: Radio, 
		color: "text-emerald-400", 
		bgColor: "bg-emerald-500/20",
		label: "Started streaming" 
	},
	stopped_stream: { 
		icon: Radio, 
		color: "text-red-400", 
		bgColor: "bg-red-500/20",
		label: "Stopped streaming" 
	},
};

const actionLabels: Record<ActionFilter, string> = {
	all: "All Actions",
	created: "Created",
	updated: "Updated",
	activated: "Activated",
	deactivated: "Deactivated",
	started_stream: "Started Stream",
	stopped_stream: "Stopped Stream",
};

function formatTimeAgo(timestamp: string): string {
	const now = new Date();
	const time = new Date(timestamp);
	const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
	
	if (diff < 60) return "Just now";
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

function formatFullDate(timestamp: string): string {
	return new Date(timestamp).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function ActivityLogModal({ isOpen, onClose, entries }: ActivityLogModalProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	
	const [searchQuery, setSearchQuery] = useState("");
	const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);

	const filteredEntries = useMemo(() => {
		return entries.filter((entry) => {
			const matchesSearch = entry.roomName.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesAction = actionFilter === "all" || entry.action === actionFilter;
			return matchesSearch && matchesAction;
		});
	}, [entries, searchQuery, actionFilter]);

	const handleExport = () => {
		const csv = [
			["Room Name", "Action", "Timestamp"],
			...filteredEntries.map((entry) => [
				entry.roomName,
				actionConfig[entry.action].label,
				formatFullDate(entry.timestamp),
			]),
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const modalBgClass = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
	const inputClass = isDark 
		? "bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500" 
		: "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-purple-500";
	const textClass = isDark ? "text-white" : "text-gray-900";
	const subtextClass = isDark ? "text-gray-400" : "text-gray-600";
	const borderClass = isDark ? "border-gray-800" : "border-gray-200";
	const hoverClass = isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50";
	const dropdownBgClass = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					onClick={onClose}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						onClick={(e) => e.stopPropagation()}
						className={`w-full max-w-3xl max-h-[85vh] rounded-2xl border ${modalBgClass} shadow-2xl shadow-black/50 overflow-hidden flex flex-col`}
					>
						{/* Header */}
						<div className={`px-6 py-5 border-b ${borderClass} flex-shrink-0`}>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 flex items-center justify-center">
										<Clock className="h-5 w-5 text-purple-400" />
									</div>
									<div>
										<h2 className={`text-lg font-bold ${textClass}`}>Activity Log</h2>
										<p className={`text-xs ${subtextClass}`}>
											{filteredEntries.length} of {entries.length} activities
										</p>
									</div>
								</div>
								<motion.button
									whileHover={{ scale: 1.1, rotate: 90 }}
									whileTap={{ scale: 0.9 }}
									onClick={onClose}
									className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"}`}
								>
									<X className="h-5 w-5" />
								</motion.button>
							</div>

							{/* Search and Filters */}
							<div className="flex flex-col sm:flex-row gap-3 mt-4">
								{/* Search */}
								<div className="relative flex-1">
									<Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${subtextClass}`} />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search by room name..."
										className={`w-full h-10 rounded-xl border pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all ${inputClass}`}
									/>
								</div>

								{/* Action Filter Dropdown */}
								<div className="relative">
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => setShowFilterDropdown(!showFilterDropdown)}
										className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${
											isDark 
												? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" 
												: "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
										}`}
									>
										<Filter className="h-4 w-4" />
										{actionLabels[actionFilter]}
										<ChevronDown className={`h-3 w-3 transition-transform ${showFilterDropdown ? "rotate-180" : ""}`} />
									</motion.button>

									<AnimatePresence>
										{showFilterDropdown && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl z-10 overflow-hidden ${dropdownBgClass}`}
											>
												{(Object.keys(actionLabels) as ActionFilter[]).map((action) => (
													<button
														key={action}
														onClick={() => {
															setActionFilter(action);
															setShowFilterDropdown(false);
														}}
														className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
															actionFilter === action 
																? "bg-purple-500/20 text-purple-400" 
																: `${textClass} ${hoverClass}`
														}`}
													>
														{actionLabels[action]}
													</button>
												))}
											</motion.div>
										)}
									</AnimatePresence>
								</div>

								{/* Export Button */}
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={handleExport}
									className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors ${
										isDark 
											? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" 
											: "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
									}`}
								>
									<Download className="h-4 w-4" />
									Export
								</motion.button>
							</div>
						</div>

						{/* Activity List */}
						<div className="flex-1 overflow-y-auto">
							{filteredEntries.length === 0 ? (
								<div className="px-6 py-16 text-center">
									<div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
										<Clock className={`h-7 w-7 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
									</div>
									<p className={`text-sm font-medium ${textClass} mb-1`}>No activities found</p>
									<p className={`text-xs ${subtextClass}`}>
										{searchQuery || actionFilter !== "all" 
											? "Try adjusting your filters" 
											: "Activity will appear here as you make changes"}
									</p>
								</div>
							) : (
								<div className={`divide-y ${isDark ? "divide-gray-800/50" : "divide-gray-100"}`}>
									{filteredEntries.map((entry, index) => {
										const config = actionConfig[entry.action];
										const Icon = config.icon;
										
										return (
											<motion.div
												key={entry.id}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.02 }}
												className={`px-6 py-4 transition-colors ${hoverClass}`}
											>
												<div className="flex items-start gap-4">
													{/* Icon */}
													<div className={`flex-shrink-0 p-2.5 rounded-xl ${config.bgColor} ${config.color}`}>
														<Icon className="h-4 w-4" />
													</div>
													
													{/* Content */}
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<span className={`text-sm font-semibold ${textClass}`}>
																{entry.roomName}
															</span>
															<span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
																{config.label}
															</span>
														</div>
														<div className="flex items-center gap-3">
															<div className={`flex items-center gap-1.5 text-xs ${subtextClass}`}>
																<Calendar className="h-3 w-3" />
																{formatFullDate(entry.timestamp)}
															</div>
															<span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>•</span>
															<span className={`text-xs ${subtextClass}`}>
																{formatTimeAgo(entry.timestamp)}
															</span>
														</div>
													</div>
												</div>
											</motion.div>
										);
									})}
								</div>
							)}
						</div>

						{/* Footer */}
						<div className={`px-6 py-4 border-t ${borderClass} flex-shrink-0`}>
							<div className="flex items-center justify-between">
								<p className={`text-xs ${subtextClass}`}>
									Showing {filteredEntries.length} activities
								</p>
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={onClose}
									className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
										isDark 
											? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									Close
								</motion.button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

