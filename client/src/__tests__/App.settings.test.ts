import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '../App.vue';

// API モック
vi.mock('../api/tasks', () => ({
  fetchTasks: vi.fn().mockResolvedValue([]),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock('../utils/theme', () => ({
  applyTheme: vi.fn(),
  loadAndApplyTheme: vi.fn(),
}));

// 子コンポーネントはスタブ
const stubs = {
  Dashboard: { template: '<div data-testid="dashboard" />' },
  TaskList: { template: '<div data-testid="task-list" />' },
  Settings: { template: '<div data-testid="settings" />' },
  TaskForm: { template: '<div />' },
  IssueDetail: { template: '<div />' },
};

describe('App.vue – ナビゲーション切り替え', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('デフォルト表示はダッシュボードである', async () => {
    const wrapper = mount(App, { global: { stubs } });
    await new Promise((r) => setTimeout(r, 0)); // nextTick
    expect(wrapper.find('[data-testid="dashboard"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="task-list"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="settings"]').exists()).toBe(false);
  });

  it('課題一覧ナビをクリックすると課題一覧が表示される', async () => {
    const wrapper = mount(App, { global: { stubs } });
    await wrapper.find('[data-view="issues"]').trigger('click');
    expect(wrapper.find('[data-testid="task-list"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="dashboard"]').exists()).toBe(false);
  });

  it('設定ナビをクリックすると設定ページが表示される', async () => {
    const wrapper = mount(App, { global: { stubs } });
    await wrapper.find('[data-view="settings"]').trigger('click');
    expect(wrapper.find('[data-testid="settings"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="dashboard"]').exists()).toBe(false);
  });

  it('設定 → ダッシュボードと切り替えられる', async () => {
    const wrapper = mount(App, { global: { stubs } });
    await wrapper.find('[data-view="settings"]').trigger('click');
    expect(wrapper.find('[data-testid="settings"]').exists()).toBe(true);
    await wrapper.find('[data-view="dashboard"]').trigger('click');
    expect(wrapper.find('[data-testid="dashboard"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="settings"]').exists()).toBe(false);
  });
});
