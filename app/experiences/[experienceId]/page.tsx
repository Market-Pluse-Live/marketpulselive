"use client";

import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";

// Experience page - this is what Whop users see when they open the app
// Shows the viewer dashboard directly - no need to click anything
export default function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	// Use dev-company as the companyId for now
	// In production, you might want to map experienceId to a companyId
	return (
		<RoleGate>
			<ViewerDashboard companyId="dev-company" />
		</RoleGate>
	);
}
