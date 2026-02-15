import React, { useState } from 'react';
import { Plus, GripVertical } from 'lucide-react';

const columnConfig = {
  backlog: { title: 'Backlog', color: 'border-red-500/50 bg-red-500/10 text-red-400' },
  thisWeek: { title: 'This Week', color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' },
  doing: { title: 'Doing', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
  done: { title: 'Done', color: 'border-green-500/50 bg-green-500/10 text-green-400' }
};

const priorityColors = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
};

function TaskCard({ task, columnId, onDrop }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromColumn', columnId);
  };

  return (
    <div 
      className={`kanban-card group cursor-grab ${theme === 'light' ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-700/50 hover:bg-slate-700'}`}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100" />
          <span className={`px-2 py-0.5 rounded text-xs border ${priorityColors[task.priority]}`}>{task.priority}</span>
        </div>
      </div>
      <h4 className="font-medium text-sm mb-2">{task.title}</h4>
      <span className="text-xs text-slate-500">{task.tag}</span>
    </div>
  );
}

function KanbanBoard({ tasks, setTasks, theme }) {
  const [columns] = useState(['backlog', 'thisWeek', 'doing', 'done']);

  const handleDrop = (taskId, fromColumn, toColumn) => {
    if (!taskId || fromColumn === toColumn) return;
    setTasks(prev => {
      const newTasks = { ...prev };
      const taskIndex = newTasks[fromColumn]?.findIndex(t => t.id === parseInt(taskId));
      if (taskIndex === -1) return prev;
      const [task] = newTasks[fromColumn].splice(taskIndex, 1);
      if (newTasks[toColumn]) newTasks[toColumn].push(task);
      return newTasks;
    });
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Task Board</h2>
          <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>Drag and drop to move tasks</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />Add Task</button>
      </div>
      <div className="grid grid-cols-4 gap-4 h-[calc(100%-100px)]">
        {columns.map(columnId => {
          const config = columnConfig[columnId];
          const columnTasks = tasks[columnId] || [];
          return (
            <div 
              key={columnId}
              className={`kanban-column rounded-xl p-4 ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const tId = e.dataTransfer.getData('taskId');
                const from = e.dataTransfer.getData('fromColumn');
                handleDrop(tId, from, columnId);
              }}
            >
              <div className={`flex items-center justify-between mb-4 pb-3 border-b ${config.color.replace('bg-', 'border-').split(' ')[0]} ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.color.split(' ')[2]}`} />
                  <h3 className="font-semibold">{config.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${config.color}`}>{columnTasks.length}</span>
                </div>
                <button className="p-1 hover:bg-slate-600/50 rounded transition-colors">
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <TaskCard key={task.id} task={task} columnId={columnId} />
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default KanbanBoard;