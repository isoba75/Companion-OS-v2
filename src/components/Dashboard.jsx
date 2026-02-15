import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Zap, RefreshCw, ArrowRight } from 'lucide-react';
import { getLeads, getMetrics } from '../utils/firebase';
import GoalProgress from './GoalProgress';
import QuickActions from './QuickActions';
import ActivityFeed from './ActivityFeed';
import MobileStats from './MobileStats';

const defaultMetrics = {
  payingSubscribers: { value: 0, target: 100, trend: 0, status: 'red', label: 'Paying Subscribers' },
  trialSignups: { value: 0, target: 500, trend: 0, status: 'red', label: 'Trial Signups' },
  leadsScraped: { value: 7, target: 500, trend: 0, status: 'yellow', label: 'Leads Scraped' },
  leadsContacted: { value: 0, target: 500, trend: 0, status: 'red', label: 'Leads Contacted' },
  mrr: { value: 0, target: 5000, trend: 0, status: 'red', label: 'MRR ($)' },
  cpa: { value: 0, target: 50, trend: 0, status: 'blue', label: 'Cost Per Acquisition' }
};

function MetricCard({ title, value, target, trend, status, theme }) {
  const percentage = target > 0 ? Math.round((value / target) * 100) : 0;

  const statusColors = {
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 status-red',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30 status-yellow',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30 status-green',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 status-blue'
  };

  const barColors = {
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    green: 'bg-green-400',
    blue: 'bg-blue-400'
  };

  return (
    <div className={`card p-5 bg-gradient-to-br ${statusColors[status]} border metric-card animate-fadeIn`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[status].split(' ')[2] || 'status-blue'}`}>
          {percentage}%
        </div>
        {trend > 0 ? (
          <TrendingUp className="w-5 h-5 text-green-400" />
        ) : trend < 0 ? (
          <TrendingDown className="w-5 h-5 text-red-400" />
        ) : null}
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
  const [leadCount, setLeadCount] = useState(7);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setLastSync(new Date());

    // Load metrics from Firestore
    const metricsResult = await getMetrics();
    if (metricsResult.success && metricsResult.data) {
      const newMetrics = { ...defaultMetrics };
      Object.keys(metricsResult.data).forEach(key => {
        if (newMetrics[key]) newMetrics[key] = { ...newMetrics[key], ...metricsResult.data[key] };
      });
      setMetrics(newMetrics);
    }

    // Load lead count
    const leadsResult = await getLeads();
    if (leadsResult.success) {
      setLeadCount(leadsResult.data.length);
    }

    setIsLoading(false);
  };

  const activeTasks = tasks.doing?.length || 0;
  const completedTasks = tasks.done?.length || 0;
  const thisWeekTasks = tasks.thisWeek?.length || 0;

  const handleNavigate = (view) => {
    // This will be controlled by parent
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Goal Progress - Mobile Optimized */}
      <GoalProgress theme={theme} />

      {/* Mobile Stats Grid */}
      <div className="md:hidden">
        <MobileStats theme={theme} />
      </div>

      {/* Desktop Metrics - Row Layout */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        <MetricCard
          title="Paying Subscribers"
          value={metrics.payingSubscribers?.value || 0}
          target={metrics.payingSubscribers?.target || 100}
          trend={metrics.payingSubscribers?.trend || 0}
          status={metrics.payingSubscribers?.status || 'red'}
          theme={theme}
        />
        <MetricCard
          title="Trial Signups"
          value={metrics.trialSignups?.value || 0}
          target={metrics.trialSignups?.target || 500}
          trend={metrics.trialSignups?.trend || 0}
          status={metrics.trialSignups?.status || 'red'}
          theme={theme}
        />
        <MetricCard
          title="Leads Scraped"
          value={leadCount}
          target={metrics.leadsScraped?.target || 500}
          trend={0}
          status="yellow"
          theme={theme}
        />
        <MetricCard
          title="MRR ($)"
          value={metrics.mrr?.value || 0}
          target={metrics.mrr?.target || 5000}
          trend={metrics.mrr?.trend || 0}
          status={metrics.mrr?.status || 'red'}
          theme={theme}
        />
      </div>

      {/* Quick Actions & Activity - Side by Side on Desktop */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <QuickActions theme={theme} onNavigate={handleNavigate} />
        </div>
        <ActivityFeed theme={theme} />
      </div>

      {/* Lead Sources */}
      <div className={`card p-5 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Lead Sources</h3>
          <button
            onClick={loadData}
            className={`p-2 rounded-lg transition-all duration-200 active:scale-95 ${theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700'}`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className={`rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${theme === 'light' ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-900/50 hover:bg-slate-900'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
              <span className="text-xs font-medium text-green-400">Active</span>
            </div>
            <h4 className="font-semibold mb-1">AnnuaireCI.com</h4>
            <p className="text-2xl font-bold text-primary-400">40,902</p>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Ivory Coast • Last sync: {lastSync.toLocaleTimeString()}</p>
          </div>

          <div className={`rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${theme === 'light' ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-900/50 hover:bg-slate-900'}`}>
            <h4 className="font-semibold mb-1">pme.gouv.ci</h4>
            <p className="text-2xl font-bold text-primary-400">100+</p>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Official PME list</p>
          </div>

          <div className={`rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${theme === 'light' ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-900/50 hover:bg-slate-900'}`}>
            <h4 className="font-semibold mb-1">senegal-export</h4>
            <p className="text-2xl font-bold text-slate-400">-</p>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Pending scrape</p>
          </div>
        </div>
      </div>

      {/* Firestore Status */}
      <div className={`card p-4 bg-green-500/10 border-green-500/30 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
          </div>
          <span className="text-green-400 font-medium">Firestore Connected</span>
        </div>
        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
          {leadCount} leads • Last sync: {lastSync.toLocaleTimeString()}
        </span>
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