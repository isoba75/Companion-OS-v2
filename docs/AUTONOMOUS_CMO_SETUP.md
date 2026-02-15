# 🚀 Autonomous CMO Setup Guide

## Free Email Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Create App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" → "Other" → Name: "Digibuntu CMO"
3. Copy the 16-character password

### Step 3: Configure Campaign Sender
Edit `scripts/campaign-sender.cjs`:

```javascript
const EMAIL_CONFIG = {
  user: 'your-email@gmail.com',       // YOUR GMAIL
  pass: 'xxxx-xxxx-xxxx-xxxx',       // APP PASSWORD (not regular password!)
  from: 'Your Name <your-email@gmail.com>',
  signature: `...`
};
```

### Step 4: Set Up Calendly (Free)
1. Create free Calendly account: https://calendly.com
2. Create a 15-min "Demo" event type
3. Copy your link and replace in templates

---

## Commands

### Test Email (send to yourself)
```bash
cd /data/workspace/Companion-OS-v2
node scripts/campaign-sender.cjs test
```

### Run Campaign (50 emails)
```bash
node scripts/campaign-sender.cjs run 50 cold_1
```

### Run Campaign (100 emails)
```bash
node scripts/campaign-sender.cjs run 100 cold_1
```

### Next Email in Sequence
```bash
node scripts/campaign-sender.cjs run 100 cold_2
```

### Qualify Leads
```bash
node scripts/campaign-sender.cjs qualify
```

---

## Gmail Limits
- **Free Gmail:** 500 emails/day
- **Google Workspace:** 2000 emails/day
- **Personalized 1:1 emails** - No spam concerns!

---

## Campaign Flow

```
Day 0: cold_1 (Intro)
   ↓ (no reply)
Day 3: cold_2 (Follow-up)
   ↓ (no reply)
Day 7: cold_3 (Value add)
   ↓ (no reply)
Day 14: LinkedIn warm (if applicable)
   ↓ (no reply)
Day 21: Final + Remove from sequence
```

## Lead Status

| Status | Meaning | Action |
|--------|---------|--------|
| new | Just scraped | Ready for campaign |
| contacted | Email sent | Wait for reply |
| replied | Lead responded | Escalate to you |
| interested | Positive response | Book demo |
| trial | Started trial | Nurture |
| paid | Converted | Celebrate! |
| bounced | Email failed | Remove |

---

## What Happens When Lead Replies?

**The system detects:**
- "Je suis intéressé" → status: interested
- "Prix?" → status: interested  
- "Calendly link" clicked → status: interested
- Demo booked → status: trial

**You get notified via Telegram when:**
- Lead is "hot" (interested, demo requested)
- Lead has pricing questions
- Lead converts to paid

Everything else I handle autonomously! 🎯