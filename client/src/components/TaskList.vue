<script setup lang="ts">
import type { Task, TaskStatus } from '../types/task';
import {
  statusLabel, statusClass,
  priorityLabel, priorityClass,
  typeLabel, typeClass,
  formatDate,
} from '../composables/useTaskMeta';

defineProps<{ tasks: Task[] }>();
const emit = defineEmits<{
  (e: 'select', task: Task): void;
  (e: 'delete', id: number): void;
}>();

function isOverdue(d: string | null, status: TaskStatus) {
  if (!d || status === 'closed' || status === 'resolved') return false;
  return new Date(d) < new Date(new Date().toDateString());
}
</script>

<template>
  <div class="issue-table-wrap">
    <p v-if="tasks.length === 0" class="empty">課題がありません。</p>
    <table v-else class="issue-table">
      <thead>
        <tr>
          <th class="col-type">種別</th>
          <th class="col-prio">優先度</th>
          <th class="col-title">件名</th>
          <th class="col-assignee">担当者</th>
          <th class="col-due">期限日</th>
          <th class="col-status">状態</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="task in tasks"
          :key="task.id"
          class="issue-row"
          :class="{ closed: task.status === 'closed' }"
          @click="emit('select', task)"
        >
          <td><span class="badge" :class="typeClass[task.issueType]">{{ typeLabel[task.issueType] }}</span></td>
          <td><span class="badge" :class="priorityClass[task.priority]">{{ priorityLabel[task.priority] }}</span></td>
          <td class="col-title-cell">{{ task.title }}</td>
          <td class="col-text">{{ task.assignee || '—' }}</td>
          <td class="col-text" :class="{ overdue: isOverdue(task.dueDate, task.status) }">
            {{ formatDate(task.dueDate) || '—' }}
          </td>
          <td><span class="badge" :class="statusClass[task.status]">{{ statusLabel[task.status] }}</span></td>
          <td @click.stop>
            <button class="btn-del" @click="emit('delete', task.id)">削除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.issue-table-wrap { overflow-x: auto; }
.issue-table {
  width: 100%; border-collapse: collapse; font-size: 0.88rem;
  background: #fff;
}
.issue-table thead tr {
  background: #f8fafc; border-bottom: 2px solid #e2e8f0;
}
.issue-table th {
  padding: 10px 12px; text-align: left; font-size: 0.78rem;
  font-weight: 700; color: #64748b; white-space: nowrap;
}
.issue-row { border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.15s; }
.issue-row:hover { background: #f0f7ff; }
.issue-row.closed { opacity: 0.55; }
.issue-row td { padding: 10px 12px; vertical-align: middle; }
.col-title-cell { font-weight: 500; color: #1e3a5f; max-width: 360px; }
.col-text { color: #475569; white-space: nowrap; }
.overdue { color: #dc2626; font-weight: 600; }
.empty { color: #94a3b8; text-align: center; padding: 48px 0; }
.badge {
  display: inline-block; padding: 2px 9px; border-radius: 100px;
  font-size: 0.75rem; font-weight: 600; white-space: nowrap;
}
/* Status */
.status-open { background: #dbeafe; color: #1d4ed8; }
.status-in-progress { background: #fef9c3; color: #b45309; }
.status-resolved { background: #dcfce7; color: #15803d; }
.status-closed { background: #f1f5f9; color: #64748b; }
/* Priority */
.prio-urgent { background: #fee2e2; color: #b91c1c; }
.prio-high { background: #ffedd5; color: #c2410c; }
.prio-normal { background: #e0f2fe; color: #0369a1; }
.prio-low { background: #f1f5f9; color: #64748b; }
/* Type */
.type-task { background: #ede9fe; color: #6d28d9; }
.type-bug { background: #fee2e2; color: #b91c1c; }
.type-feature { background: #d1fae5; color: #065f46; }

.btn-del {
  background: none; border: 1px solid #fca5a5; color: #dc2626;
  border-radius: 4px; padding: 3px 10px; cursor: pointer; font-size: 0.78rem;
}
.btn-del:hover { background: #fee2e2; }
.col-type { width: 70px; }
.col-prio { width: 70px; }
.col-assignee { width: 110px; }
.col-due { width: 100px; }
.col-status { width: 90px; }
.col-actions { width: 60px; }
</style>
