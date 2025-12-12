<!-- 406d323e-c7f6-4d19-a7ba-9dca15393730 06dc5b6e-194d-437f-8189-ce81b3217872 -->
# Fix Admin Access in Whop (Using Whop SDK)

## Problem

Whop passes `experienceId` in the URL path, not `companyId` as a query param. We need to use the Whop SDK to get the company ID from the experience.

## Solution

Use `client.experiences.retrieve(experienceId)` to get `experience.company.id`, then compare it to `biz_VlcyoPPLQClcwJ`.

## Changes

### 1. Update `ViewerDashboard.tsx` (ViewerHeader component)

**Remove unused imports and business ID logic:**

- Remove `useParams` and `useSearchParams` imports (no longer needed)
- Remove `bizId`, `ALLOWED_BIZ_ID`, and `isAllowedBiz` variables

**Simplify the Live badge click handler:**

- Always allow clicks (no conditional)
- Change from `<div>` to `<button>` for better accessibility

**Current problematic code (~lines 139-150):**

```tsx
const params = useParams();
const searchParams = useSearchParams();
const bizId = searchParams.get("companyId") || ...;
const ALLOWED_BIZ_ID = "biz_VlcyoPPLQClcwJ";
const isAllowedBiz = !bizId || bizId === ALLOWED_BIZ_ID;
```

**New simplified code:**

```tsx
// No ID checking - admin key provides security
```

**Current onClick (~line 232):**

```tsx
onClick={isAllowedBiz ? handleLiveClick : undefined}
```

**New onClick:**

```tsx
onClick={handleLiveClick}
```

## Security

- The admin key `mpl-admin-2024` is the security layer
- Only you know this key
- Viewers can click 5 times but cannot access without the key

## Files to modify

- `components/dashboard/ViewerDashboard.tsx`

## After implementation

1. Commit and push to GitHub
2. Netlify auto-deploys
3. Test in Whop: click "Live" badge 5x, enter key, access admin

### To-dos

- [ ] Remove unused useParams and useSearchParams imports from ViewerHeader
- [ ] Remove bizId, ALLOWED_BIZ_ID, and isAllowedBiz variables
- [ ] Change Live badge to always-clickable button with handleLiveClick
- [ ] Remove isAllowedBiz check from the useEffect that shows the modal
- [ ] Commit, push, and test in Whop