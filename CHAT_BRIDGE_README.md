# Mission Control Chat Bridge

## Setup Instructions

### Step 1: Get Firebase Admin Service Account

1. Go to Firebase Console: https://console.firebase.google.com/project/companion-os-v2
2. Go to **Project Settings** (gear icon)
3. Scroll to **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Replace the contents of `src/firebase-service-account.json` with the downloaded file

### Step 2: Enable Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Start in **Test mode** for development
4. Collection name: `mission_control_chat`

### Step 3: Run the Chat Bridge

```bash
node chat-bridge.cjs
```

### Step 4: Set up Cron Job

Add to OpenClaw cron to run every minute:

```json
{
  "name": "Chat Bridge",
  "schedule": "* * * * *",
  "payload": { "kind": "agentTurn", "message": "Run chat-bridge.cjs" },
  "sessionTarget": "isolated"
}
```

## What It Does

- Checks Firestore for new user messages every minute
- Generates AI responses
- Saves responses back to Firestore
- Frontend polls for new messages

## Demo Mode

Currently running in demo mode with simulated responses. Once the service account is configured, it will use real Firestore.
