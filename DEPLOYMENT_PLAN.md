# JTrack Deployment Plan

## Overview
This document outlines the steps to deploy JTrack, a spaced repetition learning app for Japanese language study, to production.

---

## Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env.production` file with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Optional: Analytics, error tracking, etc.
# VITE_ANALYTICS_ID=your_analytics_id
```

### 2. Database Setup (Supabase)

#### Required Tables:

**a) `users` table:**
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  email TEXT UNIQUE,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_has_studied BOOLEAN DEFAULT FALSE
);
```

**b) `studied_flashcards` table:**
```sql
CREATE TABLE studied_flashcards (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  front TEXT NOT NULL,
  back TEXT,
  interval INTEGER DEFAULT 1,
  repetition INTEGER DEFAULT 0,
  efactor DECIMAL DEFAULT 2.5,
  due_date TIMESTAMP WITH TIME ZONE,
  original_deck TEXT NOT NULL,
  last_studied TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  kanji_meaning TEXT,
  on_readings TEXT,
  name_readings TEXT,
  stroke_count TEXT,
  UNIQUE(user_id, front, original_deck)
);
```

**c) `hiragana` table:**
```sql
CREATE TABLE hiragana (
  id SERIAL PRIMARY KEY,
  hiragana TEXT NOT NULL,
  romaji TEXT NOT NULL
);
```

**d) `katakana` table:**
```sql
CREATE TABLE katakana (
  id SERIAL PRIMARY KEY,
  katakana TEXT NOT NULL,
  romaji TEXT NOT NULL
);
```

**e) `decks` table:**
```sql
CREATE TABLE decks (
  deck_id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT
);
```

#### Seed Data:
- Populate `hiragana` table with all 46 hiragana characters
- Populate `katakana` table with all 46 katakana characters
- Populate `decks` table with at least:
  - Hiragana deck
  - Katakana deck
  - Kanji deck (coming soon)

### 3. Supabase Authentication Setup
- Enable Email/Password authentication in Supabase dashboard
- Configure email templates (optional)
- Set up redirect URLs for production domain

### 4. Build Optimization

