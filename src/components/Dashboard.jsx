import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Brain, Zap, FileText, Target, TrendingUp as Growth, ExternalLink, Building2, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { getTasks, getMetrics } from '../utils/firebase';

const defaultMetrics = {
  missionReports: { value: 5, target: 10, status: 'blue', label: 'Mission Reports' },
  tasksCompleted: { value: 0, target: 20, status: 'green', label: 'Tasks Completed' },
  followUps: { value: 2, target: 15, status: 'yellow', label: 'Follow-ups Pending' }
};

const products = [
  { name: 'AgriBuntu', focus: true, url: 'https://www.agribuntu.com', status: 'Current Focus', description: 'Agriculture ERP' },
  { name: 'DigiBuntu', url: 'https://www.digibuntu.com', status: 'Promoting', description: 'ERP for SMEs (XOF/XAF)' },
  { name: 'JobSage', url: 'https://www.jobsage.io', status: 'Active', description: 'Job SaaS' },
  { name: 'LearnBuntu', url: 'https://www.learnbuntu.com', status: 'Active', description: 'Learning Platform' }
];

const businessAlerts = [
  { type: 'priority', text: 'Weekend business session pending - schedule needed', icon: Clock },
  { type: 'info', text: '5 mission reports in Notion database', icon: CheckCircle },
  { type: 'action', text: 'Autonomous Lead Scraper needs attention', icon: Target }
];

function MetricCard({ title, value, target, status, theme }) {
  const percentage = target > 0 ? Math.round((value / target) * 100) : 0;
  const statusColors = { red: 'status-red', yellow: 'status-yellow', green: 'status-green', blue: 'status-blue' };
  const barColors = { red: 'bg-red-400', yellow: 'bg-yellow-400', green: 'bg-green-400', blue: 'bg-blue-400' };

  return (
    <div className={`card p-4 bg-gradient-to-br ${status === 'red' ? 'from-red-500/20 to-red-500/5 border-red-500/30' : status === 'yellow' ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30' : status === 'green' ? 'from-green-500/20 to-green-500/5 border-green-500/30' : 'from-blue-500/20 to-blue-500/5 border-blue-500/30'} border metric-card`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status] || 'status-blue'}`}>{percentage}%</div>
        {percentage >= 100 ? <CheckCircle className="w-4 h-4 text-green-400" /> : null}
      </div>
      <div className="mb-2">
        <h3 className="text-xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{title}</p>
      </div>
      <div className={`h-1.5 rounded-full ${theme === 'light' ? 'bg-slate-700' : 'bg-slate-700'}`}>
        <div className={`h-full rounded-full transition-all ${barColors[status] || barColors.blue}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  );
}

