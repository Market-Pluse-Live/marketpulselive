"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HomePage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Redirect to dashboard immediately - preserve query params for business ID gating
	useEffect(() => {
		const params = searchParams.toString();
		const url = params ? `/dashboard/dev-company?${params}` : "/dashboard/dev-company";
		router.replace(url);
	}, [router, searchParams]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
			<div className="text-center">
				<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600 dark:text-purple-400" />
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Loading Market Pulse Live...
				</p>
			</div>
		</div>
	);
}