Update `vite.config.ts` for production:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable in production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'dayjs'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
```

---

## Deployment Options

### Option 1: Vercel (Recommended for simplicity)

**Steps:**

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Connect to Git Repository:**
- Push your code to GitHub/GitLab
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your repository

3. **Configure Build Settings:**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

4. **Add Environment Variables:**
- Go to Project Settings → Environment Variables
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

5. **Deploy:**
- Click "Deploy"
- Vercel will auto-deploy on every push to main branch

**Custom Domain:**
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

### Option 2: Netlify

**Steps:**

1. **Connect Repository:**
- Go to [netlify.com](https://netlify.com)
- Click "Add new site" → "Import an existing project"
- Connect to GitHub and select repository

2. **Build Settings:**
- **Build command:** `npm run build`
- **Publish directory:** `dist`

3. **Environment Variables:**
- Go to Site Settings → Environment Variables
- Add Supabase credentials

4. **Deploy:**
- Click "Deploy site"

**Redirects for SPA:**
Create `public/_redirects` file:
```
/*    /index.html   200
```

---

### Option 3: Self-Hosted (VPS/Digital Ocean/AWS)

**Requirements:**
- Node.js 18+
- Nginx or Apache
- SSL Certificate (Let's Encrypt)

**Steps:**

1. **Build the Application:**
```bash
npm run build
```

2. **Upload `dist` folder to server**

3. **Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    root /var/www/jtrack/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

4. **Install SSL Certificate:**
```bash
sudo certbot --nginx -d yourdomain.com
```

5. **Restart Nginx:**
```bash
sudo systemctl restart nginx
```

---

## Post-Deployment

### 1. Testing Checklist

**Authentication:**
- ✅ User registration works
- ✅ User login works
- ✅ Sign out works
- ✅ Protected routes redirect to login

**Study Flow:**
- ✅ Hiragana deck loads flashcards
- ✅ Katakana deck loads flashcards
- ✅ Due cards appear first
- ✅ New cards (max 3 per day) appear
- ✅ Card flip animation works
- ✅ Card swipe animation works
- ✅ SuperMemo algorithm calculates intervals
- ✅ Progress is saved to database
- ✅ Due card label appears correctly
- ✅ New card label appears correctly

**Profile Page:**
- ✅ Stats display correctly
- ✅ User info displays correctly

**Navigation:**
- ✅ All navigation links work
- ✅ Scroll to top button appears
- ✅ Mobile navigation works
- ✅ Profile button works

### 2. Performance Optimization

**Monitor:**
- Lighthouse score (aim for 90+)
- Core Web Vitals
- Time to Interactive (TTI)

**Optimize if needed:**
- Enable HTTP/2
- Add CDN (Cloudflare)
- Optimize images (favicon already optimized)
- Enable browser caching

### 3. Monitoring & Analytics

**Recommended Tools:**
- **Error Tracking:** Sentry
- **Analytics:** Google Analytics or Plausible
- **Uptime Monitoring:** UptimeRobot

**Implementation:**
```bash
npm install @sentry/react
```

Add to `src/main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

### 4. Supabase Production Setup

**Row Level Security (RLS):**

Enable RLS on all tables:
```sql
ALTER TABLE studied_flashcards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own flashcards
CREATE POLICY "Users can view own flashcards"
ON studied_flashcards FOR SELECT
USING (auth.uid()::bigint = user_id);

-- Policy: Users can insert their own flashcards
CREATE POLICY "Users can insert own flashcards"
ON studied_flashcards FOR INSERT
WITH CHECK (auth.uid()::bigint = user_id);

-- Policy: Users can update their own flashcards
CREATE POLICY "Users can update own flashcards"
ON studied_flashcards FOR UPDATE
USING (auth.uid()::bigint = user_id);
```

### 5. Backup Strategy

**Database Backups:**
- Supabase provides automatic daily backups
- Set up additional backups via Supabase CLI:
```bash
supabase db dump -f backup.sql
```

---

## CI/CD Pipeline (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Troubleshooting

### Common Issues:

**1. Blank page after deployment:**
- Check browser console for errors
- Verify environment variables are set correctly
- Check if Supabase URL is correct

**2. Routes not working (404 errors):**
- Ensure SPA redirects are configured
- Vercel: Should work automatically
- Netlify: Add `_redirects` file
- Nginx: Use `try_files` directive

**3. Supabase connection errors:**
- Verify API keys are correct
- Check CORS settings in Supabase
- Ensure row-level security policies allow access

**4. Performance issues:**
- Enable gzip compression
- Check bundle size: `npm run build -- --analyze`
- Optimize images
- Enable caching headers

---

## Quick Start Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests
npm test

# Check bundle size
npm run build -- --analyze
```

---

## Success Criteria

Deployment is successful when:
- ✅ App loads without errors
- ✅ All pages are accessible
- ✅ Authentication works
- ✅ Flashcard study flow works
- ✅ Data persists to database
- ✅ Mobile experience is smooth
- ✅ Lighthouse score > 90

---

## Maintenance

**Weekly:**
- Check error logs
- Monitor database size
- Review user feedback

**Monthly:**
- Update dependencies: `npm update`
- Review Supabase usage
- Backup database

**Quarterly:**
- Security audit
- Performance optimization
- User analytics review

---

## Support & Documentation

- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/
- **Vercel Docs:** https://vercel.com/docs
- **React Router:** https://reactrouter.com/

---

## Estimated Timeline

- **Initial Setup:** 1-2 hours
- **Database Setup:** 1 hour
- **First Deployment:** 30 minutes
- **Testing & Debugging:** 2-3 hours
- **Domain Setup:** 30 minutes
- **Monitoring Setup:** 1 hour

**Total:** ~6-8 hours for complete production deployment

---

**Note:** This app is production-ready! All core features are implemented and tested. Choose Vercel for the fastest deployment experience.

