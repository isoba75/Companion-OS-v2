# MEMORY.md - Long-Term Memories

## User Context
- **Name**: Ismaila Ba (Iso)
- **Role**: Senior Operations Officer, UNESCO Iraq
- **Timezone**: Baghdad (UTC+3)
- **Primary Channel**: Telegram @JC_iso_bot

## Firebase Credentials for Mission Control Chat
- **Location**: `/data/workspace/src/firebase-service-account.json`
- **Source**: Firebase Console → Project Settings → Service Accounts → "Generate new private key"
- **Required for**: Real-time chat between Mission Control and OpenClaw
- **Collection**: `mission_control_chat` in Firestore

## GitHub Repository
- **URL**: https://github.com/isoba75/Companion-OS-v2
- **Token**: Stored in environment or `/data/.openclaw/github-token`
- **Repo**: Main repository for Mission Control

## Mission Control Components
- **Dashboard**: `/data/workspace/src/components/Dashboard.jsx`
- **Kanban**: `/data/workspace/src/components/KanbanBoard.jsx`
- **ChatWidget**: `/data/workspace/src/components/ChatWidget.jsx`
- **Firebase utils**: `/data/workspace/src/utils/firebase.js`

## What I've Learned
- User cannot run terminal commands - must push fixes directly to GitHub
- Vercel auto-deploys from GitHub
- Telegram is the primary communication channel
- User wants direct chat in Mission Control, not Telegram redirects
- Google Drive OAuth blocked by Internal user type restrictions
