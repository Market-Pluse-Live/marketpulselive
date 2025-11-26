"use client";

import { Clock, Radio, Power, Edit, Plus, PowerOff } from "lucide-react";
import type { ActivityLogEntry } from "@/lib/types";

interface ActivityLogProps {
	entries: ActivityLogEntry[];
}

const actionConfig: Record<ActivityLogEntry["action"], { 
	icon: React.ReactNode; 
	color: string;
	label: string;
}> = {
	created: { icon: <Plus className="h-3 w-3" />, color: "text-blue-400", label: "Created" },
	updated: { icon: <Edit className="h-3 w-3" />, color: "text-amber-400", label: "Updated" },
	activated: { icon: <Power className="h-3 w-3" />, color: "text-emerald-400", label: "Activated" },
	deactivated: { icon: <PowerOff className="h-3 w-3" />, color: "text-gray-400", label: "Deactivated" },
	started_stream: { icon: <Radio className="h-3 w-3" />, color: "text-emerald-400", label: "Started" },
	stopped_stream: { icon: <Radio className="h-3 w-3" />, color: "text-red-400", label: "Stopped" },
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

export function ActivityLog({ entries }: ActivityLogProps) {
	return (
		<div className="rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden">
			<div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
				<Clock className="h-4 w-4 text-gray-400" />
				<h3 className="text-sm font-semibold text-white">Activity Log</h3>
			</div>
			<div className="divide-y divide-gray-800/50 max-h-[400px] overflow-y-auto">
				{entries.length === 0 ? (
					<div className="px-4 py-8 text-center text-gray-500 text-sm">
						No recent activity
					</div>
				) : (
					entries.map((entry) => {
						const config = actionConfig[entry.action];
						return (
							<div key={entry.id} className="px-4 py-3 hover:bg-gray-800/30 transition-colors">
								<div className="flex items-start gap-3">
									<div className={`mt-0.5 ${config.color}`}>
										{config.icon}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm text-gray-300">
											<span className="font-medium text-white">{entry.roomName}</span>
											{" "}
											<span className="text-gray-400">{config.label.toLowerCase()}</span>
										</p>
										<p className="text-xs text-gray-500 mt-0.5">{formatTimeAgo(entry.timestamp)}</p>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}

