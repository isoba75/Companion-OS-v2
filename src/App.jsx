import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Kanban, 
  Mail, 
  Settings,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Calendar,
  Globe
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import LeadsTable from './components/LeadsTable';
import FinancePanel from './components/FinancePanel';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban', label: 'Tasks', icon: Kanban },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'outreach', label: 'Outreach', icon: Mail },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Sample data - will be replaced with real data from APIs/CSV
const sampleMetrics = {
  payingSubscribers: { value: 0, target: 100, trend: 0, status: 'red' },
  trialSignups: { value: 0, target: 500, trend: 0, status: 'red' },
  leadsScraped: { value: 0, target: 500, trend: 0, status: 'red' },
  leadsContacted: { value: 0, target: 500, trend: 0, status: 'red' },
  mrr: { value: 0, target: 5000, trend: 0, status: 'red' },
  cpa: { value: 0, target: 50, trend: 0, status: 'blue' },
};

const sampleTasks = {
  backlog: [
    { id: 1, title: 'Set up Stripe API keys', tag: 'Finance', priority: 'high' },
    { id: 2, title: 'Create French landing page', tag: 'Marketing', priority: 'medium' },
    { id: 3, title: 'Implement referral program', tag: 'Product', priority: 'low' },
    { id: 4, title: 'Research mobile money options', tag: 'Payments', priority: 'medium' },
  ],
  thisWeek: [
    { id: 5, title: 'Scrape 500+ SME contacts', tag: 'Lead Gen', priority: 'high' },
    { id: 6, title: 'Create influencer pitch deck', tag: 'Marketing', priority: 'high' },
    { id: 7, title: 'Draft cold email sequence', tag: 'Outreach', priority: 'high' },
  ],
  doing: [
    { id: 8, title: 'Build Mission Control UI', tag: 'Dev', priority: 'high' },
  ],
  done: [
    { id: 9, title: 'Configure MiniMax M2.1', tag: 'Dev', priority: 'medium' },
    { id: 10, title: 'Set up Telegram bot', tag: 'Communication', priority: 'medium' },
    { id: 11, title: 'Create Companion-OS repo', tag: 'Dev', priority: 'medium' },
  ],
};

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [metrics, setMetrics] = useState(sampleMetrics);
  const [tasks, setTasks] = useState(sampleTasks);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard metrics={metrics} tasks={tasks} />;
      case 'kanban':
        return <KanbanBoard tasks={tasks} setTasks={setTasks} />;
      case 'leads':
        return <LeadsTable />;
      case 'finance':
        return <FinancePanel />;
      case 'outreach':
        return <OutreachPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard metrics={metrics} tasks={tasks} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 p-4 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Companion-OS</h1>
            <p className="text-xs text-slate-400">v2.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Status */}
        <div className="mt-auto pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span>System Active</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>Sprint: Feb 15 - Mar 15</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 px-6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">
              {navItems.find(item => item.id === activeView)?.label}
            </h2>
            <p className="text-xs text-slate-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className="btn-secondary flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <a 
              href="https://github.com/isoba75/Companion-OS-v2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

function OutreachPanel() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Email Outreach</h3>
      <p className="text-slate-400">Cold email sequences will appear here.</p>
      <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
        <p className="text-sm text-slate-500">Configure SendGrid API to enable email outreach.</p>
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">Stripe API Key</label>
          <input type="password" className="input w-full" placeholder="sk_test_xxx" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-2">Telegram Chat ID</label>
          <input type="text" className="input w-full" placeholder="5353203302" />
        </div>
        <button className="btn-primary">Save Settings</button>
      </div>
    </div>
  );
}

export default App;