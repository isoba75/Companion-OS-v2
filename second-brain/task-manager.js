/**
 * Second Brain - Task Manager
 * Autonomous task creation and tracking
 */

const fs = require('fs');
const path = require('path');

const TASK_FILE = path.join(__dirname, '../second-brain/my-tasks.md');

// Task categories
const CATEGORIES = {
  research: '🔍 Research',
  writing: '✍️ Writing',
  organizing: '📁 Organizing',
  following_up: '📞 Following Up',
  processing: '🧠 Processing',
  reporting: '📊 Reporting'
};

let tasks = [];
let taskCounter = 0;

function loadTasks() {
  try {
    const content = fs.readFileSync(TASK_FILE, 'utf8');
    // Parse existing tasks
    const taskMatch = content.match(/TASK-(\d+)/g);
    if (taskMatch) {
      const maxNum = Math.max(...taskMatch.map(t => parseInt(t.split('-')[1])));
      taskCounter = maxNum;
    }
  } catch (e) {
    // File doesn't exist yet
  }
}

function saveTasks() {
  const header = `# MY TASKS - Autonomous Work Log

_These are tasks I create and work on autonomously. Visible in real-time._

---

## 🎯 ACTIVE TASKS

### Currently Working On
${tasks.filter(t => t.status === 'active').map(t => `
- **${t.id}:** ${t.title}
- **Category:** ${t.category}
- **Started:** ${t.started}
- **Progress:** ${t.progress}%
`).join('\n')}

---

## 📋 QUEUED TASKS

### Ready to Start
${tasks.filter(t => t.status === 'queued').map((t, i) => `${i + 1}. ${t.id}: ${t.title}`).join('\n') || '_No tasks queued_'}

---

## ✅ COMPLETED TODAY

| Task | Completed | Output |
|------|-----------|--------|
${tasks.filter(t => t.status === 'done').map(t => `| ${t.id} | ${t.completed} | ${t.output || '-'} |`).join('\n') || '| - | - | - |'}

---

## 🔄 ONGOING (Recurring)

- [ ] Weekly memory review
- [ ] Check inbox for captures
- [ ] Update USER.md with new learnings

---

## 📝 LOG

### How I Create Tasks

When I decide to work on something, I:
1. Create the task here with timestamp
2. Update status as I progress
3. Complete and log output
4. Report to you what I did

---

*Last Updated: ${new Date().toISOString()}*
`;

  fs.writeFileSync(TASK_FILE, header);
}

function createTask(title, category = 'research') {
  taskCounter++;
  const task = {
    id: `TASK-${String(taskCounter).padStart(3, '0')}`,
    title,
    category: CATEGORIES[category] || category,
    status: 'active',
    started: new Date().toISOString(),
    progress: 0,
    output: null
  };
  tasks.push(task);
  saveTasks();
  return task;
}

function updateProgress(taskId, progress) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.progress = progress;
    saveTasks();
    return task;
  }
  return null;
}

function completeTask(taskId, output) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'done';
    task.progress = 100;
    task.completed = new Date().toISOString();
    task.output = output;
    saveTasks();
    return task;
  }
  return null;
}

function queueTask(title, category = 'research') {
  taskCounter++;
  const task = {
    id: `TASK-${String(taskCounter).padStart(3, '0')}`,
    title,
    category: CATEGORIES[category] || category,
    status: 'queued',
    started: null,
    progress: 0,
    output: null
  };
  tasks.push(task);
  saveTasks();
  return task;
}

function getActiveTasks() {
  return tasks.filter(t => t.status === 'active');
}

function getQueuedTasks() {
  return tasks.filter(t => t.status === 'queued');
}

function getCompletedTasks() {
  return tasks.filter(t => t.status === 'done');
}

function getAllTasks() {
  return tasks;
}

// Initialize
loadTasks();

module.exports = {
  createTask,
  updateProgress,
  completeTask,
  queueTask,
  getActiveTasks,
  getQueuedTasks,
  getCompletedTasks,
  getAllTasks
};
