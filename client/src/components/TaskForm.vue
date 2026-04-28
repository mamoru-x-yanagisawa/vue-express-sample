<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Task, TaskStatus, TaskPriority, TaskType } from '../types/task';

const props = defineProps<{ editing?: Task | null }>();

const emit = defineEmits<{
  (e: 'submit', payload: {
    title: string; description: string; priority: TaskPriority;
    assignee: string; dueDate: string | null; issueType: TaskType; status?: TaskStatus;
  }): void;
  (e: 'cancel'): void;
}>();

const title = ref('');
const description = ref('');
const priority = ref<TaskPriority>('normal');
const assignee = ref('');
const dueDate = ref('');
const issueType = ref<TaskType>('task');
const status = ref<TaskStatus>('open');

watch(() => props.editing, (task) => {
  title.value = task?.title ?? '';
  description.value = task?.description ?? '';
  priority.value = task?.priority ?? 'normal';
  assignee.value = task?.assignee ?? '';
  dueDate.value = task?.dueDate ?? '';
  issueType.value = task?.issueType ?? 'task';
  status.value = task?.status ?? 'open';
}, { immediate: true });

function onSubmit() {
  if (!title.value.trim()) return;
  emit('submit', {
    title: title.value.trim(),
    description: description.value,
    priority: priority.value,
    assignee: assignee.value,
    dueDate: dueDate.value || null,
    issueType: issueType.value,
    ...(props.editing ? { status: status.value } : {}),
  });
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('cancel')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ editing ? '課題を編集' : '課題を追加' }}</h2>
        <button class="btn-close" @click="emit('cancel')">✕</button>
      </div>
      <form class="modal-body" @submit.prevent="onSubmit">
        <div class="field">
          <label>件名 <span class="required">*</span></label>
          <input v-model="title" type="text" placeholder="課題の件名を入力" required />
        </div>
        <div class="field-row">
          <div class="field">
            <label>種別</label>
            <select v-model="issueType">
              <option value="task">タスク</option>
              <option value="bug">バグ</option>
              <option value="feature">要望</option>
            </select>
          </div>
          <div class="field">
            <label>優先度</label>
            <select v-model="priority">
              <option value="urgent">緊急</option>
              <option value="high">高</option>
              <option value="normal">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div v-if="editing" class="field">
            <label>状態</label>
            <select v-model="status">
              <option value="open">未対応</option>
              <option value="in_progress">処理中</option>
              <option value="resolved">処理済み</option>
              <option value="closed">完了</option>
            </select>
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>担当者</label>
            <input v-model="assignee" type="text" placeholder="担当者名" />
          </div>
          <div class="field">
            <label>期限日</label>
            <input v-model="dueDate" type="date" />
          </div>
        </div>
        <div class="field">
          <label>詳細</label>
          <textarea v-model="description" placeholder="課題の詳細を入力（任意）" rows="5" />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="emit('cancel')">キャンセル</button>
          <button type="submit" class="btn-primary">{{ editing ? '更新' : '追加' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: #fff; border-radius: 8px; width: 600px; max-width: 95vw;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid #e2e8f0;
}
.modal-header h2 { margin: 0; font-size: 1.1rem; color: #1a202c; }
.btn-close {
  background: none; border: none; font-size: 1.1rem; cursor: pointer;
  color: #718096; padding: 4px 8px; border-radius: 4px;
}
.btn-close:hover { background: #f7fafc; color: #2d3748; }
.modal-body { padding: 24px; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.field-row { display: flex; gap: 16px; }
.field-row .field { flex: 1; }
label { font-size: 0.82rem; font-weight: 600; color: #4a5568; }
.required { color: #e53e3e; }
input, select, textarea {
  border: 1px solid #cbd5e0; border-radius: 5px;
  padding: 8px 10px; font-size: 0.9rem; outline: none;
  transition: border-color 0.2s; background: #fff;
}
input:focus, select:focus, textarea:focus { border-color: #3b82f6; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding-top: 8px; border-top: 1px solid #e2e8f0; margin-top: 8px;
}
.btn-primary {
  background: #2563eb; color: #fff; border: none;
  border-radius: 5px; padding: 8px 24px; cursor: pointer; font-size: 0.9rem;
}
.btn-primary:hover { background: #1d4ed8; }
.btn-secondary {
  background: #f1f5f9; color: #475569; border: 1px solid #cbd5e0;
  border-radius: 5px; padding: 8px 16px; cursor: pointer; font-size: 0.9rem;
}
.btn-secondary:hover { background: #e2e8f0; }
</style>
