<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task, TaskStatus, TaskPriority, TaskType } from './types/task';
import { fetchTasks, createTask, updateTask, deleteTask } from './api/tasks';
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';
import IssueDetail from './components/IssueDetail.vue';
import SettingsModal from './components/SettingsModal.vue';
import Dashboard from './components/Dashboard.vue';
import { loadAndApplyTheme } from './utils/theme';

type View = 'dashboard' | 'issues';

const tasks = ref<Task[]>([]);
const error = ref('');
const showForm = ref(false);
const showSettings = ref(false);
const editing = ref<Task | null>(null);
const selectedTask = ref<Task | null>(null);
const statusFilter = ref<TaskStatus | 'all'>('all');
const currentView = ref<View>('dashboard');

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') return tasks.value;
  return tasks.value.filter((t) => t.status === statusFilter.value);
});

const counts = computed(() => ({
  all: tasks.value.length,
  open: tasks.value.filter((t) => t.status === 'open').length,
  in_progress: tasks.value.filter((t) => t.status === 'in_progress').length,
  resolved: tasks.value.filter((t) => t.status === 'resolved').length,
  closed: tasks.value.filter((t) => t.status === 'closed').length,
}));

async function load() {
  try {
    tasks.value = await fetchTasks();
  } catch {
    error.value = 'データの取得に失敗しました。';
  }
}

async function onFormSubmit(payload: {
  title: string; description: string; priority: TaskPriority;
  assignee: string; dueDate: string | null; issueType: TaskType; status?: TaskStatus;
}) {
  try {
    error.value = '';
    if (editing.value) {
      const updated = await updateTask(editing.value.id, payload);
      if (selectedTask.value?.id === editing.value.id) selectedTask.value = updated;
    } else {
      await createTask(payload);
    }
    editing.value = null;
    showForm.value = false;
    await load();
  } catch {
    error.value = editing.value ? '課題の更新に失敗しました。' : '課題の作成に失敗しました。';
  }
}

function onEdit(task: Task) {
  editing.value = task;
  selectedTask.value = null;
  showForm.value = true;
}

async function onStatusChange(task: Task, status: TaskStatus) {
  try {
    error.value = '';
    const updated = await updateTask(task.id, { status });
    selectedTask.value = updated;
    await load();
  } catch {
    error.value = 'ステータスの更新に失敗しました。';
  }
}

async function onDelete(id: number) {
  if (!confirm('この課題を削除しますか？')) return;
  try {
    error.value = '';
    await deleteTask(id);
    if (selectedTask.value?.id === id) selectedTask.value = null;
    await load();
  } catch {
    error.value = '課題の削除に失敗しました。';
  }
}

function openNewForm() {
  editing.value = null;
  showForm.value = true;
}

onMounted(() => {
  loadAndApplyTheme();
  load();
});
</script>

<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">📋</span>
          <span class="logo-text">MyProject</span>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-new" @click="openNewForm">＋ 課題を追加</button>
      </div>
    </header>

    <div class="app-body">
      <!-- Sidebar -->
      <nav class="sidebar">
        <ul>
          <li class="nav-item" :class="{ active: currentView === 'dashboard' }" @click="currentView = 'dashboard'">
            <span class="nav-icon">📊</span>
            <span>ダッシュボード</span>
          </li>
          <li class="nav-item" :class="{ active: currentView === 'issues' }" @click="currentView = 'issues'">
            <span class="nav-icon">📄</span>
            <span>課題一覧</span>
          </li>
          <li class="nav-item" @click="showSettings = true">
            <span class="nav-icon">⚙️</span>
            <span>設定</span>
          </li>
        </ul>
      </nav>

      <!-- Main content -->
      <main class="main-content">
        <!-- Dashboard view -->
        <Dashboard
          v-if="currentView === 'dashboard'"
          :tasks="tasks"
          @select="selectedTask = $event"
        />

        <!-- Issues view -->
        <template v-else>
        <div class="page-header">
          <h1 class="page-title">課題一覧</h1>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <!-- Status filter tabs -->
        <div class="tabs">
          <button
            v-for="tab in [
              { key: 'all', label: 'すべて' },
              { key: 'open', label: '未対応' },
              { key: 'in_progress', label: '処理中' },
              { key: 'resolved', label: '処理済み' },
              { key: 'closed', label: '完了' },
            ]"
            :key="tab.key"
            class="tab"
            :class="{ active: statusFilter === tab.key }"
            @click="statusFilter = tab.key as TaskStatus | 'all'"
          >
            {{ tab.label }}
            <span class="tab-count">{{ counts[tab.key as keyof typeof counts] }}</span>
          </button>
        </div>

        <!-- Issue table -->
        <div class="table-card">
          <TaskList
            :tasks="filteredTasks"
            @select="selectedTask = $event"
            @delete="onDelete"
          />
        </div>
        </template>
      </main>
    </div>

    <!-- Issue detail drawer -->
    <IssueDetail
      v-if="selectedTask"
      :task="selectedTask"
      @close="selectedTask = null"
      @edit="onEdit"
      @status-change="onStatusChange"
    />

    <!-- Issue form modal -->
    <TaskForm
      v-if="showForm"
      :editing="editing"
      @submit="onFormSubmit"
      @cancel="showForm = false; editing = null"
    />

    <!-- Settings modal -->
    <SettingsModal
      v-if="showSettings"
      @close="showSettings = false"
    />
  </div>
