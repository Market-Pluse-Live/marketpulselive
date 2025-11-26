# Step-by-Step Webhook Setup Guide

Follow these steps in order to set up your Whop webhook.

## Prerequisites Checklist
- [ ] Next.js app is set up
- [ ] Environment variables are configured (`.env.local` has `NEXT_PUBLIC_WHOP_APP_ID` and `WHOP_API_KEY`)
- [ ] ngrok is installed (`npm install -g ngrok`)

---

## Step 1: Start Your Next.js App

1. Open a terminal/PowerShell window
2. Navigate to your project folder:
   ```bash
   cd C:\Users\USER\livestream
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Wait until you see:
   ```
   ▲ Next.js 16.0.0
   - Local:        http://localhost:3000
   ```
5. **Keep this terminal window open** - your app needs to keep running

✅ **Checkpoint:** Your app should be accessible at `http://localhost:3000`

---

## Step 2: Start ngrok

1. **Open a NEW terminal/PowerShell window** (keep the first one running)
2. Run ngrok:
   ```bash
   ngrok http 3000
   ```
3. You'll see output like this:
   ```
   ngrok

   Session Status                online
   Account                       (Plan: Free)
   Version                       3.x.x
   Region                        United States (us)
   Web Interface                 http://127.0.0.1:4040
   Forwarding                    https://abc123-def456.ngrok-free.app -> http://localhost:3000
   ```
4. **Copy the `https://` URL** from the "Forwarding" line
   - Example: `https://abc123-def456.ngrok-free.app`
   - **Keep this terminal window open** - ngrok needs to keep running

✅ **Checkpoint:** You should have a URL like `https://something.ngrok-free.app`

---

## Step 3: Build Your Webhook Endpoint URL

1. Take your ngrok URL from Step 2
2. Add `/api/webhooks` to the end
3. **Full URL example:**
   ```
   https://abc123-def456.ngrok-free.app/api/webhooks
   ```

✅ **Checkpoint:** Your complete webhook URL should look like:
`https://[your-ngrok-url]/api/webhooks`

---

## Step 4: Create Webhook in Whop Dashboard

1. Go to [Whop Developer Dashboard](https://whop.com/dashboard/developer/)
2. Navigate to your app (or create one if you haven't)
3. Go to the **"Webhooks"** section
4. Click **"Create Webhook"** button
5. Fill in the form:
   - **Endpoint URL:** Paste your full URL from Step 3
     - Example: `https://abc123-def456.ngrok-free.app/api/webhooks`
     - ⚠️ **Must be the full URL with `https://`**
   - **API version:** Select **"V1"** from the dropdown
   - **Events:** 
     - Either check **"All"** (to receive all events)
     - Or select specific events you need (e.g., `payment.succeeded`, `membership_activated`)
6. Click **"Save"** button

✅ **Checkpoint:** The webhook should be created without errors

---

## Step 5: Copy the Webhook Secret

1. After saving the webhook, you'll see a **webhook secret** or **webhook key**
2. It will look something like: `whsec_xxxxxxxxxxxxx` or just a long string
3. **Copy this secret** - you'll need it in the next step

✅ **Checkpoint:** You should have copied the webhook secret

---

## Step 6: Add Webhook Secret to Environment Variables

1. Open your `.env.local` file in your project
2. Find the line that says:
   ```
   WHOP_WEBHOOK_SECRET=
   ```
3. Paste your webhook secret after the `=` sign:
   ```
   WHOP_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
4. Save the file

✅ **Checkpoint:** Your `.env.local` should have all three variables:
- `NEXT_PUBLIC_WHOP_APP_ID=app_xxxxx`
- `WHOP_API_KEY=apik_xxxxx`
- `WHOP_WEBHOOK_SECRET=whsec_xxxxx`

---

## Step 7: Restart Your Next.js App

1. Go back to the terminal where your app is running
2. Press `Ctrl + C` to stop the server
3. Start it again:
   ```bash
   pnpm dev
   ```
4. This loads the new `WHOP_WEBHOOK_SECRET` from `.env.local`

✅ **Checkpoint:** Your app should restart successfully

---

## Step 8: Test Your Webhook

1. **Keep both terminals open:**
   - Terminal 1: Next.js app running (`pnpm dev`)
   - Terminal 2: ngrok running (`ngrok http 3000`)

2. **Trigger a test event** (if possible in Whop dashboard):
   - Create a test payment
   - Or wait for a real event to occur

3. **Check your Next.js terminal** - you should see logs like:
   ```
   [PAYMENT SUCCEEDED] { ... payment data ... }
   ```

4. **Optional:** Check ngrok dashboard at `http://127.0.0.1:4040` to see incoming requests

✅ **Checkpoint:** Webhook events should be received and logged

---

## Troubleshooting

### Problem: "Invalid url" error in Whop dashboard
**Solution:** Make sure you're using the FULL URL:
- ✅ Correct: `https://abc123.ngrok-free.app/api/webhooks`
- ❌ Wrong: `/api/webhooks`
- ❌ Wrong: `abc123.ngrok-free.app/api/webhooks`

### Problem: ngrok URL not working
**Solution:** 
- Make sure ngrok is still running
- Make sure your Next.js app is running on port 3000
- Try restarting ngrok

### Problem: Webhook not receiving events
**Solution:**
- Check that both terminals are still running
- Verify the webhook URL in Whop dashboard matches your ngrok URL
- Check the ngrok dashboard at `http://127.0.0.1:4040` for incoming requests
- Make sure `WHOP_WEBHOOK_SECRET` is set correctly in `.env.local`

### Problem: ngrok URL keeps changing
**Solution:** 
- This is normal for free ngrok accounts
- Each time you restart ngrok, you get a new URL
- Update the webhook URL in Whop dashboard if you restart ngrok
- For production, deploy to Vercel and use your production URL

---

## Summary Checklist

- [ ] Step 1: Next.js app running on `http://localhost:3000`
- [ ] Step 2: ngrok running and URL copied
- [ ] Step 3: Full webhook URL created (`https://[ngrok-url]/api/webhooks`)
- [ ] Step 4: Webhook created in Whop dashboard with full URL
- [ ] Step 5: Webhook secret copied
- [ ] Step 6: `WHOP_WEBHOOK_SECRET` added to `.env.local`
- [ ] Step 7: Next.js app restarted
- [ ] Step 8: Webhook tested and receiving events

---

## For Production (Later)

When you're ready to deploy:

1. Deploy your app to Vercel (or another hosting service)
2. Get your production URL (e.g., `https://my-app.vercel.app`)
3. Update the webhook in Whop dashboard:
   - New URL: `https://my-app.vercel.app/api/webhooks`
4. Add environment variables to Vercel (including `WHOP_WEBHOOK_SECRET`)

---

**Need help?** Check the main `WEBHOOK_SETUP.md` file or the Whop documentation.

