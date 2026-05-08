<script setup lang="ts">
import { computed } from 'vue';
import type { Task, TaskStatus } from '../types/task';
import {
  statusLabel, statusClass,
  priorityLabel, priorityClass,
  typeLabel, typeClass,
  formatDate,
} from '../composables/useTaskMeta';

const props = defineProps<{ tasks: Task[] }>();
const emit = defineEmits<{ (e: 'select', task: Task): void }>();

const ACTIVE_STATUSES: readonly TaskStatus[] = ['open', 'in_progress'];

/** ローカルタイムで YYYY-MM-DD 文字列を返す */
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ステータスサマリー
const statusSummary = computed(() => [
  { key: 'open',        label: '未対応',   cls: 'status-open' },
  { key: 'in_progress', label: '処理中',   cls: 'status-in-progress' },
  { key: 'resolved',    label: '処理済み', cls: 'status-resolved' },
  { key: 'closed',      label: '完了',     cls: 'status-closed' },
].map((s) => ({
  ...s,
  count: props.tasks.filter((t) => t.status === s.key).length,
})));

// 期日が迫っている課題（today〜+7日、未完了）
const dueSoonTasks = computed(() => {
  const todayStr = toLocalDateStr(new Date());
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + 7);
  const limitStr = toLocalDateStr(limitDate);
  return props.tasks.filter((t) => {
    if (!t.dueDate) return false;
    if (!ACTIVE_STATUSES.includes(t.status)) return false;
    const dateStr = t.dueDate.slice(0, 10);
    return dateStr >= todayStr && dateStr <= limitStr;
  });
});

// 期限切れ課題（dueDate が今日より前、未完了）
const overdueTasks = computed(() => {
  const todayStr = toLocalDateStr(new Date());
  return props.tasks.filter((t) => {
    if (!t.dueDate) return false;
    if (!ACTIVE_STATUSES.includes(t.status)) return false;
    return t.dueDate.slice(0, 10) < todayStr;
  });
});

// 優先度が高い未完了課題
const highPriorityTasks = computed(() =>
  props.tasks.filter(
    (t) =>
      (t.priority === 'urgent' || t.priority === 'high') &&
      ACTIVE_STATUSES.includes(t.status),
  ),
);

