import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Zap, RefreshCw, ArrowRight } from 'lucide-react';
import { getLeads, getMetrics } from '../utils/firebase';
import GoalProgress from './GoalProgress';
import QuickActions from './QuickActions';
import ActivityFeed from './ActivityFeed';
import MobileStats from './MobileStats';

const defaultMetrics = {
  payingSubscribers: { value: 0, target: 100, trend: 0, status: 'red', label: 'Paying Subscribers' },
  trialSignups: { value: 0, target: 50, trend: 0, status: 'red', label: 'Trial Signups' },
  leadsScraped: { value: 126, target: 500, trend: 0, status: 'yellow', label: 'Qualified Leads' },
  emailsSent: { value: 0, target: 500, trend: 0, status: 'red', label: 'Emails Sent' },
  replies: { value: 0, target: 50, trend: 0, status: 'red', label: 'Replies' },
  demoRequests: { value: 0, target: 20, trend: 0, status: 'red', label: 'Demo Requests' },
  mrr: { value: 0, target: 5000, trend: 0, status: 'red', label: 'MRR ($)' },
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
          title="Qualified Leads"
          value={metrics.leadsScraped?.value || 126}
          target={metrics.leadsScraped?.target || 500}
          trend={0}
          status="yellow"
          theme={theme}
        />
        <MetricCard
          title="Emails Sent"
          value={metrics.emailsSent?.value || 0}
          target={metrics.emailsSent?.target || 500}
          trend={0}
          status="red"
          theme={theme}
        />
        <MetricCard
          title="Demo Requests"
          value={metrics.demoRequests?.value || 0}
          target={metrics.demoRequests?.target || 20}
          trend={0}
          status="red"
          theme={theme}
        />
        <MetricCard
          title="Paying Subscribers"
          value={metrics.payingSubscribers?.value || 0}
          target={metrics.payingSubscribers?.target || 100}
          trend={0}
          status="red"
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

      {/* Auto-Scraper Status */}
      <div className={`card p-4 bg-blue-500/10 border-blue-500/30`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <span className="text-blue-400 font-medium">🤖 Auto-Scraper Running</span>
          </div>
          <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Scrapes AnnuaireCI every hour</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 rounded-lg bg-slate-800/50">
            <div className="text-xl font-bold text-blue-400">1</div>
            <div className="text-xs text-slate-400">Leads Added</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50">
            <div className="text-xl font-bold text-green-400">40,902</div>
            <div className="text-xs text-slate-400">Available</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50">
            <div className="text-xl font-bold text-yellow-400">374</div>
            <div className="text-xs text-slate-400">To Goal</div>
          </div>
        </div>
      </div>

      {/* Outreach Templates */}
      <div className={`card p-5 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">📧 Outreach Campaign - Draft Emails</h3>
          <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">Ready to Send</span>
        </div>
        
        <div className="space-y-3">
          <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-primary-400">Template 1</span>
              <span className="text-xs text-slate-500">• Import/Export & Logistics</span>
            </div>
            <p className="text-sm font-medium">Subject: Optimisez votre gestion avec Digibuntu ERP</p>
          </div>
          
          <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-green-400">Template 2</span>
              <span className="text-xs text-slate-500">• Manufacturing & Agro-industry</span>
            </div>
            <p className="text-sm font-medium">Subject: [COMPANY NAME] + Digibuntu = Gestion simplifiée</p>
          </div>
          
          <div className={`p-4 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-yellow-400">Template 3</span>
              <span className="text-xs text-slate-500">• IT & Services</span>
            </div>
            <p className="text-sm font-medium">Subject: Automatisez votre croissance avec Digibuntu</p>
          </div>
        </div>
      </div>

      {/* Top 10 Priority Leads */}
      <div className={`card p-5 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">👥 Top 10 Companies to Contact</h3>
          <button className="text-xs px-3 py-1 rounded-full bg-primary-500/20 text-primary-400">Start Campaign</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                <th className="text-left pb-2">#</th>
                <th className="text-left pb-2">Company</th>
                <th className="text-left pb-2">Sector</th>
                <th className="text-left pb-2">Size</th>
                <th className="text-left pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { n: 1, c: 'SGBCI', s: 'Bank', sz: 'Large', st: 'Needs email' },
                { n: 2, c: 'OLAM CI', s: 'Agro', sz: 'Large', st: 'Needs email' },
                { n: 3, c: 'CARGILL CI', s: 'Agri-food', sz: 'Large', st: 'Needs email' },
                { n: 4, c: 'ORANGE CI', s: 'Telco', sz: 'Large', st: 'Needs email' },
                { n: 5, c: 'NSIA ASSURANCES', s: 'Insurance', sz: 'Large', st: 'Needs email' },
                { n: 6, c: 'ALLIANZ CI', s: 'Insurance', sz: 'Large', st: 'Needs email' },
                { n: 7, c: 'SAHAM ASSURANCE', s: 'Insurance', sz: 'Large', st: 'Needs email' },
                { n: 8, c: 'CIPHARM', s: 'Pharma', sz: 'Large', st: 'Needs email' },
                { n: 9, c: 'SNTT LOGISTICS', s: 'Logistics', sz: 'Medium', st: 'Needs email' },
                { n: 10, c: 'TRANSCOM', s: 'Logistics', sz: 'Medium', st: 'Needs email' },
              ].map((lead) => (
                <tr key={lead.n} className="border-t border-slate-700">
                  <td className="py-2">{lead.n}</td>
                  <td className="py-2 font-medium">{lead.c}</td>
                  <td className="py-2 text-slate-400">{lead.s}</td>
                  <td className="py-2 text-slate-400">{lead.sz}</td>
                  <td className="py-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                      {lead.st}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outreach Schedule */}
      <div className={`card p-5 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <h3 className="text-lg font-semibold mb-4">📅 Outreach Schedule</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-xl text-center ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <div className="text-xs text-slate-400 mb-1">Day 1</div>
            <div className="font-medium text-sm">Initial Email</div>
            <div className="text-xs text-yellow-400 mt-1">Pending</div>
          </div>
          <div className={`p-3 rounded-xl text-center ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <div className="text-xs text-slate-400 mb-1">Day 3</div>
            <div className="font-medium text-sm">Follow-up</div>
            <div className="text-xs text-blue-400 mt-1">Automated</div>
          </div>
          <div className={`p-3 rounded-xl text-center ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <div className="text-xs text-slate-400 mb-1">Day 7</div>
            <div className="font-medium text-sm">2nd Follow-up</div>
            <div className="text-xs text-blue-400 mt-1">Automated</div>
          </div>
          <div className={`p-3 rounded-xl text-center ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
            <div className="text-xs text-slate-400 mb-1">Day 14</div>
            <div className="font-medium text-sm">Final / Remove</div>
            <div className="text-xs text-blue-400 mt-1">Automated</div>
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