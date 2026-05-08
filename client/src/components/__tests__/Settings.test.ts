import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Settings from '../Settings.vue';

vi.mock('../../utils/theme', () => ({
  applyTheme: vi.fn(),
}));

import { applyTheme } from '../../utils/theme';

const STORAGE_KEY = 'app-settings';

function setStorage(value: object) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

describe('Settings.vue', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // ── 初期値 ────────────────────────────────────────────────

  it('localStorageが空のときデフォルト値でレンダリングされる', () => {
    const wrapper = mount(Settings);
    expect((wrapper.find('#displayName').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('input[value="auto"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper.find('input[value="ja"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper.find('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(false);
    expect((wrapper.find('#timezone').element as HTMLSelectElement).value).toBe('Asia/Tokyo');
  });

  it('localStorageの保存値でフォームが初期化される', () => {
    setStorage({ displayName: 'テストユーザー', theme: 'dark', language: 'en', notificationsEnabled: true, timezone: 'UTC' });
    const wrapper = mount(Settings);
    expect((wrapper.find('#displayName').element as HTMLInputElement).value).toBe('テストユーザー');
    expect((wrapper.find('input[value="dark"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper.find('input[value="en"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper.find('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(true);
    expect((wrapper.find('#timezone').element as HTMLSelectElement).value).toBe('UTC');
  });

  it('localStorageのJSONが不正でもデフォルト値でレンダリングされる', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-json{{{');
    const wrapper = mount(Settings);
    expect((wrapper.find('#displayName').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('input[value="auto"]').element as HTMLInputElement).checked).toBe(true);
  });

  // ── 保存（displayName は debounce） ───────────────────────

  it('表示名変更後 500ms でlocalStorageに保存される（debounce）', async () => {
    vi.useFakeTimers();
    const wrapper = mount(Settings);
    await wrapper.find('#displayName').setValue('新しい名前');
    await nextTick();
    // debounce 前は保存されない
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    vi.advanceTimersByTime(500);
    await nextTick();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.displayName).toBe('新しい名前');
  });

  it('テーマを変更するとlocalStorageに即時保存しapplyThemeが呼ばれる', async () => {
    const wrapper = mount(Settings);
    await wrapper.find('input[value="dark"]').setValue(true);
    await nextTick();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.theme).toBe('dark');
    expect(applyTheme).toHaveBeenCalledWith('dark');
  });

  it('通知設定を変更するとlocalStorageに即時保存される', async () => {
    const wrapper = mount(Settings);
    await wrapper.find('input[type="checkbox"]').setValue(true);
    await nextTick();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.notificationsEnabled).toBe(true);
  });

  it('タイムゾーンを変更するとlocalStorageに即時保存される', async () => {
    const wrapper = mount(Settings);
    await wrapper.find('#timezone').setValue('Europe/London');
    await nextTick();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.timezone).toBe('Europe/London');
  });

  // ── レンダリング ──────────────────────────────────────────

  it('タイムゾーンのselectにすべての選択肢が表示される', () => {
    const wrapper = mount(Settings);
    const options = wrapper.findAll('#timezone option');
    expect(options.length).toBeGreaterThanOrEqual(13);
    const values = options.map((o) => (o.element as HTMLOptionElement).value);
    expect(values).toContain('Asia/Tokyo');
    expect(values).toContain('UTC');
    expect(values).toContain('America/New_York');
  });

  it('未実装セクションに「準備中」バッジが表示される', () => {
    const wrapper = mount(Settings);
    const badges = wrapper.findAll('.coming-soon');
    expect(badges.length).toBe(3); // 言語・通知設定・タイムゾーン
    badges.forEach((b) => expect(b.text()).toBe('準備中'));
  });
});
