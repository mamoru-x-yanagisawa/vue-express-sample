<script setup lang="ts">
import type { Task, TaskStatus, TaskPriority, TaskType } from '../types/task';

defineProps<{ task: Task }>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'edit', task: Task): void;
  (e: 'status-change', task: Task, status: TaskStatus): void;
}>();

const statusLabel: Record<TaskStatus, string> = {
  open: '未対応', in_progress: '処理中', resolved: '処理済み', closed: '完了',
};
const statusClass: Record<TaskStatus, string> = {
  open: 'status-open', in_progress: 'status-in-progress',
  resolved: 'status-resolved', closed: 'status-closed',
};
const priorityLabel: Record<TaskPriority, string> = {
  urgent: '緊急', high: '高', normal: '中', low: '低',
};
const priorityClass: Record<TaskPriority, string> = {
  urgent: 'prio-urgent', high: 'prio-high', normal: 'prio-normal', low: 'prio-low',
};
const typeLabel: Record<TaskType, string> = {
  task: 'タスク', bug: 'バグ', feature: '要望',
};

function formatDate(d: string | null) {
  if (!d) return '—';
  return d.slice(0, 10);
}

function formatDateTime(d: string) {
  return d.slice(0, 16).replace('T', ' ');
}

const statusFlow: TaskStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
</script>

<template>
  <div class="drawer-backdrop" @click.self="emit('close')">
    <div class="drawer">
      <div class="drawer-header">
        <div class="drawer-title">
          <span class="issue-type-label">{{ typeLabel[task.issueType] }}</span>
          <span class="issue-id">#{{ task.id }}</span>
        </div>
        <div class="drawer-actions">
          <button class="btn-edit" @click="emit('edit', task)">編集</button>
          <button class="btn-close" @click="emit('close')">✕</button>
        </div>
      </div>

      <div class="drawer-body">
        <h1 class="issue-title">{{ task.title }}</h1>

        <div class="status-buttons">
          <button
            v-for="s in statusFlow"
            :key="s"
            class="status-btn"
            :class="[statusClass[s], { active: task.status === s }]"
            @click="emit('status-change', task, s)"
          >
            {{ statusLabel[s] }}
          </button>
        </div>

        <div class="meta-grid">
          <div class="meta-row">
            <span class="meta-label">優先度</span>
            <span class="badge" :class="priorityClass[task.priority]">{{ priorityLabel[task.priority] }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">担当者</span>
            <span class="meta-value">{{ task.assignee || '—' }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">期限日</span>
            <span class="meta-value">{{ formatDate(task.dueDate) }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">登録日</span>
            <span class="meta-value">{{ formatDateTime(task.createdAt) }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">更新日</span>
            <span class="meta-value">{{ formatDateTime(task.updatedAt) }}</span>
          </div>
        </div>

        <div class="description-section">
          <div class="desc-label">詳細</div>
          <div class="desc-body" v-if="task.description">{{ task.description }}</div>
          <div class="desc-empty" v-else>詳細はありません。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 900;
  display: flex; justify-content: flex-end;
}
.drawer {
  background: var(--bg-card); width: 520px; max-width: 95vw; height: 100%;
  display: flex; flex-direction: column;
  box-shadow: -4px 0 24px rgba(0,0,0,0.15);
  animation: slideIn 0.2s ease;
}
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--border-color); flex-shrink: 0;
}
.drawer-title { display: flex; align-items: center; gap: 10px; }
.issue-type-label {
  font-size: 0.75rem; font-weight: 700; background: #ede9fe; color: #6d28d9;
  padding: 2px 8px; border-radius: 4px;
}
.issue-id { font-size: 0.85rem; color: var(--text-secondary); }
.drawer-actions { display: flex; gap: 8px; align-items: center; }
.btn-edit {
  background: #f0f7ff; color: #2563eb; border: 1px solid #bfdbfe;
  border-radius: 5px; padding: 5px 14px; cursor: pointer; font-size: 0.85rem;
}
.btn-edit:hover { background: #dbeafe; }
.btn-close {
  background: none; border: none; font-size: 1.1rem; cursor: pointer;
  color: var(--text-secondary); padding: 4px 8px; border-radius: 4px;
}
.btn-close:hover { background: var(--bg-secondary); color: var(--text-primary); }

.drawer-body { flex: 1; overflow-y: auto; padding: 24px 24px; }
.issue-title { margin: 0 0 20px; font-size: 1.2rem; color: var(--text-primary); line-height: 1.4; }

.status-buttons { display: flex; gap: 6px; margin-bottom: 24px; flex-wrap: wrap; }
.status-btn {
  border: 2px solid transparent; border-radius: 100px; padding: 5px 14px;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; background: var(--tab-bg); color: var(--tab-color);
  transition: all 0.15s;
}
.status-btn:hover { opacity: 0.8; }
.status-btn.active { border-color: currentColor; }

.status-open.active, .status-btn.status-open:hover { background: #dbeafe; color: #1d4ed8; }
.status-in-progress.active, .status-btn.status-in-progress:hover { background: #fef9c3; color: #b45309; }
.status-resolved.active, .status-btn.status-resolved:hover { background: #dcfce7; color: #15803d; }
.status-closed.active, .status-btn.status-closed:hover { background: #f1f5f9; color: #64748b; }

.meta-grid {
  background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px;
  padding: 16px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px;
}
.meta-row { display: flex; align-items: center; gap: 12px; }
.meta-label { font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); width: 64px; flex-shrink: 0; }
.meta-value { font-size: 0.88rem; color: var(--text-primary); }
.badge {
  display: inline-block; padding: 2px 9px; border-radius: 100px;
  font-size: 0.75rem; font-weight: 600;
}
.prio-urgent { background: #fee2e2; color: #b91c1c; }
.prio-high { background: #ffedd5; color: #c2410c; }
.prio-normal { background: #e0f2fe; color: #0369a1; }
.prio-low { background: #f1f5f9; color: #64748b; }

.description-section { }
.desc-label { font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 8px; }
.desc-body { font-size: 0.9rem; color: var(--text-primary); line-height: 1.7; white-space: pre-wrap; }
.desc-empty { font-size: 0.88rem; color: var(--text-secondary); font-style: italic; }
</style>
