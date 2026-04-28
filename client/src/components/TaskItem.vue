<script setup lang="ts">
import type { Task } from '../types/task';

defineProps<{ task: Task }>();
const emit = defineEmits<{
  (e: 'toggle', task: Task): void;
  (e: 'edit', task: Task): void;
  (e: 'delete', id: number): void;
}>();
</script>

<template>
  <div class="task-item" :class="{ done: task.status === 'done' }">
    <input
      type="checkbox"
      :checked="task.status === 'done'"
      @change="emit('toggle', task)"
    />
    <div class="content">
      <p class="title">{{ task.title }}</p>
      <p v-if="task.description" class="description">{{ task.description }}</p>
    </div>
    <div class="item-actions">
      <button class="btn-edit" @click="emit('edit', task)">編集</button>
      <button class="btn-delete" @click="emit('delete', task.id)">削除</button>
    </div>
  </div>
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 16px;
  transition: opacity 0.2s;
}
.task-item.done { opacity: 0.55; }
.task-item.done .title { text-decoration: line-through; color: #a0aec0; }
input[type='checkbox'] { margin-top: 3px; width: 17px; height: 17px; cursor: pointer; }
.content { flex: 1; min-width: 0; }
.title { margin: 0; font-weight: 600; color: #2d3748; word-break: break-word; }
.description { margin: 4px 0 0; font-size: 0.85rem; color: #718096; word-break: break-word; }
.item-actions { display: flex; gap: 6px; flex-shrink: 0; }
.btn-edit {
  background: #ebf8ff; color: #2b6cb0; border: 1px solid #bee3f8;
  border-radius: 5px; padding: 4px 12px; cursor: pointer; font-size: 0.85rem;
}
.btn-edit:hover { background: #bee3f8; }
.btn-delete {
  background: #fff5f5; color: #c53030; border: 1px solid #fed7d7;
  border-radius: 5px; padding: 4px 12px; cursor: pointer; font-size: 0.85rem;
}
.btn-delete:hover { background: #fed7d7; }
</style>
