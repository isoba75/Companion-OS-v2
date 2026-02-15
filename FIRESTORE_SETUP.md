# Firestore Setup - Companion-OS v2

## Already Configured

Your Firebase project is ready:
- **Project ID:** `companion-os-v2`
- **Firestore:** Active
- **Authentication:** Active

## Initial Setup (Run Once)

```bash
cd scripts
node migrate-firestore.js
```

This will:
1. ✅ Clear any existing leads
2. ✅ Migrate leads from CSV to Firestore
3. ✅ Seed metrics (MRR, trials, etc.)
4. ✅ Seed tasks (kanban board)

## Frontend Integration

The frontend now reads/writes to Firestore:

```
src/
├── utils/
│   └── firebase.js      ← Firestore client
├── components/
│   ├── Dashboard.jsx     ← Reads metrics from Firestore
│   └── LeadsTable.jsx   ← CRUD operations on leads
```

## Data Structure

### Collection: `leads`
```json
{
  "company": "MAQUIS LE BANANIER",
  "website": "https://annuaireci.com/...",
  "email": "contact@...",
  "phone": "+225 07 47 73 52 14",
  "industry": "",
  "country": "Côte d'Ivoire",
  "source": "annuaireci.com",
  "date_scraped": "2026-02-15",
  "status": "new",  // new | contacted | trial | paid | churned
  "notes": "",
  "createdAt": "2026-02-15T14:00:00.000Z",
  "updatedAt": "2026-02-15T14:00:00.000Z"
}
```

### Collection: `metrics`
```json
{
  "id": "payingSubscribers",
  "value": 0,
  "target": 100,
  "trend": 0,
  "status": "red"  // red | yellow | green | blue
}
```

### Collection: `tasks`
```json
{
  "title": "Scrape 500+ SME contacts",
  "tag": "Lead Gen",
  "priority": "high",
  "status": "thisWeek"  // backlog | thisWeek | doing | done
}
```

## Firestore Console

View your data at:
https://console.firebase.google.com/project/companion-os-v2/firestore

## Security Rules (Important!)

For development, your rules should allow read/write:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // For development only!
    }
  }
}
```

**⚠️ For production, add authentication and authorization rules.**

## Deployment

Push to GitHub - Vercel auto-deploys.

```bash
git add .
git commit -m "feat: Add Firestore integration"
git push origin main
```

## Rollback

If you want to go back to CSV:

1. Export from Firestore Console
2. Save as `memory/digibuntu-leads.csv`
3. Frontend will use local file (requires code change)