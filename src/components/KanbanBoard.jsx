import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';

const columnConfig = {
  backlog: { title: 'Backlog', color: 'red', icon: AlertCircle },
  thisWeek: { title: 'This Week', color: 'yellow', icon: Clock },
  doing: { title: 'Doing', color: 'blue', icon: Clock },
  done: { title: 'Done', color: 'green', icon: CheckCircle }
};

const priorityColors = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
};

function TaskCard({ task, theme, onDelete }) {
  return (
    <div className={`p-4 rounded-lg border bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer group`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-0.5 rounded text-xs border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      </div>
      <h4 className="font-medium text-sm text-white">{task.title}</h4>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-slate-500">{task.tag || 'Task'}</span>
        <span className="text-xs text-slate-600">{task.id?.slice(0, 8) || ''}</span>
      </div>
    </div>
  );
}

function AddTaskModal({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-4">Add New Task</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 mb-4"
          autoFocus
        />
        <div className="flex gap-2 mb-4">
          {['low', 'medium', 'high'].map(p => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-all ${
                priority === p 
                  ? priorityColors[p] 
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
          <button 
            onClick={() => { onAdd({ title, priority }); setTitle(''); }}
            disabled={!title.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

function KanbanBoard({ tasks, theme, onMoveTask, onDeleteTask, onAddTask, isLoading }) {
  const [columns] = useState(['backlog', 'thisWeek', 'doing', 'done']);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });

  const activeCount = Object.values(tasks).flat().length || 0;
  const doingCount = tasks.doing?.length || 0;
  const doneCount = tasks.done?.length || 0;

  const handleDrop = async (taskId, fromColumn, toColumn) => {
    if (!taskId || fromColumn === toColumn) return;
    await onMoveTask(taskId, toColumn);
  };

  const handleAddTask = async (taskData) => {
    await onAddTask({
      ...taskData,
      status: 'backlog',
      tag: 'Manual'
    });
    setShowAddModal(false);
    setNewTask({ title: '', priority: 'medium' });
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span>
            Tasks
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {activeCount} total • {doingCount} in progress • {doneCount} done
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-4 gap-4 h-[calc(100%-100px)]">
        {columns.map(columnId => {
          const config = columnConfig[columnId];
          const columnTasks = tasks[columnId] || [];
          const Icon = config.icon;
          
          return (
            <div 
              key={columnId}
              className={`rounded-xl p-4 bg-slate-800/50 border border-slate-700`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const tId = e.dataTransfer.getData('taskId');
                const from = e.dataTransfer.getData('fromColumn');
                handleDrop(tId, from, columnId);
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${config.color}-400`} />
                  <h3 className="font-semibold text-white">{config.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs bg-${config.color}-500/20 text-${config.color}-400`}>
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    theme={theme}
                    onMove={onMoveTask}
                    onDelete={onDeleteTask}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
      />
    </div>
  );
}

export default KanbanBoard;