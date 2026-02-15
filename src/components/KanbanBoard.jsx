import React, { useState } from 'react';
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react';

const columnConfig = {
  backlog: {
    title: 'Backlog',
    color: 'border-red-500/50',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-400'
  },
  thisWeek: {
    title: 'This Week',
    color: 'border-yellow-500/50',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-400'
  },
  doing: {
    title: 'Doing',
    color: 'border-blue-500/50',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400'
  },
  done: {
    title: 'Done',
    color: 'border-green-500/50',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400'
  }
};

const priorityColors = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
};

function TaskCard({ task, onDragStart, columnId }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromColumn', columnId);
    onDragStart && onDragStart(task);
  };

  return (
    <div 
      className="kanban-card group"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-500 cursor-grab opacity-0 group-hover:opacity-100" />
          <span className={`px-2 py-0.5 rounded text-xs border ${priorityColors[task.priority] || priorityColors.low}`}>
            {task.priority}
          </span>
        </div>
        <button 
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreHorizontal className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <h4 className="font-medium text-sm mb-2">{task.title}</h4>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{task.tag}</span>
        {task.assignee && (
          <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
            {task.assignee[0]}
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ id, tasks, title, config, onDrop, onDragOver }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    const fromColumn = e.dataTransfer.getData('fromColumn');
    onDrop && onDrop(taskId, fromColumn, id);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  return (
    <div 
      className={`kanban-column ${isOver ? 'bg-primary-500/10' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <div className={`flex items-center justify-between mb-4 pb-3 border-b border-slate-700/50 ${config.color}`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${config.bgColor.replace('bg-', 'bg-').replace('/10', '')}`} />
          <h3 className="font-semibold">{title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.textColor}`}>
            {tasks?.length || 0}
          </span>
        </div>
        <button className="p-1 hover:bg-slate-700/50 rounded transition-colors">
          <Plus className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="space-y-3">
        {tasks?.map(task => (
          <TaskCard key={task.id} task={task} columnId={id} />
        ))}
        {(!tasks || tasks.length === 0) && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanBoard({ tasks, setTasks }) {
  const [columns] = useState(['backlog', 'thisWeek', 'doing', 'done']);

  const handleDrop = (taskId, fromColumn, toColumn) => {
    if (!taskId || fromColumn === toColumn) return;
    
    setTasks(prev => {
      const newTasks = { ...prev };
      const taskIndex = newTasks[fromColumn]?.findIndex(t => t.id === parseInt(taskId));
      if (taskIndex === -1) return prev;
      
      const [task] = newTasks[fromColumn].splice(taskIndex, 1);
      if (newTasks[toColumn]) {
        newTasks[toColumn].push(task);
      }
      return newTasks;
    });
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Task Board</h2>
          <p className="text-slate-400 text-sm">Drag and drop to move tasks</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-4 h-[calc(100%-80px)]">
        {columns.map(columnId => (
          <KanbanColumn
            key={columnId}
            id={columnId}
            title={columnConfig[columnId]?.title || columnId}
            config={columnConfig[columnId]}
            tasks={tasks?.[columnId]}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;