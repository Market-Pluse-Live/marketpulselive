# Whop Next.js App Template

A beginner-friendly template for building Whop apps with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

> **Note:** This project uses `pnpm` as the package manager. If you don't have it installed, you can install it with `npm install -g pnpm` or use `npm install` instead.

### 2. Set Up Your Whop App

1. Go to the [Whop Developer Dashboard](https://whop.com/dashboard/developer/)
2. Create a new Whop App
3. Go to the **"Hosting"** section and configure:
   - **Base URL**: Set to the domain you'll deploy on (for local dev, you can use `http://localhost:3000`)
   - **App path**: `/experiences/[experienceId]`
   - **Dashboard path**: `/dashboard/[companyId]`
   - **Discover path**: `/discover`

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your values from the Whop Developer Dashboard:
   - **NEXT_PUBLIC_WHOP_APP_ID**: Found in your app's settings page
   - **WHOP_API_KEY**: Found under "API Keys" in your app settings
   - **WHOP_WEBHOOK_SECRET**: Found under "Webhooks" in your app settings

> ⚠️ **Important:** Never commit `.env.local` to git! It contains your secret keys.

### 4. Add Your App to a Whop

1. Go to a Whop (product) created in the same organization as your app
2. Navigate to the **"Tools"** section
3. Click **"Add App"** and select your app

### 5. Run the Development Server

```bash
pnpm dev
```

When the server starts:
1. Look for a translucent settings icon in the top right corner of the window
2. Click it and select **"localhost"**
3. The default port `3000` should work

Your app should now be running! 🎉

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (webhooks, etc.)
│   ├── dashboard/         # Dashboard pages for companies
│   ├── experiences/       # Experience pages
│   ├── discover/          # Discover page
│   └── layout.tsx         # Root layout with WhopApp wrapper
├── lib/
│   └── whop-sdk.ts        # Whop SDK configuration
├── .env.example           # Environment variables template
└── .env.local             # Your actual environment variables (not in git)
```

## 🔐 Authentication

Authentication is already set up! The `WhopApp` component in `app/layout.tsx` handles user authentication automatically. In your pages, you can verify users with:

```typescript
import { whopsdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";

const { userId } = await whopsdk.verifyUserToken(await headers());
```

## 🚢 Deploying

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/new) and import your repository
3. Add your environment variables from `.env.local` in Vercel's project settings
4. Deploy!

### Update Whop Dashboard

After deploying, update your Whop app settings:
- Update the **Base URL** to your production domain
- Update **Webhook callback URLs** if needed

## 🐛 Troubleshooting

**App not loading properly?**
- Make sure the "App path" in your Whop developer dashboard is explicitly set to `/experiences/[experienceId]` (the placeholder text doesn't count!)
- Verify all environment variables in `.env.local` are correct

**Authentication issues?**
- Double-check your `NEXT_PUBLIC_WHOP_APP_ID` and `WHOP_API_KEY` are correct
- Make sure your app is added to the Whop you're testing with

**Can't connect to localhost?**
- Make sure you've selected "localhost" in the settings icon (top right)
- Try a different port if 3000 is already in use

## 📚 Learn More

- [Whop Developer Docs](https://dev.whop.com/introduction)
- [Whop SDK Documentation](https://docs.whop.com)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎯 Next Steps

1. Customize the pages in `app/` to build your app
2. Use the Whop SDK to fetch user data, check access, and more
3. Set up webhooks in `app/api/webhooks/route.ts` to handle events
4. Style your app with Tailwind CSS (already configured!)

Happy building! 🚀
