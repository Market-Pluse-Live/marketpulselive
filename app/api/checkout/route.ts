import { NextResponse } from "next/server";

// PRO plan checkout URL from Whop ($49.99 plan)
const PRO_CHECKOUT_URL = "https://whop.com/checkout/plan_sEv2Wt3XVel6T";

export async function POST() {
	return NextResponse.json({
		purchaseUrl: PRO_CHECKOUT_URL,
	});
}
