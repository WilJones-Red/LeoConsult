# Google Analytics Setup & Usage Guide for Leo Consult

**Last Updated:** January 5, 2026

## Table of Contents
1. [What's Been Implemented](#whats-been-implemented)
2. [How to Access Your Analytics](#how-to-access-your-analytics)
3. [Key Metrics to Monitor](#key-metrics-to-monitor)
4. [Custom Events Being Tracked](#custom-events-being-tracked)
5. [How to Use GA4 for Business Decisions](#how-to-use-ga4-for-business-decisions)
6. [Weekly Analytics Checklist](#weekly-analytics-checklist)
7. [Privacy & Compliance](#privacy--compliance)
8. [Troubleshooting](#troubleshooting)

---

## What's Been Implemented

### ✅ Cookie Consent System (GDPR/CCPA Compliant)
- Clean, non-intrusive banner at bottom of all pages
- Google Analytics **only loads** when users click "Accept"
- Users can reject and only essential cookies are used
- Consent choice stored for 365 days
- Links to Privacy Policy provided

### ✅ Google Analytics 4 (GA4) Setup
- **Measurement ID:** G-BPKJS0RX47
- **IP Anonymization:** Enabled (GDPR requirement)
- **Cookie Settings:** SameSite=None;Secure
- **Data Retention:** 26 months (Google default)

### ✅ Enhanced Event Tracking
Your site automatically tracks:
- Page views (automatic)
- Button clicks (CTAs, navigation)
- Form interactions (start, submit)
- Scroll depth (25%, 50%, 75%, 100%)
- Time on page
- Outbound link clicks
- Service/case study card clicks
- ROI calculator usage
- Chatbot interactions

### ✅ All Pages Updated
- index.html (homepage)
- services/pricing.html
- tools/roi-calculator.html
- All 6 blog posts
- thank-you.html
- Privacy policy page

---

## How to Access Your Analytics

### Step 1: Log into Google Analytics
1. Go to https://analytics.google.com
2. Log in with your Google account (the one associated with Leo Consult)
3. Select the **Leo Consult** property (ID: G-BPKJS0RX47)

### Step 2: Navigate the Interface

**Left Sidebar - Main Sections:**
- **Home:** Overview dashboard
- **Reports:** Detailed analytics
- **Explore:** Custom analysis
- **Advertising:** Campaign tracking (if using ads)

---

## Key Metrics to Monitor

### 🎯 Every Week - The Essentials

#### 1. **Traffic Overview**
- **Where:** Reports > Acquisition > Traffic Acquisition
- **What to Check:**
  - Total users (unique visitors)
  - Sessions (total visits)
  - Engagement rate (% of engaged sessions)
  - Top traffic sources (organic search, direct, social, referrals)

**What Good Looks Like:**
- Steady or increasing user count week-over-week
- Engagement rate > 60%
- Multiple traffic sources (not over-reliant on one)

#### 2. **Page Performance**
- **Where:** Reports > Engagement > Pages and Screens
- **What to Check:**
  - Which pages get most views
  - Average engagement time per page
  - Bounce rate by page

**What to Look For:**
- Homepage should have highest views
- Pricing page views indicate sales intent
- Blog posts driving organic traffic
- Low engagement = potential content issues

#### 3. **User Behavior Flow**
- **Where:** Reports > Engagement > Landing Pages
- **What to Check:**
  - Where users enter your site
  - Which pages they visit next
  - Where they exit

**Insights to Extract:**
- Are people finding your pricing page?
- Do blog readers explore services?
- Is navigation intuitive?

#### 4. **Conversions (Critical!)**
- **Where:** Reports > Engagement > Events
- **What to Check:**
  - `form_submit` events (contact form submissions)
  - `cta_click` events (button clicks)
  - `roi_calculation` events (calculator usage)

**What to Track:**
- Number of form submissions per week
- Which CTAs get most clicks
- Conversion rate: (form_submit / total_users) × 100

---

## Custom Events Being Tracked

Your website tracks these events automatically:

| Event Name | What It Tracks | Why It Matters |
|------------|----------------|----------------|
| `page_view` | Every page loaded | Overall traffic |
| `cta_click` | Button clicks (Get Started, Contact, etc.) | User intent & engagement |
| `form_start` | User begins filling form | Interest level |
| `form_submit` | Form submitted | **Lead generation!** |
| `scroll_depth` | How far users scroll (25%, 50%, 75%, 100%) | Content engagement |
| `outbound_click` | Links to external sites | Referral tracking |
| `service_card_click` | Service offering clicked | Which services interest users |
| `case_study_click` | Case study viewed | Proof point effectiveness |
| `roi_calculation` | ROI calculator used | High-intent leads |
| `cookie_consent` | User accepts/rejects cookies | Compliance tracking |
| `chatbot_interaction` | Chatbot usage | Support engagement |

### How to View Custom Events
1. Go to **Reports > Engagement > Events**
2. Click on any event name to see details
3. Look at **Event Count** and **Total Users**

---

## How to Use GA4 for Business Decisions

### 🎯 Scenario 1: "Which blog posts should I write more of?"

**Steps:**
1. Go to **Reports > Engagement > Pages**
2. Filter to show only `/blog/` URLs
3. Sort by **Engagement Time** (descending)
4. Note which topics keep readers on page longest

**Action:** Write more content similar to top-performing posts

---

### 🎯 Scenario 2: "Is my pricing page effective?"

**Steps:**
1. Go to **Explore** > Create new exploration
2. Add dimensions: `Page path` and `Event name`
3. Add metrics: `Total users`, `Event count`
4. Filter to `services/pricing.html`
5. Check:
   - How many visitors view pricing?
   - Do they click CTAs on pricing page? (check `cta_click` events)
   - What page do they visit next?

**Red Flags:**
- High traffic to pricing, but low CTA clicks = confusing pricing
- Users leave site immediately after pricing = sticker shock

**Action:** Test different pricing presentations or add more context

---

### 🎯 Scenario 3: "Where are my best leads coming from?"

**Steps:**
1. Go to **Explore** > Create User Exploration
2. Set up funnel:
   - Step 1: Page view (any page)
   - Step 2: `form_start` event
   - Step 3: `form_submit` event
3. Add dimension: `First user source/medium`

**Insights:**
- See which traffic sources convert best
- Calculate cost per lead if running paid ads
- Double down on high-converting sources

---

### 🎯 Scenario 4: "Is my homepage converting?"

**Steps:**
1. Go to **Reports > Engagement > Landing Pages**
2. Filter to homepage (`/index.html` or `/`)
3. Check:
   - Sessions from homepage
   - Engagement rate
   - Key events triggered (form_submit, cta_click)

**What Good Looks Like:**
- Engagement rate > 70%
- Average session 2+ minutes
- At least 5% of visitors clicking CTAs

---

## Weekly Analytics Checklist

### Every Monday Morning (15 minutes)

**1. Check Overall Health**
- [ ] Go to **Reports > Home**
- [ ] Note total users vs. last week (increase/decrease?)
- [ ] Note engagement rate (trending up/down?)

**2. Review Traffic Sources**
- [ ] **Reports > Acquisition > Traffic Acquisition**
- [ ] Top 3 sources bringing traffic?
- [ ] Any new referral sources?
- [ ] Organic search growing?

**3. Check Leads**
- [ ] **Reports > Engagement > Events**
- [ ] Filter to `form_submit`
- [ ] How many leads this week?
- [ ] Compare to previous week

**4. Identify Top Content**
- [ ] **Reports > Engagement > Pages**
- [ ] Which page had most views?
- [ ] Which had longest engagement?
- [ ] Any underperforming pages?

**5. Review ROI Calculator**
- [ ] Filter events to `roi_calculation`
- [ ] How many people used it?
- [ ] Did they convert to form submission?

**Action Items:**
- Write down 1-2 insights
- Plan 1 improvement based on data

---

## Privacy & Compliance

### How Cookie Consent Works

**User Accepts:**
- Google Analytics loads and tracks
- All events are sent to GA4
- Data stored per GA4 retention policy (26 months)

**User Rejects:**
- Google Analytics does NOT load
- No tracking cookies set
- Only essential cookie: `leo_cookie_consent` (stores their choice)

### Data We Collect (When Consented)
- Page URLs visited
- Time spent on pages
- Device type (desktop/mobile/tablet)
- Approximate location (city/country, not address)
- Browser type
- Referral source
- **Anonymized IP address** (GDPR compliant)

### Data We NEVER Collect
- Names, emails, or personal info (unless submitted via form)
- Precise location (GPS)
- Cross-site tracking
- Sensitive personal information

### Your Responsibilities
1. **Monitor Consent Rate:**
   - Check event `cookie_consent` with label `accepted` vs `rejected`
   - If rejection rate > 50%, consider if banner is too aggressive

2. **Respond to Data Requests:**
   - Users can request data deletion (privacy@leoconsult.org)
   - GA4 doesn't track individuals directly, but honor requests

3. **Keep Privacy Policy Updated:**
   - Review annually
   - Update if you add new tracking tools

---

## Advanced Tips

### Create Custom Dashboards

**Goal:** Quick weekly overview in one place

**Steps:**
1. Go to **Library** (bottom left)
2. Click **Create new report**
3. Add cards for:
   - Weekly users
   - Form submissions
   - Top 5 pages
   - Traffic sources
4. Save as "Weekly Review"

---

### Set Up Alerts

**Goal:** Get notified of major changes

**Steps:**
1. Go to **Admin** > **Property** > **Custom insights**
2. Create insight for:
   - Traffic drop > 30% (potential issue)
   - Form submissions spike (new lead source!)
   - Unusual traffic source (potential referral opportunity)

---

### Track Marketing Campaigns

**If running ads or email campaigns:**

**Use UTM Parameters:**
```
https://www.leoconsult.org/?utm_source=linkedin&utm_medium=post&utm_campaign=dec_2025
```

**Generate UTM links:**
- Use Google's Campaign URL Builder: https://ga-dev-tools.google/campaign-url-builder/

**View Campaign Performance:**
- **Reports > Acquisition > Traffic Acquisition**
- Filter by `Session campaign`

---

## Troubleshooting

### "I don't see any data"

**Possible Causes:**
1. **Cookie consent not given** - Try visiting site in incognito, click "Accept"
2. **Ad blocker active** - Disable ad blockers and reload
3. **GA takes 24-48 hours** - Real-time data available, but full reports can lag
4. **Wrong property selected** - Ensure you're viewing G-BPKJS0RX47

**Solution:**
- Go to **Reports > Realtime** to see live traffic
- Visit your own site (accepted cookies) and see if you appear

---

### "Event counts seem low"

**Remember:**
- Only users who **accept cookies** are tracked
- If 50% of visitors reject, you'll only see 50% of actual traffic
- This is normal and compliant

**Check:**
- **Reports > Engagement > Events** > `cookie_consent`
- See `accepted` vs `rejected` counts
- Typical acceptance rate: 60-80%

---

### "I see my own visits"

**Solution:**
- Exclude your own IP address
- **Admin > Data Settings > Data Filters**
- Create filter to exclude your home/office IP
- Find your IP: https://whatismyipaddress.com/

---

## Key Metrics Benchmarks for Consulting Sites

Based on industry standards:

| Metric | Good | Average | Needs Work |
|--------|------|---------|------------|
| Engagement Rate | > 70% | 50-70% | < 50% |
| Avg. Session Duration | > 2 min | 1-2 min | < 1 min |
| Pages per Session | > 3 | 2-3 | < 2 |
| Bounce Rate | < 40% | 40-60% | > 60% |
| Form Conversion | > 3% | 1-3% | < 1% |

---

## Monthly Review (30 minutes)

**First Week of Each Month:**

1. **Export Previous Month's Data**
   - Reports > Home > Export (top right)
   - Save as "Leo_Consult_Analytics_[Month]_[Year].pdf"

2. **Analyze Trends**
   - Compare to previous month
   - Identify best traffic source
   - Note top-performing content

3. **Plan Next Month**
   - Double down on what works
   - Fix underperforming pages
   - Create content for high-traffic keywords

4. **Share Insights** (if team grows)
   - Create simple one-pager
   - Share with any contractors/partners
   - Align content strategy

---

## Questions?

**If you need help:**
1. Google Analytics Help Center: https://support.google.com/analytics
2. GA4 Training: https://analytics.google.com/analytics/academy/
3. YouTube: "Google Analytics 4 tutorial for beginners"

**Remember:** Start simple. Check the Weekly Checklist every Monday. Let data guide decisions, not hunches.

---

## Quick Reference

**Your GA4 ID:** G-BPKJS0RX47

**Key Files:**
- `/js/cookie-consent.js` - Cookie consent logic
- `/js/analytics.js` - Custom event tracking
- `/privacy-policy.html` - Legal compliance page

**Most Important Reports:**
1. Reports > Home (overview)
2. Reports > Engagement > Events (conversions!)
3. Reports > Acquisition > Traffic Acquisition (where leads come from)
4. Reports > Engagement > Pages (content performance)

**Emergency:** If analytics stops working, check:
1. Browser console for errors (F12 > Console tab)
2. Cookie consent is "accepted"
3. Internet connection stable
4. No browser extensions blocking GA

---

**Remember:** Analytics is a tool, not the goal. Use it to understand your visitors and make better decisions, but don't obsess over every metric. Focus on the ones that drive business: traffic, engagement, and conversions.
