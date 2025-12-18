import { whopsdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";

// Your app developer company ID (for admin access)
const APP_DEVELOPER_COMPANY = "biz_VlcyoPPLQClcwJ";

// PRO product ID - businesses pay for this to unlock all features
const PRO_PRODUCT_ID = "prod_wQqWrjERBaVub";

// PRO plan ID - the checkout plan
const PRO_PLAN_ID = "plan_9WUne7K0sSQjW";

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
		
		debugInfo += `Company: ${companyId}`;
		
		// Get user info
		const headersList = await headers();
		const { userId } = await whopsdk.verifyUserToken(headersList);
		
		// Try multiple checks to find PRO access:
		
		// 1. Check access to PRO product
		const productAccess = await whopsdk.users.checkAccess(PRO_PRODUCT_ID, { id: userId });
		debugInfo += ` | Product: ${productAccess.has_access}/${productAccess.access_level}`;
		
		if (productAccess.has_access) {
			isPro = true;
			debugInfo += " | PRO!";
		} else {
			// 2. Check access to PRO plan
			const planAccess = await whopsdk.users.checkAccess(PRO_PLAN_ID, { id: userId });
			debugInfo += ` | Plan: ${planAccess.has_access}/${planAccess.access_level}`;
			
			if (planAccess.has_access) {
				isPro = true;
				debugInfo += " | PRO via plan!";
			} else {
				// 3. Check access to experience - if "customer", they might have paid
				const expAccess = await whopsdk.users.checkAccess(experienceId, { id: userId });
				debugInfo += ` | Exp: ${expAccess.has_access}/${expAccess.access_level}`;
				
				// If they're a paying customer of the experience, give PRO
				if (expAccess.has_access && expAccess.access_level === "customer") {
					isPro = true;
					debugInfo += " | PRO via exp customer!";
				}
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
