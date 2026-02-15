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

### Step 4: Add Your Name
Replace `[VOTRE NOM]` with your actual name in templates.

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

### Follow-up Sequence
```bash
# Day 3: Second email
node scripts/campaign-sender.cjs run 100 cold_2

# Day 7: Third email
node scripts/campaign-sender.cjs run 100 cold_3
```

### Qualify Leads
```bash
node scripts/campaign-sender.cjs qualify
```

---

## Gmail Limits
- **Free Gmail:** 500 emails/day
- **Personalized 1:1 emails** - No spam concerns!

---

## Campaign Flow (Self-Serve Free Trial)

```
Day 0: cold_1 (Intro - free trial signup)
   ↓ (no reply)
Day 3: cold_2 (Follow-up - emphasize simplicity)
   ↓ (no reply)
Day 7: cold_3 (Value add - urgency)
   ↓ (no reply)
Day 14: LinkedIn warm (if applicable)
Day 21: Final / Remove from sequence
```

## Key Messaging
- **NO DEMOS** - Not offered
- **FREE TRIAL** - Self-serve, no human interaction needed
- **EASY TO USE** - No training required
- **MOBILE-FIRST** - Access from phone

---

## Lead Status

| Status | Meaning | Action |
|--------|---------|--------|
| new | Just scraped | Ready for campaign |
| contacted | Email sent | Wait for reply |
| replied | Lead responded | 📢 Notify you |
| interested | Positive response | 📢 Notify you - HOT LEAD |
| trial | Started trial | Nurture |
| paid | Converted | 🎉 Celebrate! |
| bounced | Failed | Remove |

---

## What Happens When Lead Replies?

**The system detects:**
- "Je suis intéressé" → status: interested
- "Comment m'inscrire?" → status: interested
- Trial started → status: trial
- Paid conversion → status: paid

**You get notified via Telegram when:**
- Lead is "interested" or "replied"
- Lead asks specific questions
- Lead converts to paid

Everything else I handle autonomously! 🎯

---

## Quick Stats to Track

| Metric | Target |
|---------|--------|
| Emails sent | 500/day |
| Opens | 40% |
| Replies | 5% |
| Trial signups | 20% of replies |
| Paid conversions | 30% of trials |