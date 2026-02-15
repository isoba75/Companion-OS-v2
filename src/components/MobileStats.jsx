import React from 'react';
import { Users, DollarSign, Mail, TrendingUp } from 'lucide-react';

function MobileStats({ theme }) {
  const stats = [
    { label: 'Paying Subscribers', value: '0', target: '100', status: 'red', icon: Users },
    { label: 'Trial Signups', value: '0', target: '500', status: 'red', icon: TrendingUp },
    { label: 'Leads Scraped', value: '7', target: '500', status: 'yellow', icon: Mail },
    { label: 'MRR', value: '$0', target: '$5,000', status: 'red', icon: DollarSign },
  ];

  const statusColors = {
    red: 'from-red-500/20 to-red-500/5 border-red-500/30',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30',
  };

  const statusDots = {
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    green: 'bg-green-400',
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => {
        const percentage = Math.round((parseInt(stat.value.replace(/[^0-9]/g, '')) / parseInt(stat.target.replace(/[^0-9]/g, ''))) * 100);
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className={`card p-4 bg-gradient-to-br ${statusColors[stat.status]} border animate-fadeIn`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-white/50' : 'bg-slate-800/50'}`}>
                <Icon className={`w-4 h-4 ${stat.status === 'red' ? 'text-red-400' : stat.status === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`} />
              </div>
              <div className={`w-2 h-2 rounded-full ${statusDots[stat.status]}`} />
            </div>

            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className={`text-xs mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</div>

            <div className={`progress-bar h-1.5 mb-1`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stat.status === 'red' ? 'bg-red-400' : stat.status === 'yellow' ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className={`text-xs opacity-50`}>of {stat.target}</div>
          </div>
        );
      })}
    </div>
  );
}

export default MobileStats;