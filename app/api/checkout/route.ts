import { NextResponse } from "next/server";

// PRO plan checkout URL from Whop
const PRO_CHECKOUT_URL = "https://whop.com/checkout/plan_9WUne7K0sSQjW";

export async function POST() {
	return NextResponse.json({
		purchaseUrl: PRO_CHECKOUT_URL,
	});
}
