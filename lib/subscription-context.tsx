"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// Free tier limits
const FREE_STREAM_LIMIT = 5; // First 5 streams are free (indices 0-4)
const TOTAL_STREAMS = 8; // Total screens available
const FREE_WATCH_TIME_SECONDS = 15 * 60; // 15 minutes

interface SubscriptionContextType {
	isPro: boolean;
	watchTimeSeconds: number;
	watchTimeExpired: boolean;
	isStreamLocked: (index: number) => boolean;
	startWatching: () => void;
	stopWatching: () => void;
	showUpgradeModal: boolean;
	setShowUpgradeModal: (show: boolean) => void;
	upgradeReason: "locked_stream" | "time_expired" | null;
	setUpgradeReason: (reason: "locked_stream" | "time_expired" | null) => void;
	remainingTime: number; // Remaining seconds
	formatRemainingTime: () => string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
	children: ReactNode;
	isPro?: boolean;
}

export function SubscriptionProvider({ children, isPro = false }: SubscriptionProviderProps) {
	const [watchTimeSeconds, setWatchTimeSeconds] = useState(0);
	const [isWatching, setIsWatching] = useState(false);
	const [showUpgradeModal, setShowUpgradeModal] = useState(false);
	const [upgradeReason, setUpgradeReason] = useState<"locked_stream" | "time_expired" | null>(null);

	// Load watch time from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem("mpl-watch-time");
		if (saved) {
			const { time, date } = JSON.parse(saved);
			// Reset if it's a new day
			const today = new Date().toDateString();
			if (date === today) {
				setWatchTimeSeconds(time);
			} else {
				localStorage.removeItem("mpl-watch-time");
			}
		}
	}, []);

	// Save watch time to localStorage
	useEffect(() => {
		if (watchTimeSeconds > 0) {
			localStorage.setItem("mpl-watch-time", JSON.stringify({
				time: watchTimeSeconds,
				date: new Date().toDateString()
			}));
		}
	}, [watchTimeSeconds]);

	// Track watch time when watching
	useEffect(() => {
		if (!isWatching || isPro) return;

		const interval = setInterval(() => {
			setWatchTimeSeconds(prev => {
				const newTime = prev + 1;
				// Check if time expired
				if (newTime >= FREE_WATCH_TIME_SECONDS) {
					setUpgradeReason("time_expired");
					setShowUpgradeModal(true);
					setIsWatching(false);
				}
				return newTime;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isWatching, isPro]);

	const watchTimeExpired = !isPro && watchTimeSeconds >= FREE_WATCH_TIME_SECONDS;

	const isStreamLocked = useCallback((index: number): boolean => {
		if (isPro) return false;
		// Free users get first 5 streams (indices 0-4), streams 5-7 are locked
		return index >= FREE_STREAM_LIMIT;
	}, [isPro]);

	const startWatching = useCallback(() => {
		if (!watchTimeExpired) {
			setIsWatching(true);
		}
	}, [watchTimeExpired]);

	const stopWatching = useCallback(() => {
		setIsWatching(false);
	}, []);

	const remainingTime = Math.max(0, FREE_WATCH_TIME_SECONDS - watchTimeSeconds);

	const formatRemainingTime = useCallback(() => {
		const minutes = Math.floor(remainingTime / 60);
		const seconds = remainingTime % 60;
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	}, [remainingTime]);

	return (
		<SubscriptionContext.Provider value={{
			isPro,
			watchTimeSeconds,
			watchTimeExpired,
			isStreamLocked,
			startWatching,
			stopWatching,
			showUpgradeModal,
			setShowUpgradeModal,
			upgradeReason,
			setUpgradeReason,
			remainingTime,
			formatRemainingTime
		}}>
			{children}
		</SubscriptionContext.Provider>
	);
}

export function useSubscription() {
	const context = useContext(SubscriptionContext);
	if (context === undefined) {
		throw new Error("useSubscription must be used within a SubscriptionProvider");
	}
	return context;
}
