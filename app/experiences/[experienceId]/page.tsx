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
	
	try {
		// Get the experience to check company
		const experience = await whopsdk.experiences.retrieve(experienceId);
		isAllowedCompany = experience.company?.id === APP_DEVELOPER_COMPANY;
		
		// Check if user has PAID for PRO product
		// This checks if the business owner paid, which gives access to all members
		const { userId } = await whopsdk.verifyUserToken(headers());
		const access = await whopsdk.users.checkAccess(PRO_PRODUCT_ID, { id: userId });
		
		// Only give PRO if they have access to the paid product
		if (access.has_access) {
			isPro = true;
		}
	} catch {
		// If any error, stay on FREE tier (safe default)
		isPro = false;
	}

	return (
		<RoleGate>
			<ViewerDashboard 
				companyId="dev-company" 
				isAllowedCompany={isAllowedCompany} 
				isPro={isPro} 
			/>
		</RoleGate>
	);
}
