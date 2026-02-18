import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Brain, Zap, FileText } from 'lucide-react';
import { getTasks, getMetrics } from '../utils/firebase';

const defaultMetrics = {
  missionReports: { value: 0, target: 10, status: 'blue', label: 'Mission Reports' },
  capturesProcessed: { value: 0, target: 50, status: 'green', label: 'Captures Processed' },
  tasksCompleted: { value: 0, target: 20, status: 'green', label: 'Tasks Completed' },
  followUps: { value: 0, target: 15, status: 'yellow', label: 'Follow-ups Pending' }
};

function MetricCard({ title, value, target, status, theme }) {
  const percentage = target > 0 ? Math.round((value / target) * 100) : 0;
  const statusColors = { red: 'status-red', yellow: 'status-yellow', green: 'status-green', blue: 'status-blue' };
  const barColors = { red: 'bg-red-400', yellow: 'bg-yellow-400', green: 'bg-green-400', blue: 'bg-blue-400' };

  return (
    <div className={`card p-5 bg-gradient-to-br ${status === 'red' ? 'from-red-500/20 to-red-500/5 border-red-500/30' : status === 'yellow' ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30' : status === 'green' ? 'from-green-500/20 to-green-500/5 border-green-500/30' : 'from-blue-500/20 to-blue-500/5 border-blue-500/30'} border metric-card`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[status] || 'status-blue'}`}>{percentage}%</div>
        {percentage >= 100 ? <TrendingUp className="w-5 h-5 text-green-400" /> : null}
      </div>
      <div className="mb-3">
        <h3 className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{title}</p>
      </div>
      <div className={`progress-bar h-2 mb-2`}>
        <div className={`h-full rounded-full transition-all duration-500 ${barColors[status] || barColors.blue}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      <p className={`text-xs opacity-60`}>Target: {target.toLocaleString()}</p>
    </div>
  );
}

function Dashboard({ tasks = {}, theme }) {
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());

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
      {/* Metrics */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        <MetricCard title="Mission Reports" value={metrics.missionReports?.value || 0} target={metrics.missionReports?.target || 10} status={metrics.missionReports?.status || 'blue'} theme={theme} />
        <MetricCard title="Captures Processed" value={metrics.capturesProcessed?.value || 0} target={metrics.capturesProcessed?.target || 50} status={metrics.capturesProcessed?.status || 'green'} theme={theme} />
        <MetricCard title="Tasks Completed" value={metrics.tasksCompleted?.value || 0} target={metrics.tasksCompleted?.target || 20} status={metrics.tasksCompleted?.status || 'green'} theme={theme} />
        <MetricCard title="Follow-ups Pending" value={metrics.followUps?.value || 0} target={metrics.followUps?.target || 15} status={metrics.followUps?.status || 'yellow'} theme={theme} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <Brain className="w-8 h-8 text-primary-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">Second Brain</div>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>UN Mission Assistant</p>
        </div>
        <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{thisWeekTasks + completedTasks}</div>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Reports & Tasks</p>
        </div>
        <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold">{activeTasks}</div>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>In Progress</p>
        </div>
        <div className={`card p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="text-2xl font-bold">{lastSync.toLocaleTimeString()}</div>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Last Sync</p>
        </div>
      </div>

      {/* System Status */}
      <div className={`card p-4 bg-green-500/10 border-green-500/30`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative"><div className="w-2 h-2 rounded-full bg-green-400" /><div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" /></div>
            <span className="text-green-400 font-medium">Firestore Connected</span>
          </div>
          <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Ready for mission reports</span>
        </div>
      </div>

      {/* Task Summary */}
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
    </div>
  );
}

export default Dashboard;