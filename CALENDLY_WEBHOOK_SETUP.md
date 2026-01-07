# Calendly Webhook Integration Setup

This guide walks you through setting up automatic lead updates when someone books a meeting on Calendly.

## What This Does

When someone books a Calendly meeting:
1. ✅ Calendly sends webhook to Supabase Edge Function
2. ✅ Edge Function extracts name, phone, company from booking
3. ✅ Updates the lead record in Supabase
4. ✅ Sets `calendly_booked = true` and `status = 'Call Scheduled'`
5. ✅ You see complete lead data in leads.html dashboard

---

## Step 1: Deploy the Edge Function to Supabase

### Install Supabase CLI (if not already installed)

```powershell
# Using npm
npm install -g supabase

# OR using Chocolatey
choco install supabase
```

### Login to Supabase

```powershell
supabase login
```

### Link to Your Project

```powershell
cd c:\Users\wmj1f\OneDrive\Documents\A-Website\Leoconsult
supabase link --project-ref clpcskkoguomoihnisai
```

### Deploy the Function

```powershell
supabase functions deploy calendly-webhook
```

After deployment, you'll get a URL like:
```
https://clpcskkoguomoihnisai.supabase.co/functions/v1/calendly-webhook
```

**Copy this URL** - you'll need it for Step 2!

---

## Step 2: Configure Calendly Webhook

1. **Go to Calendly Integrations**
   - Login to Calendly: https://calendly.com/app
   - Click your avatar (top right) → **Integrations**
   - Search for "Webhooks" and click **Connect**

2. **Create a New Webhook**
   - Click **Add webhook subscription**
   
3. **Configure Webhook Settings**
   - **URL**: Paste your Edge Function URL from Step 1
     ```
     https://clpcskkoguomoihnisai.supabase.co/functions/v1/calendly-webhook
     ```
   
   - **Events**: Check **Invitee Created**
   
   - **Organization or User**: Select **User** (or Organization if you want all team events)
   
   - Click **Create webhook**

4. **Test the Webhook**
   - Calendly will send a test event
   - If successful, you'll see a green checkmark ✓

---

## Step 3: Add Custom Questions in Calendly (Optional)

To capture phone and company information:

1. **Edit Your Event Type**
   - Go to Event Types
   - Click on your "30 Minute Meeting"
   - Go to **Questions** tab

2. **Add Custom Questions**
   - Click **Add question**
   - Add these questions:
     - "Phone Number" (Phone format)
     - "Company Name" (Single line text)
   - Make them **Required**
   - Save

Now when people book, you'll capture:
- ✅ Name (from Calendly)
- ✅ Email (pre-filled from your form)
- ✅ Phone (from custom question)
- ✅ Company (from custom question)

---

## Step 4: Test End-to-End

1. **Submit your contact form** with a test email
2. **Book a Calendly meeting** with that email
3. **Check leads.html** - you should see:
   - Full name filled in
   - Phone and company (if you added questions)
   - Status changed to "Call Scheduled"
   - `calendly_booked` = true

---

## Troubleshooting

### Check Edge Function Logs

```powershell
supabase functions logs calendly-webhook
```

### Common Issues

**"Function not found"**
- Make sure you deployed the function
- Check the URL is correct

**"Permission denied"**
- The function uses the service role key automatically
- Make sure RLS policies are set up correctly

**"Lead not found"**
- The email in Calendly must match the email in your leads table
- Check for typos or different email addresses

### Manual Test

You can test the webhook manually:

```powershell
# Test payload
$body = @{
    event_type = "invitee.created"
    payload = @{
        email = "test@example.com"
        name = "John Doe"
        questions_and_answers = @(
            @{
                question = "Phone Number"
                answer = "555-1234"
            },
            @{
                question = "Company Name"
                answer = "Test Company"
            }
        )
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://clpcskkoguomoihnisai.supabase.co/functions/v1/calendly-webhook" -Method POST -Body $body -ContentType "application/json"
```

---

## What Gets Updated

When webhook fires, these fields update in your leads table:

| Field | Source | Example |
|-------|--------|---------|
| `full_name` | Calendly invitee name | "John Smith" |
| `phone` | Custom question (if added) | "555-123-4567" |
| `company_name` | Custom question (if added) | "Acme Corp" |
| `calendly_booked` | Always set to true | true |
| `status` | Auto-updated | "Call Scheduled" |
| `metadata` | Full Calendly webhook data | JSON object |

---

## Next Steps

Once this is working:
- Add more custom questions in Calendly to capture additional data
- Set up email notifications when leads book (Supabase can send emails)
- Create automations based on booking status
