import { whopsdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";

// Your app developer company ID (for admin access)
const APP_DEVELOPER_COMPANY = "biz_VlcyoPPLQClcwJ";

// PRO product ID - businesses pay for this to unlock all features
const PRO_PRODUCT_ID = "prod_wQqWrjERBaVub";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	
	// DEFAULT: Everyone starts on FREE tier
	let isPro = false;
	let isAllowedCompany = false;
	let debugInfo = "";
	
	try {
		// Get the experience to check company
		const experience = await whopsdk.experiences.retrieve(experienceId);
		isAllowedCompany = experience.company?.id === APP_DEVELOPER_COMPANY;
		const companyId = experience.company?.id || "unknown";
		
		// Check if experience has access_pass_ids (products attached)
		const accessPassIds = (experience as { access_pass_ids?: string[] }).access_pass_ids || [];
		debugInfo += `Company: ${companyId}, Products: ${accessPassIds.join(",")}`;
		
		// If the experience has the PRO product attached, business has paid
		if (accessPassIds.includes(PRO_PRODUCT_ID)) {
			isPro = true;
			debugInfo += " | PRO via product attachment";
		} else {
			// Fallback: Check user's direct access to PRO product
			const headersList = await headers();
			const { userId } = await whopsdk.verifyUserToken(headersList);
			const productAccess = await whopsdk.users.checkAccess(PRO_PRODUCT_ID, { id: userId });
			debugInfo += ` | User ${userId}: access=${productAccess.has_access}, level=${productAccess.access_level}`;
			
			if (productAccess.has_access) {
				isPro = true;
				debugInfo += " | PRO via user access";
			}
		}
	} catch (error) {
		// If any error, stay on FREE tier (safe default)
		isPro = false;
		debugInfo = `Error: ${error instanceof Error ? error.message : "Unknown"}`;
	}

	// Log debug info server-side
	console.log(`[PRO Check] experienceId=${experienceId}, isPro=${isPro}, ${debugInfo}`);

	return (
		<RoleGate>
			<ViewerDashboard 
				companyId="dev-company" 
				isAllowedCompany={isAllowedCompany} 
				isPro={isPro} 
				debugInfo={debugInfo}
			/>
		</RoleGate>
	);
}
