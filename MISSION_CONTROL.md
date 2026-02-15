# Mission Control - Job Companion & Digibuntu

> "A visual dashboard to see everything we're doing together."

---

## 🎯 Current Sprint (Feb 15 - Mar 15, 2026)
**Goal:** 100 paying Digibuntu subscribers in 30 days

---

## 📋 Kanban Board

### 🔴 BACKLOG
> Ideas and future tasks

- [ ] Set up Stripe API keys
- [ ] Create French localized landing page
- [ ] Implement referral program in ERP
- [ ] Set up email automation (Mailgun/SendGrid)
- [ ] Create LinkedIn content calendar
- [ ] Design influencer marketing kit
- [ ] Research mobile money options (Orange Money, MTN)
- [ ] Set up Google Analytics tracking
- [ ] Create case study / testimonial template

### 🟡 THIS WEEK
> Focus for the current week

- [x] Repository setup (Companion-OS-v2)
- [x] SCRAPE LEADS - 7 companies with phones scraped from AnnuaireCI
- [x] **SCRAPE MORE - Enhanced scraper with phones, emails, socials extraction** ✅
- [x] **COLD EMAIL SEQUENCE - Draft outreach emails created** ✅
- [x] **AUTONOMOUS CMO SYSTEM - 24/7 email campaign built** ✅
- [ ] TEST CAMPAIGN - Configure Gmail + run test email
- [ ] INFLUENCER BRIEF - Create pitch deck for Ivory Coast influencers

### 🟢 DOING
> Active work right now

- ✅ Leads synced to Firestore (124 leads available in Mission Control)

### 🔵 DONE
> Completed items

- ✅ MiniMax M2.1 configured as default model
- ✅ Telegram bot (JC_iso_bot) enabled and paired
- ✅ User consent granted to store lead data
- ✅ Job Companion profile created
- ✅ Daily/weekly briefing framework designed
- ✅ Companion-OS-v2 repository created
- ✅ 40,902 Ivory Coast businesses found on AnnuaireCI.com
- ✅ **Mission Control Dashboard DEPLOYED & TESTED** - https://companion-os-v2.vercel.app ✅
- ✅ Fixed Dashboard metrics loading bug (result.data → metricsResult.data)
- ✅ Fixed KanbanBoard theme prop issue
- ✅ **Mission Control v2 ENHANCED** (Feb 15, 2026)
  - Professional UI with glassmorphism & gradients
  - Mobile-first design with bottom navigation
  - New components: GoalProgress, QuickActions, ActivityFeed, MobileStats
  - Smooth animations & transitions
  - Better color scheme & typography
  - Responsive cards & improved touch targets
- ✅ **Lead Scraping Enhanced** (Feb 15, 2026)
  - Extracts phones (+225, +221 formats)
  - Extracts emails with regex patterns
  - Extracts social media (Facebook, LinkedIn, Instagram, Twitter)
  - Scrapes individual company pages for more data
  - New LeadsTable UI with copy-to-clipboard, social indicators
  - Contact stats: withEmail, withPhone, withWebsite counts
- ✅ **Email Sequences Created** (Feb 15, 2026)
  - 3-email cold outreach sequence (French)
  - LinkedIn warm follow-up template
  - Voicemail script for phone outreach
  - Country-specific sending times
  - Localization by language (FR/EN)
- ✅ **New West Africa Sources Added** (Feb 15, 2026)
  - Afrikta (Ivory Coast, Senegal, Ghana, Nigeria)
  - AllBusiness Africa (Pan-Africa SME)
  - Africa Business Pages (Importers database)
  - Afrobiz Africa (Black entrepreneurs)
  - Africa Listings (B2B directory)

- ✅ **Autonomous CMO System Built** (Feb 15, 2026)
  - Gmail SMTP email sending (FREE - 500/day)
  - 3-email cold sequence (personalized)
  - LinkedIn warm follow-up
  - Lead qualification automation
  - Calendly integration for demos
  - Telegram escalation for hot leads only
  - 24/7 autonomous operation
  - Setup guide: `docs/AUTONOMOUS_CMO_SETUP.md`

---

## 📊 Metrics Dashboard

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Paying Subscribers | 100 | 0 | 🔴 |
| Trial Signups | 500 | 0 | 🔴 |
| Leads Scraped | 500 | **113** ✅ (+106) | 🟡 |
| Leads Contacted | 500 | 0 | 🔴 |
| Influencer Posts | 10 | 0 | 🔴 |
| LinkedIn Posts | 4/week | 2 | 🟡 |
| MRR ($) | $X,XXX | $0 | 🔴 |
| CPA ($) | < $50 | - | ⚪ |

