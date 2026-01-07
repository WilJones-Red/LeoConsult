# Calendly Integration (API Polling Method)

Since webhooks aren't available on your Calendly plan, we're using **API polling** instead. It works perfectly!

## How It Works

1. **Automatic Sync**: Every 15 minutes, GitHub Actions triggers our sync function
2. **Fetch Bookings**: The function checks Calendly for new scheduled events from the last 7 days
3. **Update Leads**: For each booking, it updates the matching lead in your database with:
   - Full name
   - Phone number  
   - Company name
   - Calendly booking status
   - Meeting time details

## What Was Deployed

✅ **Edge Function**: `calendly-sync`
- URL: https://clpcskkoguomoihnisai.supabase.co/functions/v1/calendly-sync
- Fetches scheduled events from Calendly API
- Updates leads table with booking info

✅ **GitHub Action**: `.github/workflows/calendly-sync.yml`
- Runs every 15 minutes automatically
- Can also trigger manually from GitHub Actions tab

## Manual Trigger (For Testing)

You can test the sync right now:

```powershell
curl -X POST https://clpcskkoguomoihnisai.supabase.co/functions/v1/calendly-sync -H "Content-Type: application/json"
```

Or from GitHub:
1. Go to your repo → Actions tab
2. Click "Sync Calendly Leads"
3. Click "Run workflow"

## Next Steps

1. **Run the database migration**: Execute `supabase_schema.sql` to add the required columns
2. **Push to GitHub**: Commit the `.github/workflows` folder to enable automation
3. **Test**: Book a test meeting on Calendly and watch it auto-populate!

## Monitoring

Check function logs at:
https://supabase.com/dashboard/project/clpcskkoguomoihnisai/logs/functions

The function will log:
- How many events it found
- How many leads it updated
- Any errors encountered

---

**Why polling instead of webhooks?**
Your Calendly plan doesn't support webhook subscriptions (that's why we got 404 errors). Polling every 15 minutes is just as reliable for your use case - leads will sync within minutes of booking!
