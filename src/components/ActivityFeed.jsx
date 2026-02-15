import React, { useState } from 'react';
import { Activity, GitCommit, Users, DollarSign, CheckCircle, Clock, Target } from 'lucide-react';

const activities = [
  { id: 1, type: 'lead', message: '7 new leads scraped from AnnuaireCI', time: '2 hours ago', icon: Users, color: 'text-blue-400' },
  { id: 2, type: 'deploy', message: 'Mission Control v2 deployed to Vercel', time: '3 hours ago', icon: GitCommit, color: 'text-purple-400' },
  { id: 3, type: 'task', message: 'Completed: Repository setup', time: '5 hours ago', icon: CheckCircle, color: 'text-green-400' },
  { id: 4, type: 'goal', message: 'Sprint started: 100 subscribers goal', time: '6 hours ago', icon: Target, color: 'text-orange-400' },
];

function ActivityFeed({ theme }) {
  const [showAll, setShowAll] = useState(false);
  const displayedActivities = showAll ? activities : activities.slice(0, 3);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Activity
        </h3>
        <span className="text-xs text-slate-400">Today</span>
      </div>

      <div className="space-y-1">
        {displayedActivities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.id}
              className={`activity-item animate-slideUp`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700/50'}`}>
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.message}</p>
                <p className="text-xs opacity-50 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`w-full mt-3 py-2 text-sm rounded-lg transition-colors ${
            theme === 'light' ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-700/50 hover:bg-slate-700'
          }`}
        >
          {showAll ? 'Show less' : `Show ${activities.length - 3} more`}
        </button>
      )}
    </div>
  );
}

export default ActivityFeed;