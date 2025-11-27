# Market Pulse Live

A professional livestream management platform built with Next.js, featuring admin/viewer role separation, real-time stream management, and a beautiful UI.

## 🎯 Features

- **Admin/Viewer Role System** - Separate access levels for managers and viewers
- **8-Room Stream Management** - Configure and manage up to 8 livestream rooms
- **4×2 Live Grid** - Beautiful grid layout for active streams
- **YouTube & HLS Support** - Compatible with YouTube live streams and HLS sources
- **Real-time Updates** - Auto-polling for live stream status
- **Dark/Light Theme** - Fully themeable interface
- **Responsive Design** - Works on desktop and mobile

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### 3. Access the App

When you first access the dashboard, you'll be asked: **"Are you the admin?"**

- **Admin Access**: Enter the admin key to unlock full management features
- **Viewer Access**: View-only mode to watch live streams

**Default Admin Key:** `mpl-admin-2024`

> ⚠️ **Important:** Change the admin key in `lib/role-context.tsx` before deploying to production!

## 📁 Project Structure

```
├── app/
│   ├── api/                # API routes
│   │   ├── rooms/          # Room CRUD endpoints
│   │   └── auth/           # Authentication endpoints
│   ├── dashboard/          # Admin dashboard
│   ├── discover/           # Browse streams page
│   ├── rooms/              # Stream viewer page
│   └── layout.tsx          # Root layout
├── components/
│   ├── auth/               # Auth components (RoleGate, AuthModal)
│   ├── dashboard/          # Dashboard components
│   ├── livestream/         # Stream player components
│   └── viewer/             # Viewer components
├── lib/
│   ├── role-context.tsx    # Admin/Viewer role management
│   ├── auth-context.tsx    # User authentication
│   ├── theme-context.tsx   # Theme management
│   ├── db.ts               # Database operations
│   └── supabase.ts         # Supabase client
```

## 🔐 Role System

### Admin Mode
- Create and edit rooms
- Configure stream URLs (YouTube/HLS)
- Activate/deactivate streams
- Access analytics and settings
- Full dashboard access

### Viewer Mode
- View the 4×2 grid of active streams
- Watch live streams
- No edit or management capabilities

## 🛠️ Configuration

### Admin Key
The admin key is set in `lib/role-context.tsx`:

```typescript
const ADMIN_KEY = "mpl-admin-2024";
```

Change this to a secure key before deploying.

### Database
The app supports two storage modes:

1. **Supabase** (Production) - Set these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **In-Memory** (Development) - Works automatically when Supabase isn't configured

### Supabase Table Schema

```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stream_url TEXT DEFAULT '',
  stream_type TEXT DEFAULT 'youtube',
  is_active BOOLEAN DEFAULT false,
  company_id TEXT NOT NULL,
  thumbnail TEXT,
  auto_start BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚢 Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repo to Netlify
3. Set build command: `pnpm run build`
4. Set publish directory: `.next`
5. Add environment variables in Netlify settings
6. Deploy!

### Environment Variables for Production

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_KEY=your_secure_admin_key
```

## 📜 Scripts

```bash
pnpm dev        # Start development server
pnpm dev:whop   # Start with Whop proxy (for Whop integration)
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run linter
```

## 🎨 Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Supabase** - Database (optional)
- **HLS.js** - HLS stream playback

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

Built with ❤️ for Market Pulse Live
