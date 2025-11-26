"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useNotification, Notification, NotificationType } from "@/lib/notification-context";

const iconMap: Record<NotificationType, React.ReactNode> = {
	success: <CheckCircle className="h-5 w-5" />,
	error: <XCircle className="h-5 w-5" />,
	warning: <AlertTriangle className="h-5 w-5" />,
	info: <Info className="h-5 w-5" />,
};

const colorMap: Record<NotificationType, { bg: string; border: string; text: string; icon: string }> = {
	success: {
		bg: "bg-emerald-500/10",
		border: "border-emerald-500/30",
		text: "text-emerald-300",
		icon: "text-emerald-400",
	},
	error: {
		bg: "bg-red-500/10",
		border: "border-red-500/30",
		text: "text-red-300",
		icon: "text-red-400",
	},
	warning: {
		bg: "bg-amber-500/10",
		border: "border-amber-500/30",
		text: "text-amber-300",
		icon: "text-amber-400",
	},
	info: {
		bg: "bg-blue-500/10",
		border: "border-blue-500/30",
		text: "text-blue-300",
		icon: "text-blue-400",
	},
};

function ToastItem({ notification }: { notification: Notification }) {
	const { removeNotification } = useNotification();
	const colors = colorMap[notification.type];

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: -20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, x: 100, scale: 0.95 }}
			transition={{ type: "spring", stiffness: 400, damping: 30 }}
			className={`relative overflow-hidden rounded-xl border ${colors.bg} ${colors.border} backdrop-blur-xl shadow-2xl p-4 pr-10 min-w-[320px] max-w-md`}
		>
			{/* Glow effect */}
			<div className={`absolute inset-0 ${colors.bg} blur-xl opacity-50`} />
			
			<div className="relative flex gap-3">
				<div className={`flex-shrink-0 ${colors.icon}`}>
					{iconMap[notification.type]}
				</div>
				<div className="flex-1 min-w-0">
					<p className={`text-sm font-semibold ${colors.text}`}>
						{notification.title}
					</p>
					{notification.message && (
						<p className="text-xs text-gray-400 mt-0.5">
							{notification.message}
						</p>
					)}
				</div>
			</div>

			<button
				onClick={() => removeNotification(notification.id)}
				className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
			>
				<X className="h-4 w-4" />
			</button>

			{/* Progress bar */}
			<motion.div
				className={`absolute bottom-0 left-0 h-0.5 ${colors.icon.replace("text-", "bg-")}`}
				initial={{ width: "100%" }}
				animate={{ width: "0%" }}
				transition={{ duration: (notification.duration ?? 4000) / 1000, ease: "linear" }}
			/>
		</motion.div>
	);
}

export function NotificationContainer() {
	const { notifications } = useNotification();

	return (
		<div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
			<AnimatePresence mode="popLayout">
				{notifications.map((notification) => (
					<ToastItem key={notification.id} notification={notification} />
				))}
			</AnimatePresence>
		</div>
	);
}