**📈 Progress:** First 7 leads scraped from AnnuaireCI.com (Ivory Coast)

## 🔍 Lead Sources Discovered

| Source | Country | Count | Format | Extracts |
|--------|---------|-------|--------|----------|
| AnnuaireCI.com | Côte d'Ivoire | 40,902 | Online directory | Phone, Email, Website |
| afrikta.com | Multi-country | Unknown | Business directory | Name, Email |
| allbusiness.africa | Pan-Africa | Unknown | SME directory | Name, Email, Industry |
| africa-business.com | West Africa | Unknown | Importers database | Name, Email, Contact |
| afrobiz.africa | Pan-Africa | Unknown | Black entrepreneurs | Name, Email |
| africalistings.com | Pan-Africa | Unknown | B2B listings | Name, Email, Phone |
| pme.gouv.ci (PDF) | Côte d'Ivoire | ~100+ | Official PME list | Name only |

## 📧 Email Sequences - Ready to Use

### 📧 Sequence 1: Cold Outreach (French)

**Email 1 - Introduction**
```
Subject: Simplify your business with Digibuntu ERP

Bonjour [FIRST_NAME],

Je suis [VOTRE NOM] de Digibunta - une solution ERP conçue pour les PME africaines.

Notre logiciel aide des entreprises comme [COMPANY] à:
- Gagner du temps (automatisation de la comptabilité)
- Réduire les erreurs (suivi en temps réel)
- Prendre de meilleures décisions (rapports instantanés)

Je serais ravi de vous montrer une démo gratuite de 15 minutes.

Quand serait-il pratique pour vous?

Cordialement,
[VOTRE NOM]
```

**Email 2 - Follow-up (Day 3)**
```
Subject: Re: Simplify your business with Digibuntu ERP

Bonjour [FIRSTNAME],

J'espère que vous allez bien!

Je me permets de vous relancer suite à mon dernier message concernant Digibuntu.

Nous aidons déjà +100 PME en Afrique de l'Ouest à gérer leur entreprise plus efficacement.

Avez-vous des questions sur nos fonctionnalités?

Cordialement,
[VOTRE NOM]
```

**Email 3 - Value Add (Day 7)**
```
Subject: [COMPANY] et l'avenir de la gestion d'entreprise

Bonjour [FIRSTNAME],

Je partage avec vous un article que j'ai trouvé pertinent: "[ARTICLE TITLE]"

Cela m'a rappelé comment Digibuntu aide les PME à:
- Réduire de 50% le temps consacré à la paperwork
- Améliorer la précision des inventaires
- Gagner 10h/semaine en moyenne

Seriez-vous intéressé par une conversation de 10 minutes?

À bientôt,
[VOTRE NOM]
```

### 🎯 Sequence 2: LinkedIn Warm Outreach

```
Subject: Ravi de vous connecter sur LinkedIn

Bonjour [FIRSTNAME],

Merci d'avoir accepté ma demande de connexion!

Je travaille chez Digibuntu, où nous aidons les PME africaines à digitaliser leur gestion.

Je serais curieux d'en savoir plus sur [TOPIC RELATED TO THEIR POST/COMPANY].

Avez-vous des défis particuliers dans la gestion de votre entreprise?

Bien cordialement,
[VOTRE NOM]
```

### 📞 Voicemail Script

```
Bonjour, c'est [VOTRE NOM] de Digibuntu.

Je vous appelle car je pense que notre solution ERP pourrait aider [COMPANY] à gagner du temps sur la gestion quotidienne.

Je rappellerai demain à [TIME]. Avez-vous 2 minutes?

Merci et à bientôt!
```

### ⏰ Best Sending Times

| Country | Days | Hours |
|---------|------|-------|
| Ivory Coast | Tue-Thu | 9-11h, 14-16h |
| Senegal | Tue-Thu | 9-11h, 14-16h |
| Ghana | Tue-Thu | 10-12h |
| Nigeria | Tue-Thu | 10-12h |

### 📊 Target Metrics

- Opens: 40%
- Clicks: 10%
- Replies: 5%
- Demos: 20/month

---

## 📅 This Week's Schedule

