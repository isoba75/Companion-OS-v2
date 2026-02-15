import React from 'react';
import { Plus, Search, Mail, Target, Zap, ExternalLink } from 'lucide-react';

function QuickActions({ theme, onNavigate }) {
  const actions = [
    { id: 'add-lead', label: 'Add Lead', icon: Plus, color: 'text-green-400', action: () => onNavigate('leads') },
    { id: 'scrape', label: 'Scrape Leads', icon: Search, color: 'text-blue-400', action: () => onNavigate('leads') },
    { id: 'email', label: 'Send Email', icon: Mail, color: 'text-purple-400', action: () => {} },
    { id: 'goal', label: 'View Goal', icon: Target, color: 'text-orange-400', action: () => {} },
    { id: 'tasks', label: 'Quick Task', icon: Zap, color: 'text-yellow-400', action: () => onNavigate('kanban') },
    { id: 'analytics', label: 'Analytics', icon: ExternalLink, color: 'text-pink-400', action: () => {} },
  ];

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-60">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.action}
              className="quick-action-btn group"
            >
              <div className={`p-3 rounded-xl mb-2 transition-transform duration-300 group-hover:scale-110 ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700/50'}`}>
                <Icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;