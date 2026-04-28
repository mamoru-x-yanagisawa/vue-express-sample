/**
 * タスク管理アプリ セットアップスクリプト
 * 実行方法: node setup.js
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;

function mkdir(p) {
  fs.mkdirSync(p, { recursive: true });
  console.log('  mkdir:', path.relative(root, p));
}

function write(p, content) {
  fs.writeFileSync(p, content, 'utf8');
  console.log('  write:', path.relative(root, p));
}

// ─── ディレクトリ作成 ─────────────────────────────────────────────────────────
console.log('\n[1/3] Creating directories...');
mkdir(path.join(root, 'server', 'src', 'entity'));
mkdir(path.join(root, 'server', 'src', 'routes'));
mkdir(path.join(root, 'client', 'src', 'api'));
mkdir(path.join(root, 'client', 'src', 'components'));
mkdir(path.join(root, 'client', 'src', 'types'));

// ─── サーバーファイル ─────────────────────────────────────────────────────────
console.log('\n[2/3] Creating server files...');

write(path.join(root, 'server', 'package.json'), `{
  "name": "task-manager-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "reflect-metadata": "^0.2.1",
    "typeorm": "^0.3.20"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.8",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.5",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
`);

write(path.join(root, 'server', 'tsconfig.json'), `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`);

write(path.join(root, 'server', 'src', 'data-source.ts'), `import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Task } from './entity/Task';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'tasks.db',
  synchronize: true,
  logging: false,
  entities: [Task],
});
`);

write(path.join(root, 'server', 'src', 'entity', 'Task.ts'), `import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TaskStatus = 'pending' | 'done';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ default: '' })
  description!: string;

  @Column({ default: 'pending' })
  status!: TaskStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
`);

write(path.join(root, 'server', 'src', 'routes', 'tasks.ts'), `import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Task } from '../entity/Task';

const router = Router();
const repo = () => AppDataSource.getRepository(Task);

// GET /api/tasks
router.get('/', async (_req: Request, res: Response) => {
  const tasks = await repo().find({ order: { createdAt: 'DESC' } });
  res.json(tasks);
});

// POST /api/tasks
router.post('/', async (req: Request, res: Response) => {
  const { title, description } = req.body as { title: string; description?: string };
  if (!title?.trim()) {
    res.status(400).json({ message: 'title is required' });
    return;
  }
  const task = repo().create({ title: title.trim(), description: description ?? '' });
  const saved = await repo().save(task);
  res.status(201).json(saved);
});

// PUT /api/tasks/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const task = await repo().findOneBy({ id });
  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }
  const { title, description, status } = req.body as Partial<Task>;
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  const updated = await repo().save(task);
  res.json(updated);
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const task = await repo().findOneBy({ id });
  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return;
  }
  await repo().remove(task);
  res.status(204).send();
});

export default router;
`);

write(path.join(root, 'server', 'src', 'index.ts'), `import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import taskRoutes from './routes/tasks';

const app = express();
const PORT = 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/tasks', taskRoutes);

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(\`Server running on http://localhost:\${PORT}\`);
    });
  })
  .catch((err) => {
    console.error('Data source initialization error:', err);
    process.exit(1);
  });
`);

// ─── クライアントファイル ──────────────────────────────────────────────────────
console.log('\n[3/3] Creating client files...');

write(path.join(root, 'client', 'package.json'), `{
  "name": "task-manager-client",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.5",
    "vue": "^3.4.15"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.3",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "vue-tsc": "^1.8.27"
  }
}
`);

write(path.join(root, 'client', 'tsconfig.json'), `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
`);

write(path.join(root, 'client', 'vite.config.ts'), `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
`);

write(path.join(root, 'client', 'index.html'), `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>タスク管理</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`);

write(path.join(root, 'client', 'src', 'main.ts'), `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
`);

write(path.join(root, 'client', 'src', 'types', 'task.ts'), `export type TaskStatus = 'pending' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
`);

write(path.join(root, 'client', 'src', 'api', 'tasks.ts'), `import axios from 'axios';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';

const api = axios.create({ baseURL: '/api' });

export const fetchTasks = (): Promise<Task[]> =>
  api.get<Task[]>('/tasks').then((r) => r.data);

export const createTask = (payload: CreateTaskPayload): Promise<Task> =>
  api.post<Task>('/tasks', payload).then((r) => r.data);

export const updateTask = (id: number, payload: UpdateTaskPayload): Promise<Task> =>
  api.put<Task>(\`/tasks/\${id}\`, payload).then((r) => r.data);

export const deleteTask = (id: number): Promise<void> =>
  api.delete(\`/tasks/\${id}\`).then(() => undefined);
`);

write(path.join(root, 'client', 'src', 'components', 'TaskForm.vue'), `<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Task } from '../types/task';

const props = defineProps<{
  editing?: Task | null;
}>();

const emit = defineEmits<{
  (e: 'submit', title: string, description: string): void;
  (e: 'cancel'): void;
}>();

const title = ref(props.editing?.title ?? '');
const description = ref(props.editing?.description ?? '');

watch(() => props.editing, (task) => {
  title.value = task?.title ?? '';
  description.value = task?.description ?? '';
});

function onSubmit() {
  if (!title.value.trim()) return;
  emit('submit', title.value.trim(), description.value);
  title.value = '';
  description.value = '';
}
</script>

<template>
  <form class="task-form" @submit.prevent="onSubmit">
    <h2>{{ editing ? 'タスクを編集' : 'タスクを追加' }}</h2>
    <div class="field">
      <label>タイトル <span class="required">*</span></label>
      <input v-model="title" type="text" placeholder="タイトルを入力" required />
    </div>
    <div class="field">
      <label>説明</label>
      <textarea v-model="description" placeholder="説明を入力（任意）" rows="3" />
    </div>
    <div class="actions">
      <button type="submit" class="btn-primary">
        {{ editing ? '更新' : '追加' }}
      </button>
      <button v-if="editing" type="button" class="btn-secondary" @click="emit('cancel')">
        キャンセル
      </button>
    </div>
  </form>
</template>

<style scoped>
.task-form {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}
h2 { margin: 0 0 16px; font-size: 1.1rem; color: #2d3748; }
.field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
label { font-size: 0.875rem; font-weight: 600; color: #4a5568; }
.required { color: #e53e3e; }
input, textarea {
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}
input:focus, textarea:focus { border-color: #4299e1; }
.actions { display: flex; gap: 8px; }
.btn-primary {
  background: #4299e1; color: #fff; border: none;
  border-radius: 6px; padding: 8px 20px; cursor: pointer; font-size: 0.95rem;
}
.btn-primary:hover { background: #3182ce; }
.btn-secondary {
  background: #e2e8f0; color: #4a5568; border: none;
  border-radius: 6px; padding: 8px 16px; cursor: pointer; font-size: 0.95rem;
}
.btn-secondary:hover { background: #cbd5e0; }
</style>
`);

write(path.join(root, 'client', 'src', 'components', 'TaskItem.vue'), `<script setup lang="ts">
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
`);

write(path.join(root, 'client', 'src', 'components', 'TaskList.vue'), `<script setup lang="ts">
import type { Task } from '../types/task';
import TaskItem from './TaskItem.vue';

defineProps<{ tasks: Task[] }>();
const emit = defineEmits<{
  (e: 'toggle', task: Task): void;
  (e: 'edit', task: Task): void;
  (e: 'delete', id: number): void;
}>();
</script>

<template>
  <div class="task-list">
    <p v-if="tasks.length === 0" class="empty">タスクがありません。</p>
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @toggle="emit('toggle', task)"
      @edit="emit('edit', task)"
      @delete="emit('delete', task.id)"
    />
  </div>
</template>

<style scoped>
.task-list { display: flex; flex-direction: column; gap: 10px; }
.empty { color: #a0aec0; text-align: center; padding: 32px 0; }
</style>
`);

write(path.join(root, 'client', 'src', 'App.vue'), `<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Task } from './types/task';
import { fetchTasks, createTask, updateTask, deleteTask } from './api/tasks';
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';

const tasks = ref<Task[]>([]);
const editing = ref<Task | null>(null);
const error = ref('');

async function load() {
  try {
    tasks.value = await fetchTasks();
  } catch {
    error.value = 'タスクの取得に失敗しました。';
  }
}

async function onCreate(title: string, description: string) {
  await createTask({ title, description });
  await load();
}

async function onEdit(task: Task) {
  editing.value = task;
}

async function onUpdate(title: string, description: string) {
  if (!editing.value) return;
  await updateTask(editing.value.id, { title, description });
  editing.value = null;
  await load();
}

async function onFormSubmit(title: string, description: string) {
  if (editing.value) {
    await onUpdate(title, description);
  } else {
    await onCreate(title, description);
  }
}

async function onToggle(task: Task) {
  await updateTask(task.id, { status: task.status === 'done' ? 'pending' : 'done' });
  await load();
}

async function onDelete(id: number) {
  if (!confirm('このタスクを削除しますか？')) return;
  await deleteTask(id);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="app">
    <header>
      <h1>📋 タスク管理</h1>
    </header>
    <main>
      <p v-if="error" class="error">{{ error }}</p>
      <TaskForm
        :editing="editing"
        @submit="onFormSubmit"
        @cancel="editing = null"
      />
      <TaskList
        :tasks="tasks"
        @toggle="onToggle"
        @edit="onEdit"
        @delete="onDelete"
      />
    </main>
  </div>
</template>

<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f7fafc; }
.app { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
header { margin-bottom: 24px; }
h1 { margin: 0; font-size: 1.6rem; color: #2d3748; }
.error { color: #c53030; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 6px; padding: 10px 14px; }
</style>
`);

// ─── ルート package.json ──────────────────────────────────────────────────────
write(path.join(root, 'package.json'), `{
  "name": "vue-express-sample",
  "private": true,
  "scripts": {
    "server": "cd server && npm run dev",
    "client": "cd client && npm run dev",
    "install:all": "cd server && npm install && cd ../client && npm install"
  }
}
`);

write(path.join(root, '.gitignore'), `node_modules/
dist/
*.db
`);

console.log('\n✅ All files created successfully!');
console.log('\nNext steps:');
console.log('  1. cd server && npm install');
console.log('  2. cd ../client && npm install');
console.log('  3. In one terminal: cd server && npm run dev');
console.log('  4. In another terminal: cd client && npm run dev');
console.log('  5. Open http://localhost:5173\n');
