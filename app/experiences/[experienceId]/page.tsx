import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";

// Your allowed company ID (for admin access)
const ALLOWED_COMPANY_IDS = ["biz_VlcyoPPLQClcwJ"];

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	
	// Get company ID from experience and check user's membership
	let isAllowedCompany = false;
	let isPro = false;
	
	try {
		// Get experience details
		const experience = await whopsdk.experiences.retrieve(experienceId);
		const company = experience.company?.id;
		isAllowedCompany = company ? ALLOWED_COMPANY_IDS.includes(company) : false;
		
		// Check if user has access to this experience
		try {
			const { userId } = await whopsdk.verifyUserToken(await headers());
			const access = await whopsdk.users.checkAccess(experienceId, { id: userId });
			
			// PRO access for:
			// - "customer" = user paid individually OR is member of a community that paid
			// - "admin" = team member/owner of the business
			// Both get PRO because the business (Selfish Trader) paid for the app
			if (access.has_access) {
				isPro = true;
			}
		} catch (authError) {
			// User not authenticated - they're on free tier (app store visitor)
			console.log("User not authenticated:", authError);
		}
	} catch (error) {
		console.error("Error fetching experience:", error);
	}

	return (
		<RoleGate>
			<ViewerDashboard companyId="dev-company" isAllowedCompany={isAllowedCompany} isPro={isPro} />
		</RoleGate>
	);
}
