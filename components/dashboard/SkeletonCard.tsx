"use client";

import { motion } from "framer-motion";

export function SkeletonCard({ index = 0 }: { index?: number }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05, duration: 0.3 }}
			className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5"
		>
			{/* Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-gray-800 animate-pulse" />
					<div className="space-y-2">
						<div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
						<div className="h-3 w-16 bg-gray-800 rounded animate-pulse" />
					</div>
				</div>
				<div className="h-6 w-16 bg-gray-800 rounded-full animate-pulse" />
			</div>

			{/* Thumbnail */}
			<div className="aspect-video rounded-xl bg-gray-800 mb-4 animate-pulse overflow-hidden relative">
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/50 to-transparent shimmer" />
			</div>

			{/* Metrics */}
			<div className="flex gap-4 mb-4">
				<div className="h-8 flex-1 bg-gray-800 rounded-lg animate-pulse" />
				<div className="h-8 flex-1 bg-gray-800 rounded-lg animate-pulse" />
				<div className="h-8 flex-1 bg-gray-800 rounded-lg animate-pulse" />
			</div>

			{/* URL */}
			<div className="p-3 rounded-lg bg-gray-800/50 mb-4">
				<div className="h-3 w-16 bg-gray-700 rounded mb-2 animate-pulse" />
				<div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between pt-3 border-t border-gray-800">
				<div className="flex items-center gap-2">
					<div className="w-9 h-5 bg-gray-800 rounded-full animate-pulse" />
					<div className="h-4 w-12 bg-gray-800 rounded animate-pulse" />
				</div>
				<div className="flex gap-2">
					<div className="w-8 h-8 bg-gray-800 rounded-lg animate-pulse" />
					<div className="w-8 h-8 bg-gray-800 rounded-lg animate-pulse" />
				</div>
			</div>
		</motion.div>
	);
}

export function SkeletonStats() {
	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
			{[...Array(6)].map((_, i) => (
				<motion.div
					key={i}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: i * 0.05 }}
					className="rounded-xl border border-gray-800 bg-gray-900/40 p-4"
				>
					<div className="flex items-center justify-between">
						<div className="space-y-2">
							<div className="h-3 w-16 bg-gray-800 rounded animate-pulse" />
							<div className="h-7 w-10 bg-gray-800 rounded animate-pulse" />
						</div>
						<div className="w-10 h-10 bg-gray-800 rounded-lg animate-pulse" />
					</div>
				</motion.div>
			))}
		</div>
	);
}

