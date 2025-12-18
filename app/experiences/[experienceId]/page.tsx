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
		
		debugInfo += `Co:${companyId}`;
		
		// Get user info
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);
		debugInfo += ` U:${userId}`;
		
		// 1. Check access to PRO product
		const productAccess = await whopsdk.users.checkAccess(PRO_PRODUCT_ID, { id: userId });
		debugInfo += ` | Prod:${productAccess.has_access}/${productAccess.access_level}`;
		
		if (productAccess.has_access) {
			isPro = true;
		} else {
			// 2. Check access to experience - if "customer", they have a paid membership
			const expAccess = await whopsdk.users.checkAccess(experienceId, { id: userId });
			debugInfo += ` | Exp:${expAccess.has_access}/${expAccess.access_level}`;
			
			// If they're a paying customer of the experience, give PRO
			if (expAccess.has_access && expAccess.access_level === "customer") {
				isPro = true;
			}
		}
		
		debugInfo += ` | isPro:${isPro}`;
	} catch (error) {
		// If any error, stay on FREE tier (safe default)
		isPro = false;
		debugInfo = `Error: ${error instanceof Error ? error.message : "Unknown"}`;
	}

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
