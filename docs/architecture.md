# Architecture - Companion-OS v2

## Overview

Dynamic Mission Control system for Job Companion business operations.

## Components

### 1. Mission Control Dashboard
- **Files:** `MISSION_CONTROL.md`, `memory/job-companion.md`
- **Type:** Markdown + Kanban
- **Sync:** Manual updates via Git

### 2. Lead Management
- **Files:** `memory/digibuntu-leads.csv`, `scripts/scrape_leads.py`
- **Source:** African business directories
- **Automation:** Python scripts via cron

### 3. Task Management
- **Tools:** GitHub Projects
- **Columns:** Backlog, This Week, Doing, Done
- **Sync:** Real-time via GitHub API

### 4. Financial Tracking
- **Source:** Stripe API (pending)
- **Metrics:** MRR, Trials, Churn, CPA

### 5. Communication
- **Telegram:** Daily briefings, notifications
- **OpenClaw:** Cron jobs, automation

## Data Flow

```
Directories → Scrape → CSV → Review → Outreach → Stripe → Metrics
                    ↓
              Mission Control (Kanban + Dashboard)
```

## Environment Variables

See `.env.example` for required configuration.

## Deployment

- **Frontend:** Vercel (automatic on push to main)
- **Backend:** Node.js / OpenClaw
- **Database:** CSV files + External APIs