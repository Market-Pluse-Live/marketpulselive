import { whopsdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";

// Your app developer company ID (for admin access)
const APP_DEVELOPER_COMPANY = "biz_VlcyoPPLQClcwJ";

// PRO product IDs - businesses pay for these to unlock all features
// Legacy $99.99 plan (existing subscribers)
const LEGACY_PRO_PRODUCT_ID = "prod_wQqWrjERBaVub";
// New $49.99 plan (new subscribers)
const PRO_PRODUCT_ID = "prod_scecGkLgexWGg";

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
		
		// Get user info
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);
		
		// 1. Check access to PRO products directly (new $49.99 OR legacy $99.99)
		const [newProductAccess, legacyProductAccess] = await Promise.all([
			whopsdk.users.checkAccess(PRO_PRODUCT_ID, { id: userId }),
			whopsdk.users.checkAccess(LEGACY_PRO_PRODUCT_ID, { id: userId }),
		]);
		
		if (newProductAccess.has_access || legacyProductAccess.has_access) {
			isPro = true;
		} else {
			// 2. Check access to experience - if "customer", they have a paid membership
			// This catches cases where the business owner paid for the app
			const expAccess = await whopsdk.users.checkAccess(experienceId, { id: userId });
			
			if (expAccess.has_access && expAccess.access_level === "customer") {
				isPro = true;
			}
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
