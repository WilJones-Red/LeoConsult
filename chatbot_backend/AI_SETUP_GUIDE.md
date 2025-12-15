# AI Chatbot Implementation Guide

## Setup Steps (In Order)

### 1. Enable pgvector Extension
Run this SQL in Supabase SQL Editor:
```sql
-- Copy contents from: chatbot_backend/enable_pgvector.sql
```
This enables vector similarity search and converts your embeddings to proper vector format.

### 2. Create Vector Matching Function
Run this SQL in Supabase SQL Editor:
```sql
-- Copy contents from: chatbot_backend/match_faq_vector.sql
```
This creates the database function for vector similarity matching.

### 3. Deploy Edge Function
In your terminal:
```bash
# Login to Supabase CLI (if not already)
npx supabase login

# Link to your project
npx supabase link --project-ref clpcskkoguomoihnisai

# Deploy the Edge Function
npx supabase functions deploy chat-faq
```

### 4. Test Your Chatbot
The frontend has already been updated to call the AI Edge Function. Test it by:
- Opening your website
- Clicking the chat bubble
- Asking questions like:
  - "What services do you offer?"
  - "How much does it cost?"
  - "Tell me about data analytics"

## What Changed

### Before (Text Matching):
- Simple string similarity (trigrams)
- Couldn't understand variations or synonyms
- Failed to match most queries

### After (AI Embeddings):
- Semantic understanding using neural network embeddings
- Understands "pricing" = "cost" = "how much"
- Handles typos and variations naturally
- Uses the embeddings you already trained

## Architecture

1. **User sends message** → Frontend ([chatbot.js](js/chatbot.js))
2. **Edge Function receives** → [supabase/functions/chat-faq/index.ts](supabase/functions/chat-faq/index.ts)
3. **Generate embedding** → transformers.js (all-MiniLM-L6-v2 model)
4. **Query database** → PostgreSQL function `match_faq_vector()`
5. **Return best match** → User sees relevant answer

## Troubleshooting

If Edge Function deployment fails:
- Make sure Supabase CLI is installed: `npm install -g supabase`
- Check you're logged in: `npx supabase login`
- Verify project link: `npx supabase projects list`

If chatbot returns errors:
- Check browser console (F12) for error messages
- Verify Edge Function is deployed in Supabase Dashboard → Edge Functions
- Ensure both SQL scripts were run successfully
