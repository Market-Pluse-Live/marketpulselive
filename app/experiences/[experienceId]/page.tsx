"use client";

import { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";
import { useRole } from "@/lib/role-context";

// Experience page - this is what Whop users see when they open the app
// Shows the viewer dashboard directly - no need to click anything
// If user becomes admin, redirect to full dashboard
export default function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { isAdmin } = useRole();
	const router = useRouter();
	const resolvedParams = useParams<{ experienceId: string }>();
	const searchParams = useSearchParams();

	// Derive company/experience id from path or query (Whop may pass either)
	const experienceId =
		resolvedParams?.experienceId ||
		searchParams.get("experienceId") ||
		searchParams.get("companyId") ||
		"dev-company";

	// Redirect to dashboard if user becomes admin
	useEffect(() => {
		if (isAdmin) {
			router.push("/dashboard/dev-company");
		}
	}, [isAdmin, router]);

	// Show viewer dashboard for non-admins
	return (
		<RoleGate>
			<ViewerDashboard companyId={experienceId} />
		</RoleGate>
	);
}
