import React from 'react';
import { DollarSign, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';

function FinancePanel({ theme }) {
  const isConnected = false;

  if (!isConnected) {
    return (
      <div className={"card p-8 text-center " + (theme === 'light' ? 'bg-white' : 'bg-slate-800')}>
        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Stripe Not Connected</h3>
        <p className={"mb-4 " + (theme === 'light' ? 'text-slate-400' : 'text-slate-400')}>
          Add your Stripe API key in Settings to view financial metrics.
        </p>
        <button className="btn-primary">Connect Stripe</button>
      </div>
    );
  }

  const metrics = { mrr: 0, arr: 0, trials: 0, conversions: 0, churn: 0, arpu: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Financial Metrics</h2>
          <p className={"text-sm " + (theme === 'light' ? 'text-slate-400' : 'text-slate-400')}>Powered by Stripe</p>
        </div>
        <button className={"btn-secondary flex items-center gap-2 " + (theme === 'light' ? 'bg-slate-100' : 'bg-slate-700')}>
          <CreditCard className="w-4 h-4" />View Dashboard</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={"card p-6 " + (theme === 'light' ? 'bg-white' : 'bg-slate-800')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg"><DollarSign className="w-5 h-5 text-green-400" /></div>
            <span className={theme === 'light' ? 'text-slate-400' : 'text-slate-400'}>MRR</span>
          </div>
          <div className="text-3xl font-bold">${metrics.mrr.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-400"><TrendingUp className="w-4 h-4" />+0% this month</div>
        </div>

        <div className={"card p-6 " + (theme === 'light' ? 'bg-white' : 'bg-slate-800')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg"><DollarSign className="w-5 h-5 text-blue-400" /></div>
            <span className={theme === 'light' ? 'text-slate-400' : 'text-slate-400'}>ARR</span>
          </div>
          <div className="text-3xl font-bold">${metrics.arr.toLocaleString()}</div>
          <p className={"text-sm mt-2 " + (theme === 'light' ? 'text-slate-400' : 'text-slate-400')}>Annual Recurring Revenue</p>
        </div>

        <div className={"card p-6 " + (theme === 'light' ? 'bg-white' : 'bg-slate-800')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg"><TrendingUp className="w-5 h-5 text-purple-400" /></div>
            <span className={theme === 'light' ? 'text-slate-400' : 'text-slate-400'}>ARPU</span>
          </div>
          <div className="text-3xl font-bold">${metrics.arpu}</div>
          <p className={"text-sm mt-2 " + (theme === 'light' ? 'text-slate-400' : 'text-slate-400')}>Avg Revenue Per User</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className={"card p-5 " + (theme === 'light' ? 'bg-white' : 'bg-slate-800')}>
          <div className={"text-sm " + (theme === 'light' ? 'text-slate-400' : 'text-slate-400')}>Active Trials</div>
          <div className="text-2xl font-bold">{metrics.trials}</div>
        </div>
        <div className={"card p-5 " + (theme === 'light' ? 'bg-white' : 'bg-slate-800')}>
          <div className={"text-sm " + (theme === 'light' ? 'text-slate-400' : 'text-slate-400')}>Conversion Rate</div>
          <div className="text-2xl font-bold">{metrics.conversions}%</div>
        </div>
        <div className={"card p-5 " + (theme === 'light' ? 'bg-white' : 'bg-slate-800')}>
          <div className={"text-sm " + (theme === 'light' ? 'text-slate-400' : 'text-slate-400')}>Churn Rate</div>
          <div className="text-2xl font-bold flex items-center gap-2">{metrics.churn}%</div>
        </div>
      </div>

      <div className={"card p-6 " + (theme === 'light' ? 'bg-white' : 'bg-slate-800')}>
        <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
        <div className={"h-64 rounded-lg flex items-center justify-center " + (theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50')}>
          <p className={theme === 'light' ? 'text-slate-400' : 'text-slate-400'}>Chart when Stripe is connected</p>
        </div>
      </div>
    </div>
  );
}

export default FinancePanel;