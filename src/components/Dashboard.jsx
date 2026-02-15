import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Zap, ArrowRight } from 'lucide-react';
import { getLeads, getMetrics } from '../utils/firebase';

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
  
  const statusColors = { red: 'status-red', yellow: 'status-yellow', green: 'status-green', blue: 'status-blue' };
  const barColors = { red: 'bg-red-500', yellow: 'bg-yellow-500', green: 'bg-green-500', blue: 'bg-blue-500' };

  return (
    <div className={`card p-5 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[status] || statusColors.blue}`}>
          {percentage}% of target
        </div>
        {trend > 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : trend < 0 ? <TrendingDown className="w-5 h-5 text-red-400" /> : null}
      </div>
      <div className="mb-2">
        <h3 className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>{title}</p>
      </div>
      <div className={`w-full rounded-full h-2 ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
        <div className={`h-2 rounded-full transition-all ${barColors[status] || barColors.blue}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      <p className={`text-xs mt-2 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Target: {target.toLocaleString()}</p>
    </div>
  );
}

function Dashboard({ tasks = {}, theme }) {
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [leadCount, setLeadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load metrics from Firestore
    const metricsResult = await getMetrics();
    if (metricsResult.success && metricsResult.data) {
      const newMetrics = { ...defaultMetrics };
      Object.keys(result.data).forEach(key => {
        if (newMetrics[key]) newMetrics[key] = { ...newMetrics[key], ...result.data[key] };
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

  return (
    <div className="space-y-6">
      {/* Sprint Banner */}
      <div className={`card p-6 bg-gradient-to-r from-primary-600/20 to-purple-600/20 border-primary-500/30 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary-400" />
              <span className="text-primary-400 font-medium">Current Sprint</span>
            </div>
            <h2 className="text-xl font-bold">100 Paying Subscribers in 30 Days</h2>
            <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Feb 15 - Mar 15, 2026 - Côte d'Ivoire & Senegal</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-400">{activeTasks}</div>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Active Tasks</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Paying Subscribers" value={metrics.payingSubscribers?.value || 0} target={metrics.payingSubscribers?.target || 100} trend={metrics.payingSubscribers?.trend || 0} status={metrics.payingSubscribers?.status || 'red'} theme={theme} />
        <MetricCard title="Trial Signups" value={metrics.trialSignups?.value || 0} target={metrics.trialSignups?.target || 500} trend={metrics.trialSignups?.trend || 0} status={metrics.trialSignups?.status || 'red'} theme={theme} />
        <MetricCard title="Leads Scraped" value={leadCount} target={metrics.leadsScraped?.target || 500} trend={0} status="yellow" theme={theme} />
        <MetricCard title="MRR ($)" value={metrics.mrr?.value || 0} target={metrics.mrr?.target || 5000} trend={metrics.mrr?.trend || 0} status={metrics.mrr?.status || 'red'} theme={theme} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`card p-5 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-yellow-400" />
            <h3 className="font-medium">This Week</h3>
          </div>
          <div className="text-2xl font-bold">{thisWeekTasks}</div>
          <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Tasks to complete</p>
        </div>
        <div className={`card p-5 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-green-400" />
            <h3 className="font-medium">Completed</h3>
          </div>
          <div className="text-2xl font-bold">{completedTasks}</div>
          <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Tasks done</p>
        </div>
        <div className={`card p-5 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium">CPA</h3>
          </div>
          <div className="text-2xl font-bold">${metrics.cpa?.value || '-'}</div>
          <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Target: &lt; ${metrics.cpa?.target || 50}</p>
        </div>
      </div>

      {/* Lead Sources */}
      <div className={`card p-6 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className={`rounded-lg p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <h4 className="font-medium mb-1">AnnuaireCI.com</h4>
            <p className="text-2xl font-bold text-primary-400">40,902</p>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Ivory Coast</p>
            <p className="text-xs text-green-400 mt-2">Firestore connected</p>
          </div>
          <div className={`rounded-lg p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <h4 className="font-medium mb-1">pme.gouv.ci</h4>
            <p className="text-2xl font-bold text-primary-400">100+</p>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Official PME list</p>
          </div>
          <div className={`rounded-lg p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <h4 className="font-medium mb-1">senegal-export</h4>
            <p className="text-2xl font-bold text-primary-400">-</p>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Pending scrape</p>
          </div>
        </div>
      </div>

      {/* Firestore Status */}
      <div className={`card p-4 bg-green-500/10 border border-green-500/30`}>
        <div className="flex items-center gap-2">
          <span className="text-green-400">Firestore</span>
          <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Live data syncing - {leadCount} leads loaded</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;