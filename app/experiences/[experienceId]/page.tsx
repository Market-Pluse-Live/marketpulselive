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
	
	// Get company ID from experience and check user's access level
	let isAllowedCompany = false;
	let isPro = false;
	
	try {
		// Get experience details
		const experience = await whopsdk.experiences.retrieve(experienceId);
		const company = experience.company?.id;
		isAllowedCompany = company ? ALLOWED_COMPANY_IDS.includes(company) : false;
		
		// Check user's access level to determine if they're a PRO member
		try {
			const { userId } = await whopsdk.verifyUserToken(await headers());
			const access = await whopsdk.users.checkAccess(experienceId, { id: userId });
			
			// User is PRO if they have "customer" (paid membership) or "admin" access
			if (access.has_access && (access.access_level === "customer" || access.access_level === "admin")) {
				isPro = true;
			}
		} catch (authError) {
			// User not authenticated or no access - they're on free tier
			console.log("User access check:", authError);
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
