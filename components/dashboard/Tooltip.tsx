"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
	content: string;
	children: ReactNode;
	position?: "top" | "bottom" | "left" | "right";
	delay?: number;
}

export function Tooltip({ content, children, position = "top", delay = 200 }: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

	const handleMouseEnter = () => {
		const id = setTimeout(() => setIsVisible(true), delay);
		setTimeoutId(id);
	};

	const handleMouseLeave = () => {
		if (timeoutId) clearTimeout(timeoutId);
		setIsVisible(false);
	};

	const positionClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
		bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
		left: "right-full top-1/2 -translate-y-1/2 mr-2",
		right: "left-full top-1/2 -translate-y-1/2 ml-2",
	};

	const arrowClasses = {
		top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800 border-x-transparent border-b-transparent",
		bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 border-x-transparent border-t-transparent",
		left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800 border-y-transparent border-r-transparent",
		right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800 border-y-transparent border-l-transparent",
	};

	return (
		<div 
			className="relative inline-block"
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{children}
			<AnimatePresence>
				{isVisible && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
					>
						<div className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 shadow-xl text-xs text-gray-200 whitespace-nowrap">
							{content}
							<div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

