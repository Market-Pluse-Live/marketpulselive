# Webhook Setup Guide

## Your Webhook Endpoint URL

Your webhook endpoint is: **`5https://abc123.ngrok.io/api/webhooks`**

This means:
- **Local development**: `https://[ngrok-url]/api/webhooks`
- **Production**: `https://[your-domain]/api/webhooks`

## Setting Up Webhooks for Local Development

### Option 1: Using ngrok (Recommended)

1. **Install ngrok:**
   - Download from [ngrok.com](https://ngrok.com/download)
   - Or use npm: `npm install -g ngrok`

2. **Start your Next.js app:**
   ```bash
   pnpm dev
   ```
   Your app will run on `http://localhost:3000`

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL:**
   - You'll see something like: `https://abc123.ngrok.io`
   - Your webhook endpoint will be: `https://abc123.ngrok.io/api/webhooks`

5. **In the Whop Dashboard:**
   - Paste: `https://abc123.ngrok.io/api/webhooks` in the "Endpoint URL" field
   - Select API version: **V1**
   - Select the events you want (or check "All")
   - Click "Save"

6. **Copy the webhook secret:**
   - After saving, you'll see a webhook secret
   - Add it to your `.env.local` file as `WHOP_WEBHOOK_SECRET`

### Option 2: Using Cloudflare Tunnel

1. **Install cloudflared:**
   ```bash
   # Windows (using winget)
   winget install --id Cloudflare.cloudflared
   ```

2. **Start your Next.js app:**
   ```bash
   pnpm dev
   ```

3. **In a new terminal, create a tunnel:**
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

4. **Use the provided URL** (similar to ngrok)

## For Production

Once you deploy to Vercel (or another hosting service):

1. **Get your production URL:**
   - Example: `https://my-app.vercel.app`

2. **In the Whop Dashboard:**
   - Use: `https://my-app.vercel.app/api/webhooks`
   - Select API version: **V1**
   - Select events
   - Save and copy the webhook secret

3. **Add the webhook secret to your production environment variables**

## Important Notes

- ✅ The endpoint URL must be publicly accessible (not localhost)
- ✅ The endpoint must accept POST requests
- ✅ The endpoint must return a 2xx status code quickly
- ✅ Use API version **V1** (not V2)
- ⚠️ The placeholder URL `https://prod.piedpiper.com/api/v1` is just an example - replace it with your actual URL

## Testing Your Webhook

After setting up, you can test by:
1. Triggering an event in Whop (e.g., creating a payment)
2. Checking your server logs for webhook events
3. The webhook handler in `app/api/webhooks/route.ts` will process the events

