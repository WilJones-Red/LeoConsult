# 🎉 Admin Panel Setup Guide

## Files Created
✅ [admin.html](admin.html) - Full admin panel interface  
✅ [js/admin.js](js/admin.js) - Admin panel JavaScript  
✅ [chatbot_backend/create_chat_logs.sql](chatbot_backend/create_chat_logs.sql) - Analytics tables  
✅ [supabase/functions/retrain-faq/index.ts](supabase/functions/retrain-faq/index.ts) - Retrain Edge Function  

## Setup Steps

### 1. Run SQL in Supabase SQL Editor
Copy and run these SQL scripts in order:

**A. Create chat_logs table:**
```sql
-- Copy from: chatbot_backend/create_chat_logs.sql
```

**B. Enable Row Level Security (RLS) policies:**
```sql
-- Allow public to insert chat logs
CREATE POLICY "Allow public insert on chat_logs"
ON chat_logs FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users to view all data
CREATE POLICY "Allow authenticated read on chat_logs"
ON chat_logs FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to manage FAQs
CREATE POLICY "Allow authenticated manage FAQs"
ON faq_chatbot FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_chatbot ENABLE ROW LEVEL SECURITY;
```

### 2. Create Admin User in Supabase
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Email: `admin@leoconsulting.com` (or your email)
4. Password: (create a strong password)
5. Click "Create user"

### 3. Access Admin Panel
- Navigate to: `http://localhost:3000/admin.html`
- Login with your admin credentials
- Start managing your chatbot!

## Admin Panel Features

### 📊 Dashboard
- **Total Queries**: Number of chatbot interactions
- **Avg Confidence**: How well the bot is matching questions
- **Positive Feedback**: User satisfaction (when implemented)
- **Low Confidence**: Questions that need new FAQs

### 📚 Manage FAQs
- **Add New FAQ**: Create question-answer pairs
- **Edit FAQ**: Update existing FAQs
- **Delete FAQ**: Remove outdated FAQs
- **Retrain Model**: Regenerate embeddings for all FAQs (click after adding/editing)

### 📊 Chat Logs
- View all user interactions
- See confidence scores (color-coded)
- Analyze what users are asking

### ⚠️ Low Confidence Queries
- Questions the bot struggled to answer
- Quick "Add FAQ" button for each query
- Helps improve chatbot over time

## Usage Workflow

1. **Monitor Low Confidence tab** - See what users ask that bot can't answer
2. **Add FAQs** - Create new question-answer pairs for common queries
3. **Click "Retrain Model"** - Updates embeddings so bot uses new FAQs
4. **Check Analytics** - Monitor improvement over time

## Important Notes

⚠️ **After adding/editing FAQs, always click "Retrain Model"**  
This regenerates embeddings so the AI can match questions properly.

🔒 **Security**: Only authenticated users can access admin panel  
Make sure to use a strong password for your admin account.

📈 **Analytics refresh**: Dashboard stats auto-update every 30 seconds

## Troubleshooting

**Can't login?**
- Verify user was created in Supabase Dashboard → Authentication
- Check email/password are correct
- Make sure RLS policies were applied

**Retrain button not working?**
- Check browser console (F12) for errors
- Verify retrain-faq Edge Function is deployed
- May take 30-60 seconds for large FAQ lists

**No data showing?**
- Chat logs only appear after users interact with chatbot
- Test chatbot on main site first to generate data