</template>

<style>
* { box-sizing: border-box; }

:root {
  --bg-page: #f1f5f9;
  --bg-card: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --tab-bg: #e2e8f0;
  --tab-color: #64748b;
  --hover-bg: #f0f7ff;
}

[data-theme='dark'] {
  --bg-page: #0f172a;
  --bg-card: #1e293b;
  --bg-secondary: #162032;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --tab-bg: #334155;
  --tab-color: #94a3b8;
  --hover-bg: #1e3a5f;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
  background: var(--bg-page);
  color: var(--text-primary);
  transition: background 0.2s, color 0.2s;
}
</style>

<style scoped>
.app-layout { display: flex; flex-direction: column; height: 100vh; }

/* Header */
.app-header {
  display: flex; align-items: center; justify-content: space-between;
  height: 52px; padding: 0 24px;
  background: #1e3a5f; color: #fff; flex-shrink: 0;
}
.header-left { display: flex; align-items: center; }
.logo { display: flex; align-items: center; gap: 8px; }
.logo-icon { font-size: 1.2rem; }
.logo-text { font-size: 1rem; font-weight: 700; letter-spacing: 0.3px; }
.btn-new {
  background: #2563eb; color: #fff; border: none;
  border-radius: 5px; padding: 7px 16px; cursor: pointer;
  font-size: 0.875rem; font-weight: 600;
  transition: background 0.15s;
}
.btn-new:hover { background: #1d4ed8; }

/* Body layout */
.app-body { display: flex; flex: 1; overflow: hidden; }

/* Sidebar */
.sidebar {
  width: 200px; flex-shrink: 0; background: #1a2e47; color: #cbd5e1;
  padding: 16px 0; overflow-y: auto;
}
.sidebar ul { list-style: none; margin: 0; padding: 0; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 20px; font-size: 0.88rem; cursor: pointer;
  transition: background 0.15s;
}
.nav-item:hover { background: #243b55; color: #fff; }
.nav-item.active { background: #2563eb; color: #fff; }
.nav-icon { font-size: 1rem; }

/* Main content */
.main-content { flex: 1; overflow-y: auto; padding: 24px; background: var(--bg-page); }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.page-title { margin: 0; font-size: 1.3rem; font-weight: 700; color: var(--text-primary); }

.error-msg {
  color: #dc2626; background: #fee2e2; border: 1px solid #fca5a5;
  border-radius: 6px; padding: 10px 14px; margin-bottom: 16px;
}

/* Status filter tabs */
.tabs { display: flex; gap: 2px; margin-bottom: 16px; border-bottom: 2px solid var(--border-color); }
.tab {
  padding: 8px 16px; background: none; border: none; cursor: pointer;
  font-size: 0.875rem; color: var(--tab-color); border-bottom: 2px solid transparent;
  margin-bottom: -2px; transition: all 0.15s; display: flex; align-items: center; gap: 6px;
}
.tab:hover { color: #2563eb; }
.tab.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
.tab-count {
  background: var(--tab-bg); color: var(--tab-color); border-radius: 100px;
  font-size: 0.72rem; padding: 1px 7px; font-weight: 600;
}
.tab.active .tab-count { background: #dbeafe; color: #2563eb; }

/* Table card */
.table-card {
  background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px;
  overflow: hidden;
}
</style>