// 未解決バグ
const unresolvedBugs = computed(() =>
  props.tasks.filter(
    (t) =>
      t.issueType === 'bug' &&
      ACTIVE_STATUSES.includes(t.status),
  ),
);
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">ダッシュボード</h1>
    </div>

    <!-- ステータスサマリー -->
    <section class="section">
      <h2 class="section-title">課題サマリー</h2>
      <div class="summary-cards">
        <div
          v-for="s in statusSummary"
          :key="s.key"
          class="summary-card"
        >
          <span class="summary-count">{{ s.count }}</span>
          <span class="summary-badge badge" :class="s.cls">{{ s.label }}</span>
        </div>
      </div>
    </section>

    <!-- 期限切れ課題 -->
    <section class="section">
      <h2 class="section-title">🚨 期限切れ課題</h2>
      <p v-if="overdueTasks.length === 0" class="empty">該当する課題はありません。</p>
      <div v-else class="widget-list">
        <div
          v-for="task in overdueTasks"
          :key="task.id"
          class="widget-row overdue"
          @click="emit('select', task)"
        >
          <span class="badge" :class="typeClass[task.issueType]">{{ typeLabel[task.issueType] }}</span>
          <span class="badge" :class="priorityClass[task.priority]">{{ priorityLabel[task.priority] }}</span>
          <span class="task-title">{{ task.title }}</span>
          <span class="due-date overdue-date">{{ formatDate(task.dueDate) }}</span>
          <span class="badge" :class="statusClass[task.status]">{{ statusLabel[task.status] }}</span>
        </div>
      </div>
    </section>

    <!-- 期日が迫っている課題 -->
    <section class="section">
      <h2 class="section-title">⏰ 期日が迫っている課題（7日以内）</h2>
      <p v-if="dueSoonTasks.length === 0" class="empty">該当する課題はありません。</p>
      <div v-else class="widget-list">
        <div
          v-for="task in dueSoonTasks"
          :key="task.id"
          class="widget-row"
          @click="emit('select', task)"
        >
          <span class="badge" :class="typeClass[task.issueType]">{{ typeLabel[task.issueType] }}</span>
          <span class="badge" :class="priorityClass[task.priority]">{{ priorityLabel[task.priority] }}</span>
          <span class="task-title">{{ task.title }}</span>
          <span class="due-date">{{ formatDate(task.dueDate) }}</span>
          <span class="badge" :class="statusClass[task.status]">{{ statusLabel[task.status] }}</span>
        </div>
      </div>
    </section>

    <!-- 優先度が高い未完了課題 -->
    <section class="section">
      <h2 class="section-title">🔴 優先度が高い未完了課題</h2>
      <p v-if="highPriorityTasks.length === 0" class="empty">該当する課題はありません。</p>
      <div v-else class="widget-list">
        <div
          v-for="task in highPriorityTasks"
          :key="task.id"
          class="widget-row"
          @click="emit('select', task)"
        >
          <span class="badge" :class="typeClass[task.issueType]">{{ typeLabel[task.issueType] }}</span>
          <span class="badge" :class="priorityClass[task.priority]">{{ priorityLabel[task.priority] }}</span>
          <span class="task-title">{{ task.title }}</span>
          <span class="badge" :class="statusClass[task.status]">{{ statusLabel[task.status] }}</span>
        </div>
      </div>
    </section>

    <!-- 未解決バグ -->
    <section class="section">
      <h2 class="section-title">🐛 未解決バグ</h2>
      <p v-if="unresolvedBugs.length === 0" class="empty">該当する課題はありません。</p>
      <div v-else class="widget-list">
        <div
          v-for="task in unresolvedBugs"
          :key="task.id"
          class="widget-row"
          @click="emit('select', task)"
        >
          <span class="badge" :class="priorityClass[task.priority]">{{ priorityLabel[task.priority] }}</span>
          <span class="task-title">{{ task.title }}</span>
          <span class="badge" :class="statusClass[task.status]">{{ statusLabel[task.status] }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard { padding: 24px; }
.page-header { margin-bottom: 24px; }
.page-title { margin: 0; font-size: 1.3rem; font-weight: 700; color: var(--text-primary); }

.section { margin-bottom: 32px; }
.section-title {
  margin: 0 0 12px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 8px;
}

/* サマリーカード */
.summary-cards { display: flex; gap: 16px; flex-wrap: wrap; }
.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 28px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  min-width: 110px;
}
.summary-count {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

/* ウィジェットリスト */
.widget-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}
.widget-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;
}
.widget-row:last-child { border-bottom: none; }
.widget-row:hover { background: var(--hover-bg); }

.task-title {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-primary);
}
.due-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
}
.overdue-date {
  color: #dc2626;
  font-weight: 600;
}
.widget-row.overdue {
  border-left: 3px solid #dc2626;
}

.badge {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
/* Status */
.status-open        { background: #dbeafe; color: #1d4ed8; }
.status-in-progress { background: #fef9c3; color: #b45309; }
.status-resolved    { background: #dcfce7; color: #15803d; }
.status-closed      { background: #f1f5f9; color: #64748b; }
/* Priority */
.prio-urgent { background: #fee2e2; color: #b91c1c; }
.prio-high   { background: #ffedd5; color: #c2410c; }
.prio-normal { background: #e0f2fe; color: #0369a1; }
.prio-low    { background: #f1f5f9; color: #64748b; }
/* Type */
.type-task    { background: #ede9fe; color: #6d28d9; }
.type-bug     { background: #fee2e2; color: #b91c1c; }
.type-feature { background: #d1fae5; color: #065f46; }

.empty {
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: 20px 14px;
  margin: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
</style>
