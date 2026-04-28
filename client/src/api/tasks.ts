import axios from 'axios';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task';

const api = axios.create({ baseURL: '/api' });

export const fetchTasks = (): Promise<Task[]> =>
  api.get<Task[]>('/tasks').then((r) => r.data);

export const createTask = (payload: CreateTaskPayload): Promise<Task> =>
  api.post<Task>('/tasks', payload).then((r) => r.data);

export const updateTask = (id: number, payload: UpdateTaskPayload): Promise<Task> =>
  api.put<Task>(`/tasks/${id}`, payload).then((r) => r.data);

export const deleteTask = (id: number): Promise<void> =>
  api.delete(`/tasks/${id}`).then(() => undefined);
