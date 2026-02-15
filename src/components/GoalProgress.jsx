import React from 'react';
import { Target, Calendar, TrendingUp } from 'lucide-react';

function GoalProgress({ theme }) {
  const goal = { current: 0, target: 100, daysLeft: 28, startDate: '2026-02-15' };
  const percentage = Math.round((goal.current / goal.target) * 100);

  return (
    <div className="card p-6 bg-gradient-to-br from-primary-600/20 via-primary-600/10 to-purple-600/10 border-primary-500/30">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary-400" />
            <span className="text-primary-400 font-semibold text-sm uppercase tracking-wider">Current Sprint</span>
          </div>
          <h2 className="text-xl font-bold">100 Paying Subscribers</h2>
          <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Feb 15 - Mar 15, 2026 • Côte d'Ivoire & Senegal
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-400">{percentage}%</div>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className={`progress-bar h-3 ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
          <div
            className="progress-fill bg-gradient-to-r from-primary-500 to-primary-400"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs opacity-60">
          <span>{goal.current} subscribers</span>
          <span>{goal.target - goal.current} to go</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary-500/20">
        <div className="text-center">
          <div className="text-xl font-bold">{goal.daysLeft}</div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Days Left</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">0</div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>This Week</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            3.6
          </div>
          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Need / Day</div>
        </div>
      </div>
    </div>
  );
}

export default GoalProgress;