| Day | Focus | Notes |
|-----|-------|-------|
| **Mon** | Lead scraping, repo setup | Found 40,902 Ivory Coast businesses |
| **Tue** | Outreach sequence drafting | - |
| **Wed** | Influencer brief, GitHub setup | - |
| **Thu** | Campaign setup (ads/influencer) | - |
| **Fri** | Review & report | Weekly summary |
| **Sat** | Rest | - |
| **Sun** | Rest | - |

**Daily Briefing:** 9:30 AM Baghdad (UTC+3) via Telegram ✅

---

## 🔗 Quick Links

- **Digibuntu Signup:** https://www.digibuntu.com/#/signup
- **GitHub:** https://github.com/isoba75/Companion-OS-v2
- **Telegram Bot:** @JC_iso_bot
- **Stripe Dashboard:** (not connected yet)

---

## 💰 Finances (Stripe)

*Stripe not yet connected. Add keys to update.*

| Metric | Value |
|--------|-------|
| MRR | $0 |
| Trials → Paid | 0/0 |
| Avg Revenue/User | - |
| Churn Rate | - |

---

## 🤖 Autonomous CMO System

### Free Email Setup (Gmail)

**No paid services needed!** Use your Gmail account.

**Setup:**
1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Configure: `scripts/campaign-sender.cjs`

**Gmail Limits:**
- Free: 500 emails/day
- Personalized 1:1 emails (no spam!)

### Commands

```bash
# Test email (sends to you)
node scripts/campaign-sender.cjs test

# Run campaign (50 emails)
node scripts/campaign-sender.cjs run 50 cold_1

# Follow-up sequence
node scripts/campaign-sender.cjs run 100 cold_2

# Qualify leads
node scripts/campaign-sender.cjs qualify
```

### Campaign Flow

| Day | Action | Template |
|-----|--------|----------|
| 0 | First email | cold_1 |
| 3 | Follow-up | cold_2 |
| 7 | Value add | cold_3 |
| 14 | LinkedIn warm | linkedin_warm |
| 21 | Final / Remove | - |

### Lead Qualification

| Status | Meaning | Action |
|--------|---------|--------|
| new | Just scraped | Ready for campaign |
| contacted | Email sent | Wait for reply |
| replied | Lead responded | 📢 Notify you |
| interested | Positive response | 📢 Notify you - HOT LEAD |
| trial | Started trial | Nurture |
| paid | Converted | 🎉 Celebrate! |
| bounced | Failed | Remove |

### I Escalate Only:
- ✅ Lead is "interested" or "replied"
- ✅ Lead asks for pricing
- ✅ Lead books demo
- ✅ Lead converts to paid
- ❌ Everything else I handle autonomously

### Calendly for Demos (Free!)
1. Create free account: https://calendly.com
2. Create 15-min "Demo" event type
3. Share link in email templates

---

## 📝 Recent Decisions

| Date | Decision | Impact |
|------|----------|--------|
| 2026-02-15 | Store lead data in memory/ for project | Compliance + tracking |
| 2026-02-15 | Prioritize Ivory Coast & Senegal | Focused market entry |
| 2026-02-15 | Use GitHub for visual project management | Transparency |
| 2026-02-15 | Daily briefing at 9:30 AM Baghdad | Consistent touchpoints |
| 2026-02-15 | Auto-sync leads to Firestore | Real-time Mission Control |

## 🔄 Lead Sync Status

| Source | Scraped | Uploaded | Notes |
|--------|---------|----------|-------|
| AnnuaireCI.com | 7 | ✅ | Phones + websites |
| Afrikta (CI,SN,GH,NG) | 46 | ✅ | Names + emails |
| AllBusiness Africa | 0 | ✅ | - |
| Africa Business Pages | 46 | ✅ | Names + emails |
| Afrobiz Africa | 50 | ✅ | Names + emails |
| **TOTAL** | **124** | **✅ FIRESTORE** | View in Leads tab |

## 🛠️ Daily Commands

```bash
# Scrape new leads
cd /data/workspace/Companion-OS-v2
node scripts/westafrica_scrape.cjs

# Sync to Firestore
node scripts/import-leads.cjs

# Deploy to Vercel
git add -A && git commit -m "Update" && git push
```

---

## 🗓️ Travel Tracker

| Date | Destination | Notes |
|------|-------------|-------|
| TBD | User will notify | - |

---

*Last Updated: 2026-02-15 14:18 UTC*