"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function HomePage() {
	const router = useRouter();
	const { theme } = useTheme();
	const isDark = theme === "dark";

	// Redirect to dashboard immediately - the role selection will be shown there
	useEffect(() => {
		router.replace("/dashboard/dev-company");
	}, [router]);

	return (
		<div className={`min-h-screen flex items-center justify-center ${
			isDark ? "bg-gray-950" : "bg-gray-50"
		}`}>
			<div className="text-center">
				<Loader2 className={`h-8 w-8 animate-spin mx-auto mb-4 ${
					isDark ? "text-purple-400" : "text-purple-600"
				}`} />
				<p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
					Loading Market Pulse Live...
				</p>
			</div>
		</div>
	);
}
