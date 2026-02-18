import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Brain, Kanban, Settings,
  Sun, Moon, Menu, X, Zap, Bell, Loader2
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import ChatWidget from './components/ChatWidget';
import { getTasks, createTask, updateTaskStatus, deleteTask } from './utils/firebase';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'kanban', label: 'Tasks', icon: Kanban },
  { id: 'second-brain', label: 'Second Brain', icon: Brain },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const defaultTasks = {
  backlog: [],
  thisWeek: [],
  doing: [],
  done: []
};

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [tasks, setTasks] = useState(defaultTasks);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState('user');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('companion-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const loadTasks = async () => {
    setIsLoadingTasks(true);
    const result = await getTasks();
    if (result.success && result.data) {
      setTasks(result.data);
      setLastUpdated(new Date());
    }
    setIsLoadingTasks(false);
  };

  const handleCreateTask = async (taskData) => {
    const result = await createTask(taskData);
    if (result.success) loadTasks();
  };

  const handleMoveTask = async (taskId, newStatus) => {
    await updateTaskStatus(taskId, newStatus);
    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach(status => {
        newTasks[status] = newTasks[status].filter(t => t.id !== taskId);
      });
      return newTasks;
    });
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
    loadTasks();
  };

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('companion-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard tasks={tasks} theme={theme} />;
      case 'kanban': return (
        <KanbanBoard 
          tasks={tasks} 
          theme={theme} 
          onMoveTask={handleMoveTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleCreateTask}
          isLoading={isLoadingTasks}
          viewMode={taskViewMode}
          setViewMode={setTaskViewMode}
        />
      );
      case 'second-brain': return <SecondBrain theme={theme} />;
      case 'settings': return <SettingsPanel theme={theme} toggleTheme={toggleTheme} />;
      default: return <Dashboard tasks={tasks} theme={theme} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-900 text-white'} overflow-x-hidden`}>
      <aside className={`hidden md:flex flex-col w-64 ${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border-r border-slate-200' : 'bg-slate-800/80 backdrop-blur-xl border-r border-slate-700'} fixed h-full z-10 p-4`}>
        <Logo theme={theme} />
        <Nav navItems={navItems} activeView={activeView} setActiveView={handleNavClick} theme={theme} />
        <Status theme={theme} />
      </aside>

      <header className={`md:hidden fixed top-0 left-0 right-0 z-30 ${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200' : 'bg-slate-800/80 backdrop-blur-xl border-b border-slate-700'} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <Logo theme={theme} compact />
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-700 hover:bg-slate-600'}`}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && <div className="md:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`md:hidden fixed top-0 right-0 h-full w-72 z-30 transform ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} p-4 pt-20`}>
        <Logo theme={theme} />
        <Nav navItems={navItems} activeView={activeView} setActiveView={handleNavClick} theme={theme} />
        <Status theme={theme} />
      </aside>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-20 ${theme === 'light' ? 'bg-white/90 backdrop-blur-xl border-t border-slate-200' : 'bg-slate-800/90 backdrop-blur-xl border-t border-slate-700'} pb-safe`}>
        <MobileNav navItems={navItems} activeView={activeView} setActiveView={handleNavClick} theme={theme} />
      </nav>

      <main className="flex-1 md:ml-64 pt-16 md:pt-0 pb-24 md:pb-0 overflow-auto">
        <header className={`hidden md:flex items-center justify-between px-6 py-4 sticky top-0 z-10 ${theme === 'light' ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200' : 'bg-slate-800/80 backdrop-blur-xl border-b border-slate-700'}`}>
          <div>
            <h2 className="font-semibold text-lg">{navItems.find(item => item.id === activeView)?.label}</h2>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLastUpdated(new Date())} className={`p-2 rounded-lg ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>
              <Loader2 className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-lg relative ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}>
              <Bell className="w-5 h-5" />
              {notifications > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{notifications}</span>}
            </button>
          </div>
        </header>
        <div className="p-4 md:p-6 pb-safe">{renderView()}</div>
        <ChatWidget theme={theme} />
      </main>
    </div>
  );
}

function Logo({ theme, compact }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'mb-8'}`}>
      <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg">
        <Brain className="w-6 h-6 text-white" />
      </div>
      {!compact && (
        <div>
          <h1 className="font-bold text-lg">Second Brain</h1>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>UN Mission Assistant</p>
        </div>
      )}
    </div>
  );
}

function Nav({ navItems, activeView, setActiveView, theme }) {
  return (
    <nav className="flex-1 space-y-1">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg' : theme === 'light' ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-700 text-slate-300'}`} style={{ animationDelay: `${index * 0.05}s` }}>
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
    <div className="flex justify-around py-2 px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button key={item.id} onClick={() => setActiveView(item.id)} className={`mobile-nav-item flex-1 rounded-xl transition-all ${isActive ? 'text-primary-500' : ''}`}>
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-primary-100 dark:bg-primary-900/30' : ''}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium mt-1">{item.label}</span>
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
        <div className="relative"><Zap className="w-4 h-4 text-green-500" /><div className="absolute inset-0 w-4 h-4 text-green-500 animate-ping opacity-50" /></div>
        <span>System Active</span>
      </div>
    </div>
  );
}

function SecondBrain({ theme }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className={`card p-6 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <h3 className="text-lg font-semibold mb-4">📥 Second Brain - Inbox</h3>
        <p className={`text-sm mb-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
          Dump anything here - notes, ideas, meeting snippets, quotes, links. I'll process and organize.
        </p>
        <textarea 
          className={`w-full h-32 p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'} border border-slate-700 resize-none`}
          placeholder="Type anything you want to remember..."
        />
        <button className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">Process & Store</button>
      </div>

      <div className={`card p-6 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <h3 className="text-lg font-semibold mb-4">📄 Mission Templates</h3>
        <div className="space-y-3">
          <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}>
            <h4 className="font-medium">UNESCO Mission Report</h4>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Official template with 6 mandatory sections</p>
          </div>
          <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}>
            <h4 className="font-medium">Quick-Fill Form</h4>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Fill in blanks, generate report</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ theme, toggleTheme }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className={`card p-6 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <h3 className="text-lg font-semibold mb-6">Settings</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-medium">Theme</p>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{theme === 'light' ? 'Light mode' : 'Dark mode'}</p>
              </div>
            </div>
            <button onClick={toggleTheme} className={`relative w-14 h-8 rounded-full ${theme === 'light' ? 'bg-slate-300' : 'bg-primary-600'}`}>
              <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${theme === 'light' ? 'left-1' : 'left-7'}`} />
            </button>
          </div>
        </div>
      </div>
      <div className={`card p-6 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <h4 className="font-medium mb-4">About</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-400' : 'text-slate-500'}>Version</span><span>2.0.0</span></div>
          <div className="flex justify-between"><span className={theme === 'light' ? 'text-slate-400' : 'text-slate-500'}>Role</span><span>UN Mission Assistant</span></div>
        </div>
      </div>
    </div>
  );
}

export default App;