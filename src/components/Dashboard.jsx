import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';

function MetricCard({ title, value, target, trend, status }) {
  const percentage = target > 0 ? Math.round((value / target) * 100) : 0;
  
  const statusColors = {
    red: 'status-red',
    yellow: 'status-yellow',
    green: 'status-green',
    blue: 'status-blue',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[status] || statusColors.blue}`}>
          {percentage}% of target
        </div>
        {trend > 0 ? (
          <TrendingUp className="w-5 h-5 text-green-400" />
        ) : trend < 0 ? (
          <TrendingDown className="w-5 h-5 text-red-400" />
        ) : null}
      </div>
      <div className="mb-2">
        <h3 className="text-3xl font-bold">{value.toLocaleString()}</h3>
        <p className="text-slate-400 text-sm">{title}</p>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            status === 'green' ? 'bg-green-500' :
            status === 'yellow' ? 'bg-yellow-500' :
            status === 'red' ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">Target: {target.toLocaleString()}</p>
    </div>
  );
}

function Dashboard({ metrics, tasks }) {
  const activeTasks = tasks.doing?.length || 0;
  const completedTasks = tasks.done?.length || 0;
  const thisWeekTasks = tasks.thisWeek?.length || 0;

  return (
    <div className="space-y-6">
      {/* Sprint Banner */}
      <div className="card p-6 bg-gradient-to-r from-primary-600/20 to-purple-600/20 border-primary-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary-400" />
              <span className="text-primary-400 font-medium">Current Sprint</span>
            </div>
            <h2 className="text-xl font-bold">100 Paying Subscribers in 30 Days</h2>
            <p className="text-slate-400 text-sm mt-1">Feb 15 - Mar 15, 2026 • Côte d'Ivoire & Senegal</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-400">{activeTasks}</div>
            <div className="text-xs text-slate-400">Active Tasks</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Paying Subscribers" 
          value={metrics.payingSubscribers.value} 
          target={metrics.payingSubscribers.target}
          trend={metrics.payingSubscribers.trend}
          status={metrics.payingSubscribers.status}
        />
        <MetricCard 
          title="Trial Signups" 
          value={metrics.trialSignups.value} 
          target={metrics.trialSignups.target}
          trend={metrics.trialSignups.trend}
          status={metrics.trialSignups.status}
        />
        <MetricCard 
          title="Leads Scraped" 
          value={metrics.leadsScraped.value} 
          target={metrics.leadsScraped.target}
          trend={metrics.leadsScraped.trend}
          status={metrics.leadsScraped.status}
        />
        <MetricCard 
          title="MRR ($)" 
          value={metrics.mrr.value} 
          target={metrics.mrr.target}
          trend={metrics.mrr.trend}
          status={metrics.mrr.status}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-yellow-400" />
            <h3 className="font-medium">This Week</h3>
          </div>
          <div className="text-2xl font-bold">{thisWeekTasks}</div>
          <p className="text-sm text-slate-400">Tasks to complete</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-green-400" />
            <h3 className="font-medium">Completed</h3>
          </div>
          <div className="text-2xl font-bold">{completedTasks}</div>
          <p className="text-sm text-slate-400">Tasks done</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium">Cost Per Acquisition</h3>
          </div>
          <div className="text-2xl font-bold">${metrics.cpa.value || '-'}</div>
          <p className="text-sm text-slate-400">Target: &lt; ${metrics.cpa.target}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="btn-secondary flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            <span>Scrape Leads</span>
          </button>
          <button className="btn-secondary flex items-center justify-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>View Finance</span>
          </button>
          <button className="btn-secondary flex items-center justify-center gap-2">
            <Target className="w-4 h-4" />
            <span>View Tasks</span>
          </button>
          <button className="btn-secondary flex items-center justify-center gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>Send Emails</span>
          </button>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="font-medium mb-1">AnnuaireCI.com</h4>
            <p className="text-2xl font-bold text-primary-400">40,902</p>
            <p className="text-sm text-slate-400">Ivory Coast businesses</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="font-medium mb-1">pme.gouv.ci</h4>
            <p className="text-2xl font-bold text-primary-400">100+</p>
            <p className="text-sm text-slate-400">Official PME list</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="font-medium mb-1">senegal-export.com</h4>
            <p className="text-2xl font-bold text-primary-400">-</p>
            <p className="text-sm text-slate-400">Pending scrape</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;