import React, { useState, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Loader2, User, Bot } from 'lucide-react';
import { getTasks, createTask as firebaseCreateTask, updateTaskStatus as firebaseUpdateStatus, deleteTask as firebaseDeleteTask } from '../utils/firebase';

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

// Sample assistant tasks (loaded from file in real app)
const defaultAssistantTasks = {
  backlog: [
    { id: 'ASST-001', title: 'Review Second Brain captures', tag: 'Processing', priority: 'medium', source: 'assistant' },
    { id: 'ASST-002', title: 'Draft weekly summary', tag: 'Reporting', priority: 'low', source: 'assistant' },
  ],
  thisWeek: [
    { id: 'ASST-003', title: 'Process UN mission notes', tag: 'Writing', priority: 'high', source: 'assistant' },
  ],
  doing: [
    { id: 'ASST-000', title: 'Organize second brain files', tag: 'Organizing', priority: 'medium', source: 'assistant' },
  ],
  done: [
    { id: 'ASST-999', title: 'Update SOUL.md persona', tag: 'Organizing', priority: 'high', source: 'assistant', completed: '2026-02-16' },
  ]
};

function TaskCard({ task, columnId, theme, onMove, onDelete, isMoving, showSource }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('fromColumn', columnId);
  };

  return (
    <div 
      className={`kanban-card group cursor-grab ${theme === 'light' ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-700/50 hover:bg-slate-700'}`}
      draggable={!isMoving}
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100" />
          <span className={`px-2 py-0.5 rounded text-xs border ${priorityColors[task.priority]}`}>{task.priority}</span>
          {showSource && task.source === 'assistant' && (
            <Bot className="w-3 h-3 text-primary-400" title="Assistant Task" />
          )}
        </div>
        <button 
          onClick={() => onDelete(task.id)}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      </div>
      <h4 className="font-medium text-sm mb-2">{task.title}</h4>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{task.tag}</span>
        {isMoving && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
        {task.completed && (
          <span className="text-xs text-green-400">✓ {task.completed}</span>
        )}
      </div>
    </div>
  );
}

function KanbanBoard({ tasks, theme, onMoveTask, onDeleteTask, onAddTask, isLoading, viewMode = 'user', setViewMode }) {
  const [columns] = useState(['backlog', 'thisWeek', 'doing', 'done']);
  const [movingTaskId, setMovingTaskId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingToColumn, setAddingToColumn] = useState(null);
  const [assistantTasks, setAssistantTasks] = useState(defaultAssistantTasks);

  const displayTasks = viewMode === 'assistant' ? assistantTasks : tasks;

  // Toggle handler
  const toggleView = () => {
    const modes = ['user', 'assistant', 'all'];
    const currentIdx = modes.indexOf(viewMode);
    const nextIdx = (currentIdx + 1) % modes.length;
    setViewMode(modes[nextIdx]);
  };

  const handleDrop = async (taskId, fromColumn, toColumn) => {
    if (!taskId || fromColumn === toColumn) return;
    setMovingTaskId(taskId);
    if (viewMode === 'assistant') {
      // Update local assistant tasks
      setAssistantTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(status => {
          newTasks[status] = newTasks[status].filter(t => t.id !== taskId);
        });
        const task = tasks[fromColumn]?.find(t => t.id === taskId) || defaultAssistantTasks[fromColumn]?.find(t => t.id === taskId);
        if (task) {
          if (!newTasks[toColumn]) newTasks[toColumn] = [];
          newTasks[toColumn].push({ ...task, completed: null });
        }
        return newTasks;
      });
    } else {
      await onMoveTask(taskId, toColumn);
    }
    setMovingTaskId(null);
  };

  const handleAddTask = async (columnId) => {
    if (!newTaskTitle.trim()) return;
    if (viewMode === 'assistant') {
      // Add to assistant tasks locally
      setAssistantTasks(prev => ({
        ...prev,
        [columnId]: [
          ...(prev[columnId] || []),
          {
            id: `ASST-${String(Date.now()).slice(-3)}`,
            title: newTaskTitle,
            status: columnId,
            priority: 'medium',
            tag: 'Manual',
            source: 'assistant'
          }
        ]
      }));
    } else {
      await onAddTask({
        title: newTaskTitle,
        status: columnId,
        priority: 'medium',
        tag: 'Manual'
      });
    }
    setNewTaskTitle('');
    setAddingToColumn(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (viewMode === 'assistant') {
      setAssistantTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(status => {
          newTasks[status] = newTasks[status].filter(t => t.id !== taskId);
        });
        return newTasks;
      });
    } else {
      await onDeleteTask(taskId);
    }
  };

  const activeCount = Object.values(displayTasks).flat().length;
  const doingCount = displayTasks.doing?.length || 0;
  const doneCount = displayTasks.done?.length || 0;

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {viewMode === 'assistant' ? (
              <>
                <Bot className="w-6 h-6 text-primary-400" />
                🧠 My Tasks
              </>
            ) : viewMode === 'all' ? (
              <>
                <User className="w-6 h-6 text-blue-400" />
                <Bot className="w-6 h-6 text-primary-400" />
                All Tasks
              </>
            ) : (
              <>
                <User className="w-6 h-6 text-slate-400" />
                Your Tasks
              </>
            )}
          </h2>
          <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>
            {isLoading ? 'Loading...' : `${activeCount} tasks • ${doingCount} in progress • ${doneCount} completed`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <button
            onClick={toggleView}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
              theme === 'light' ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {viewMode === 'user' && <><User className="w-4 h-4" /> Yours</>}
            {viewMode === 'assistant' && <><Bot className="w-4 h-4" /> Mine</>}
            {viewMode === 'all' && <><User className="w-4 h-4" /><Bot className="w-4 h-4" /> All</>}
          </button>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary-400" />}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 h-[calc(100%-100px)]">
        {columns.map(columnId => {
          const config = columnConfig[columnId];
          const columnTasks = displayTasks[columnId] || [];
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
                <button 
                  onClick={() => setAddingToColumn(columnId)}
                  className="p-1 hover:bg-slate-600/50 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              {/* Add Task Input */}
              {addingToColumn === columnId && (
                <div className="mb-3 p-2 rounded-lg bg-slate-700/50">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(columnId)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleAddTask(columnId)}
                      className="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded"
                    >
                      Add
                    </button>
                    <button 
                      onClick={() => setAddingToColumn(null)}
                      className="text-xs px-2 py-1 text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    columnId={columnId} 
                    theme={theme}
                    onMove={onMoveTask}
                    onDelete={handleDeleteTask}
                    isMoving={movingTaskId === task.id}
                    showSource={viewMode === 'all'}
                  />
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

export default KanbanBoard;="p-1 hover:bg-slate-600/50 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              
              {/* Add Task Input */}
              {addingToColumn === columnId && (
                <div className="mb-3 p-2 rounded-lg bg-slate-700/50">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask(columnId)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleAddTask(columnId)}
                      className="text-xs px-2 py-1 bg-primary-500/20 text-primary-400 rounded"
                    >
                      Add
                    </button>
                    <button 
                      onClick={() => setAddingToColumn(null)}
                      className="text-xs px-2 py-1 text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {columnTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    columnId={columnId} 
                    theme={theme}
                    onMove={onMoveTask}
                    onDelete={onDeleteTask}
                    isMoving={movingTaskId === task.id}
                  />
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