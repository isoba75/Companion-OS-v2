import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, DollarSign, Kanban, Settings,
  RefreshCw, Sun, Moon, Menu, X, Zap
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
  { id: 'settings', label: 'Settings', icon: Settings },
];

const sampleTasks = {
  backlog: [
    { id: 1, title: 'Set up Stripe API keys', tag: 'Finance', priority: 'high' },
    { id: 2, title: 'Create French landing page', tag: 'Marketing', priority: 'medium' },
    { id: 3, title: 'Implement referral program', tag: 'Product', priority: 'low' },
  ],
  thisWeek: [
    { id: 5, title: 'Scrape 500+ SME contacts', tag: 'Lead Gen', priority: 'high' },
    { id: 6, title: 'Create influencer pitch deck', tag: 'Marketing', priority: 'high' },
  ],
  doing: [
    { id: 8, title: 'Build Mission Control UI', tag: 'Dev', priority: 'high' },
  ],
  done: [
    { id: 9, title: 'Configure MiniMax M2.1', tag: 'Dev', priority: 'medium' },
    { id: 10, title: 'Deploy to Vercel', tag: 'Dev', priority: 'medium' },
  ],
};

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [tasks, setTasks] = useState(sampleTasks);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('companion-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('companion-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard tasks={tasks} theme={theme} />;
      case 'kanban': return <KanbanBoard tasks={tasks} setTasks={setTasks} theme={theme} />;
      case 'leads': return <LeadsTable theme={theme} />;
      case 'finance': return <FinancePanel theme={theme} />;
      case 'settings': return <SettingsPanel theme={theme} toggleTheme={toggleTheme} />;
      default: return <Dashboard tasks={tasks} theme={theme} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'}`}>
      
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 ${theme === 'light' ? 'bg-white border-r border-slate-200' : 'bg-slate-800 border-r border-slate-700'} fixed h-full z-10 p-4`}>
        <Logo theme={theme} />
        <Nav navItems={navItems} activeView={activeView} setActiveView={setActiveView} theme={theme} />
        <Status theme={theme} />
      </aside>

      {/* Mobile Header */}
      <header className={`md:hidden flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-20 ${theme === 'light' ? 'bg-white border-b border-slate-200' : 'bg-slate-800 border-b border-slate-700'}`}>
        <Logo theme={theme} compact />
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`p-2 rounded-full ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2 rounded-full ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-20 pb-4 ${theme === 'light' ? 'bg-white border-t border-slate-200' : 'bg-slate-800 border-t border-slate-700'}`}>
        <MobileNav navItems={navItems} activeView={activeView} setActiveView={setActiveView} theme={theme} />
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 overflow-auto">
        <Header activeView={activeView} lastUpdated={lastUpdated} theme={theme} />
        <div className="p-4 md:p-6">{renderView()}</div>
      </main>
    </div>
  );
}

function Logo({ theme, compact }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'mb-8'}`}>
      <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
        <Zap className="w-6 h-6 text-white" />
      </div>
      {!compact && (
        <div>
          <h1 className="font-bold text-lg">Companion-OS</h1>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>v2.0</p>
        </div>
      )}
    </div>
  );
}

function Nav({ navItems, activeView, setActiveView, theme }) {
  return (
    <nav className="flex-1 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function MobileNav({ navItems, activeView, setActiveView, theme }) {
  return (
    <div className="flex justify-around py-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2 ${isActive ? 'text-primary-600' : theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Status({ theme }) {
  return (
    <div className={`pt-4 border-t mt-auto ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
      <div className={`flex items-center gap-2 text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
        <Zap className="w-4 h-4 text-green-500" />
        <span>System Active</span>
      </div>
    </div>
  );
}

function Header({ activeView, lastUpdated, theme }) {
  return (
    <header className={`hidden md:flex items-center justify-between px-6 py-4 ${theme === 'light' ? 'bg-white/50 border-b border-slate-200' : 'bg-slate-800/50 border-b border-slate-700'}`}>
      <div>
        <h2 className="font-semibold text-lg">{navItems.find(item => item.id === activeView)?.label}</h2>
        <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Last updated: {lastUpdated.toLocaleTimeString()}</p>
      </div>
    </header>
  );
}

function SettingsPanel({ theme, toggleTheme }) {
  return (
    <div className={`card p-6 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
      <h3 className="text-lg font-semibold mb-4">Settings</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <div>
              <p className="font-medium">Theme</p>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{theme === 'light' ? 'Light mode' : 'Dark mode'}</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full transition-colors ${theme === 'light' ? 'bg-slate-300' : 'bg-primary-600'}`}
          >
            <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow ${theme === 'light' ? 'left-1' : 'left-7'}`} />
          </button>
        </div>
        
        <div>
          <h4 className="font-medium mb-3">API Keys</h4>
          <div className="space-y-3">
            <div>
              <label className={`block text-sm mb-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Stripe Secret Key</label>
              <input type="password" className={`input w-full ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`} placeholder="sk_test_xxx" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;