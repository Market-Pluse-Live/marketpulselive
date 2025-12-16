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
		
		// Check if user's business has PAID for the app
		try {
			const { userId } = await whopsdk.verifyUserToken(await headers());
			const access = await whopsdk.users.checkAccess(experienceId, { id: userId });
			
			// ONLY "customer" access_level means PAID membership:
			// - "customer" = User is member of a business that PAID → PRO ✅
			// - "admin" = App developer or team member (NOT paid) → FREE ❌
			// - no access = New user, hasn't paid → FREE ❌
			if (access.has_access && access.access_level === "customer") {
				isPro = true;
			}
		} catch (authError) {
			// No authentication or error → FREE tier
			console.log("No paid access:", authError);
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
