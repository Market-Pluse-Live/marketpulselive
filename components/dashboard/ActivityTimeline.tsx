"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Power, Edit, Plus, PowerOff, Eye, Radio } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { ActivityLogModal } from "./ActivityLogModal";
import type { ActivityLogEntry } from "@/lib/types";

interface ActivityTimelineProps {
	entries: ActivityLogEntry[];
}

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

function formatTimeAgo(timestamp: string): string {
	const now = new Date();
	const time = new Date(timestamp);
	const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
	
	if (diff < 60) return "Just now";
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

export function ActivityTimeline({ entries }: ActivityTimelineProps) {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const [showLogModal, setShowLogModal] = useState(false);
	
	return (
		<>
		<ActivityLogModal 
			isOpen={showLogModal} 
			onClose={() => setShowLogModal(false)} 
			entries={entries} 
		/>
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: 0.3 }}
			className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
				isDark 
					? "border-gray-800 bg-gray-900/50" 
					: "border-gray-200 bg-white/80"
			}`}
		>
			{/* Header */}
			<div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? "border-gray-800" : "border-gray-200"}`}>
				<div className="flex items-center gap-2.5">
					<div className="p-2 rounded-lg bg-purple-500/20">
						<Clock className="h-4 w-4 text-purple-400" />
					</div>
					<div>
						<h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Activity</h3>
						<p className={`text-[10px] uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>Recent updates</p>
					</div>
				</div>
				<button 
					onClick={() => setShowLogModal(true)}
					className={`text-xs font-medium transition-colors ${isDark ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-500"}`}
				>
					View All
				</button>
			</div>

			{/* Timeline */}
			<div className="max-h-[450px] overflow-y-auto">
				{entries.length === 0 ? (
					<div className="px-5 py-12 text-center">
						<div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
							<Clock className={`h-6 w-6 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
						</div>
						<p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>No recent activity</p>
					</div>
				) : (
					<div className={`divide-y ${isDark ? "divide-gray-800/50" : "divide-gray-100"}`}>
						{entries.map((entry, index) => {
							const config = actionConfig[entry.action];
							const Icon = config.icon;
							
							return (
								<motion.div
									key={entry.id}
									initial={{ opacity: 0, x: 10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.05 }}
									className={`px-5 py-4 transition-colors group cursor-default ${
										isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-50"
									}`}
								>
									<div className="flex items-start gap-3">
										{/* Icon */}
										<div className={`flex-shrink-0 p-2 rounded-lg ${config.bgColor} ${config.color}`}>
											<Icon className="h-3.5 w-3.5" />
										</div>
										
										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-0.5">
												<span className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
													{entry.roomName}
												</span>
											</div>
											<p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
												{config.label}
											</p>
											<p className={`text-[10px] mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
												{formatTimeAgo(entry.timestamp)}
											</p>
										</div>

										{/* Action button */}
										<button className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${
											isDark 
												? "hover:bg-gray-700 text-gray-500 hover:text-white"
												: "hover:bg-gray-200 text-gray-400 hover:text-gray-700"
										}`}>
											<Eye className="h-3.5 w-3.5" />
										</button>
									</div>
								</motion.div>
							);
						})}
					</div>
				)}
			</div>
		</motion.div>
		</>
	);
}
