# Companion-OS v2 Frontend

React + Vite frontend for Companion-OS Mission Control

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts (ready for future)
- **PapaParse** - CSV parsing

## Getting Started

### Install Dependencies

```bash
cd Companion-OS-v2
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Build for Production

```bash
npm run build
```

## Features

- 📊 **Dashboard** - Real-time metrics with progress bars
- 📋 **Kanban Board** - Drag & drop task management
- 👥 **Leads Table** - CSV import/export, filtering, search
- 💰 **Finance Panel** - Stripe integration ready
- 📧 **Outreach** - Email sequence management
- ⚙️ **Settings** - API configuration

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_STRIPE_KEY=pk_test_xxx
VITE_TELEGRAM_CHAT_ID=xxx
```

## Deployment

Deploy to Vercel with zero-config:

```bash
vercel --prod
```

Or connect your GitHub repo at https://vercel.com

## Structure

```
src/
├── App.jsx              # Main layout with navigation
├── main.jsx             # Entry point
├── index.css            # Tailwind styles
└── components/
    ├── Dashboard.jsx    # Metrics dashboard
    ├── KanbanBoard.jsx # Task kanban
    ├── LeadsTable.jsx  # Lead management
    └── FinancePanel.jsx # Financial metrics
```

## License

MIT