function ProductCard({ product, theme }) {
  return (
    <a href={product.url} target="_blank" rel="noopener noreferrer" className={`card p-4 hover:border-primary-500/50 transition-all group ${product.focus ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold group-hover:text-primary-400 transition-colors">{product.name}</h4>
        {product.focus && <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded">FOCUS</span>}
      </div>
      <p className={`text-xs mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{product.description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{product.status}</span>
        <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </a>
  );
}

function AlertCard({ alert, theme }) {
  const types = {
    priority: { bg: 'bg-red-500/10 border-red-500/30', icon: 'text-red-400', text: 'text-red-400' },
    action: { bg: 'bg-yellow-500/10 border-yellow-500/30', icon: 'text-yellow-400', text: 'text-yellow-400' },
    info: { bg: 'bg-blue-500/10 border-blue-500/30', icon: 'text-blue-400', text: 'text-blue-400' }
  };
  const style = types[alert.type] || types.info;
  const Icon = alert.icon;

  return (
    <div className={`card p-3 border ${style.bg} flex items-start gap-3`}>
      <Icon className={`w-4 h-4 mt-0.5 ${style.icon}`} />
      <span className={`text-sm ${style.text}`}>{alert.text}</span>
    </div>
  );
}

function Dashboard({ tasks = {}, theme }) {
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [currentMode, setCurrentMode] = useState('business'); // business, personal

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    setLastSync(new Date());
    const metricsResult = await getMetrics();
    if (metricsResult.success && metricsResult.data) {
      const newMetrics = { ...defaultMetrics };
      Object.keys(metricsResult.data).forEach(key => {
        if (newMetrics[key]) newMetrics[key] = { ...newMetrics[key], ...metricsResult.data[key] };
      });
      setMetrics(newMetrics);
    }
    setIsLoading(false);
  };

  const activeTasks = tasks.doing?.length || 0;
  const completedTasks = tasks.done?.length || 0;
  const thisWeekTasks = tasks.thisWeek?.length || 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button 
          onClick={() => setCurrentMode('business')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentMode === 'business' ? 'bg-primary-500 text-white' : theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}
        >
          🤝 CEO Mode
        </button>
        <button 
          onClick={() => setCurrentMode('personal')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentMode === 'personal' ? 'bg-green-500 text-white' : theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}
        >
          💜 Personal
        </button>
      </div>

      {/* Business Mode */}
      {currentMode === 'business' && (
        <>
          {/* JC Header */}
          <div className={`card p-6 bg-gradient-to-r from-primary-600/20 to-primary-600/5 border-primary-500/30`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-6 h-6 text-primary-400" />
                  <h2 className="text-xl font-bold">JC — Job Companion</h2>
                </div>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  Inception Phase • Learning Mode • AgriBuntu Focus
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Last Sync</p>
                <p className="font-mono text-sm">{lastSync.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Business Alerts */}
          <div className="grid gap-3">
            {businessAlerts.map((alert, idx) => (
              <AlertCard key={idx} alert={alert} theme={theme} />
            ))}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard title="Mission Reports" value={metrics.missionReports?.value || 5} target={metrics.missionReports?.target || 10} status={metrics.missionReports?.status || 'blue'} theme={theme} />
            <MetricCard title="Tasks Completed" value={metrics.tasksCompleted?.value || 0} target={metrics.tasksCompleted?.target || 20} status={metrics.tasksCompleted?.status || 'green'} theme={theme} />
            <MetricCard title="Follow-ups" value={metrics.followUps?.value || 2} target={metrics.followUps?.target || 15} status={metrics.followUps?.status || 'yellow'} theme={theme} />
          </div>

          {/* Products Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-400" />
              JC Products
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products.map(product => (
                <ProductCard key={product.name} product={product} theme={theme} />
              ))}
            </div>
          </div>

          {/* Notion Integration */}
          <div className={`card p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium">Notion Mission Reports</p>
                  <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>5 reports synced</p>
                </div>
              </div>
              <a href="https://www.notion.so/30b05808d49b8156a6c2fd954522c298" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs bg-primary-500/20 text-primary-400 rounded hover:bg-primary-500/30 transition-colors">
                View Database →
              </a>
            </div>
          </div>
        </>
      )}

      {/* Personal Mode */}
      {currentMode === 'personal' && (
        <>
          <div className={`card p-6 bg-gradient-to-r from-green-600/20 to-green-600/5 border-green-500/30`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💜</span>
              <h2 className="text-xl font-bold">Personal Assistant Mode</h2>
            </div>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              Always here to help with personal tasks, finances, and wellbeing.
            </p>
          </div>

          {/* Personal Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="font-medium">Finances</p>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Track & manage</p>
            </div>
            <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
              <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-medium">Crypto</p>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Watch & trade</p>
            </div>
            <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="font-medium">Health</p>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Track & improve</p>
            </div>
            <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
              <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="font-medium">Agenda</p>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Baghdad ↔ Paris</p>
            </div>
          </div>
        </>
      )}

      {/* Task Summary (Always Visible) */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-2xl font-bold text-yellow-400">{thisWeekTasks}</div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>This Week</div>
        </div>
        <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-2xl font-bold text-blue-400">{activeTasks}</div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>In Progress</div>
        </div>
        <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-2xl font-bold text-green-400">{completedTasks}</div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Completed</div>
        </div>
      </div>

      {/* System Status */}
      <div className={`card p-3 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400">System Active</span>
          </div>
          <span className={`${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>🤝 JC Ready</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
