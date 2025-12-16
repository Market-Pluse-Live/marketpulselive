<!-- 406d323e-c7f6-4d19-a7ba-9dca15393730 06dc5b6e-194d-437f-8189-ce81b3217872 -->
# Fix PRO Access Detection

## Problem

The current code uses `whopsdk.users.checkAccess()` which checks experience/company access, but this doesn't properly detect if a user has paid for the PRO product subscription.

## Solution

Use Whop's `access.checkIfUserHasAccessToAccessPass()` method which specifically checks if a user has a valid membership to a product.

## Code Change

Update [app/experiences/[experienceId]/page.tsx](app/experiences/[experienceId]/page.tsx):

```typescript
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard";
import { RoleGate } from "@/components/auth/RoleGate";

// Your app developer company ID (for admin testing)
const APP_DEVELOPER_COMPANY = "biz_VlcyoPPLQClcwJ";

// Your PRO product ID - users who paid have access to this
const PRO_PRODUCT_ID = "prod_wQqWrjERBaVub";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  
  let isAllowedCompany = false;
  let isPro = false;
  
  try {
    // Get experience details
    const experience = await whopsdk.experiences.retrieve(experienceId);
    const company = experience.company?.id;
    isAllowedCompany = company === APP_DEVELOPER_COMPANY;
    
    // Check if user has PAID for PRO product
    try {
      const { userId } = await whopsdk.verifyUserToken(await headers());
      
      // Use the correct method to check product access
      const proAccess = await whopsdk.access.checkIfUserHasAccessToAccessPass({
        accessPassId: PRO_PRODUCT_ID,
        userId: userId,
      });
      
      // If user has access to PRO product = they PAID
      if (proAccess.hasAccess) {
        isPro = true;
      }
      
      // App developer sees FREE for testing
      if (isAllowedCompany) {
        isPro = false;
      }
    } catch (authError) {
      console.log("Auth error:", authError);
    }
  } catch (error) {
    console.error("Error:", error);
  }

  return (
    <RoleGate>
      <ViewerDashboard companyId="dev-company" isAllowedCompany={isAllowedCompany} isPro={isPro} />
    </RoleGate>
  );
}
```

## Key Differences

1. Changed from `whopsdk.users.checkAccess()` to `whopsdk.access.checkIfUserHasAccessToAccessPass()`
2. This method takes `accessPassId` (the product ID) and `userId`
3. Returns `hasAccess: boolean` which directly tells us if the user paid

## After Implementation

1. Push to GitHub
2. Redeploy on Netlify
3. Test with Selfish Trader - should now see PRO access

### To-dos

- [ ] Remove unused useParams and useSearchParams imports from ViewerHeader
- [ ] Remove bizId, ALLOWED_BIZ_ID, and isAllowedBiz variables
- [ ] Change Live badge to always-clickable button with handleLiveClick
- [ ] Remove isAllowedBiz check from the useEffect that shows the modal
- [ ] Commit, push, and test in Whop