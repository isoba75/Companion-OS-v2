import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, AlertCircle } from 'lucide-react';

function FinancePanel() {
  // Placeholder - will connect to Stripe API
  const metrics = {
    mrr: 0,
    arr: 0,
    trials: 0,
    conversions: 0,
    churn: 0,
    arpu: 0,
  };

  const isConnected = false;

  if (!isConnected) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Stripe Not Connected</h3>
        <p className="text-slate-400 mb-4">
          Add your Stripe API keys in Settings to view financial metrics.
        </p>
        <button className="btn-primary">
          Connect Stripe
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Financial Metrics</h2>
          <p className="text-slate-400 text-sm">Powered by Stripe</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          <span>View Dashboard</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-slate-400">MRR</span>
          </div>
          <div className="text-3xl font-bold">${metrics.mrr.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span>+0% this month</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-slate-400">ARR</span>
          </div>
          <div className="text-3xl font-bold">${metrics.arr.toLocaleString()}</div>
          <div className="text-sm text-slate-400 mt-2">Annual Recurring Revenue</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-slate-400">ARPU</span>
          </div>
          <div className="text-3xl font-bold">${metrics.arpu}</div>
          <div className="text-sm text-slate-400 mt-2">Avg Revenue Per User</div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-sm text-slate-400 mb-1">Active Trials</div>
          <div className="text-2xl font-bold">{metrics.trials}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-400 mb-1">Conversion Rate</div>
          <div className="text-2xl font-bold">{metrics.conversions}%</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-slate-400 mb-1">Churn Rate</div>
          <div className="text-2xl font-bold flex items-center gap-2">
            {metrics.churn}%
            <TrendingDown className="w-4 h-4 text-green-400" />
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
        <div className="h-64 bg-slate-900/50 rounded-lg flex items-center justify-center">
          <p className="text-slate-400">Chart will appear when Stripe is connected</p>
        </div>
      </div>
    </div>
  );
}

export default FinancePanel;