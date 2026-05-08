import type { TaskStatus, TaskPriority, TaskType } from '../types/task';

export const statusLabel: Record<TaskStatus, string> = {
  open: '未対応',
  in_progress: '処理中',
  resolved: '処理済み',
  closed: '完了',
};

export const statusClass: Record<TaskStatus, string> = {
  open: 'status-open',
  in_progress: 'status-in-progress',
  resolved: 'status-resolved',
  closed: 'status-closed',
};

export const priorityLabel: Record<TaskPriority, string> = {
  urgent: '緊急',
  high: '高',
  normal: '中',
  low: '低',
};

export const priorityClass: Record<TaskPriority, string> = {
  urgent: 'prio-urgent',
  high: 'prio-high',
  normal: 'prio-normal',
  low: 'prio-low',
};

export const typeLabel: Record<TaskType, string> = {
  task: 'タスク',
  bug: 'バグ',
  feature: '要望',
};

export const typeClass: Record<TaskType, string> = {
  task: 'type-task',
  bug: 'type-bug',
  feature: 'type-feature',
};

export function formatDate(d: string | null): string {
  if (!d) return '';
  return d.slice(0, 10);
}

export function formatDateTime(d: string): string {
  return d.slice(0, 16).replace('T', ' ');
}
