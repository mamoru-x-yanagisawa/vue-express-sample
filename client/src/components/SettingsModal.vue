<script setup lang="ts">
import { ref } from 'vue';
import { applyTheme } from '../utils/theme';

const STORAGE_KEY = 'app-settings';

interface AppSettings {
  displayName: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'ja' | 'en';
  notificationsEnabled: boolean;
  timezone: string;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppSettings;
  } catch {
    // ignore parse errors
  }
  return { displayName: '', theme: 'auto', language: 'ja', notificationsEnabled: false, timezone: 'Asia/Tokyo' };
}

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const saved = loadSettings();
const displayName = ref(saved.displayName);
const theme = ref<'light' | 'dark' | 'auto'>(saved.theme);
const language = ref<'ja' | 'en'>(saved.language);
const notificationsEnabled = ref(saved.notificationsEnabled);
const timezone = ref(saved.timezone);

const timezones = [
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'UTC',
];

function onSave() {
  const settings: AppSettings = {
    displayName: displayName.value,
    theme: theme.value,
    language: language.value,
    notificationsEnabled: notificationsEnabled.value,
    timezone: timezone.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  applyTheme(theme.value);
  emit('close');
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>⚙️ 設定</h2>
        <button class="btn-close" @click="emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <!-- ユーザー情報 -->
        <section class="section">
          <h3 class="section-title">ユーザー情報</h3>
          <div class="field">
            <label for="displayName">表示名</label>
            <input
              id="displayName"
              v-model="displayName"
              type="text"
              placeholder="表示名を入力"
            />
          </div>
        </section>

        <div class="divider" />

        <!-- テーマ -->
        <section class="section">
          <h3 class="section-title">テーマ</h3>
          <div class="radio-group">
            <label class="radio-label">
              <input v-model="theme" type="radio" value="light" />
              <span>☀️ ライト</span>
            </label>
            <label class="radio-label">
              <input v-model="theme" type="radio" value="dark" />
              <span>🌙 ダーク</span>
            </label>
            <label class="radio-label">
              <input v-model="theme" type="radio" value="auto" />
              <span>🖥️ 自動（システム設定に従う）</span>
            </label>
          </div>
        </section>

        <div class="divider" />

        <!-- 言語 -->
        <section class="section">
          <h3 class="section-title">言語</h3>
          <div class="radio-group">
            <label class="radio-label">
              <input v-model="language" type="radio" value="ja" />
              <span>🇯🇵 日本語</span>
            </label>
            <label class="radio-label">
              <input v-model="language" type="radio" value="en" />
              <span>🇺🇸 English</span>
            </label>
          </div>
        </section>

        <div class="divider" />

        <!-- 通知設定 -->
        <section class="section">
          <h3 class="section-title">通知設定</h3>
          <label class="toggle-label">
            <span>ブラウザ通知</span>
            <div class="toggle-wrap">
              <input
                v-model="notificationsEnabled"
                type="checkbox"
                class="toggle-input"
              />
              <span class="toggle-slider" />
            </div>
          </label>
          <p class="hint">ONにすると、課題の更新時にブラウザ通知を受け取れます。</p>
        </section>

        <div class="divider" />

        <!-- タイムゾーン -->
        <section class="section">
          <h3 class="section-title">タイムゾーン</h3>
          <div class="field">
            <label for="timezone">タイムゾーン</label>
            <select id="timezone" v-model="timezone">
              <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
            </select>
          </div>
        </section>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-secondary" @click="emit('close')">キャンセル</button>
        <button type="button" class="btn-primary" @click="onSave">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: var(--bg-card); border-radius: 8px; width: 520px; max-width: 95vw;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  display: flex; flex-direction: column;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid var(--border-color); flex-shrink: 0;
}
.modal-header h2 { margin: 0; font-size: 1.1rem; color: var(--text-primary); }
.btn-close {
  background: none; border: none; font-size: 1.1rem; cursor: pointer;
  color: var(--text-secondary); padding: 4px 8px; border-radius: 4px;
}
.btn-close:hover { background: var(--tab-bg); color: var(--text-primary); }
.modal-body { padding: 24px; overflow-y: auto; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 24px; border-top: 1px solid var(--border-color); flex-shrink: 0;
}

.section { margin-bottom: 4px; }
.section-title { margin: 0 0 12px; font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
.divider { border: none; border-top: 1px solid var(--border-color); margin: 20px 0; }

.field { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); }
input[type="text"], select {
  border: 1px solid var(--border-color); border-radius: 5px;
  padding: 8px 10px; font-size: 0.9rem; outline: none;
  transition: border-color 0.2s; background: var(--bg-card); color: var(--text-primary);
}
input[type="text"]:focus, select:focus { border-color: #3b82f6; }

.radio-group { display: flex; flex-direction: column; gap: 10px; }
.radio-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; color: var(--text-primary); cursor: pointer;
}
.radio-label input[type="radio"] { accent-color: #2563eb; width: 16px; height: 16px; }

.toggle-label {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.9rem; font-weight: 600; color: var(--text-primary); cursor: pointer;
}
.toggle-wrap { position: relative; display: inline-flex; align-items: center; }
.toggle-input { opacity: 0; width: 0; height: 0; position: absolute; }
.toggle-slider {
  display: inline-block; width: 40px; height: 22px; background: #cbd5e0;
  border-radius: 100px; transition: background 0.2s; cursor: pointer;
}
.toggle-slider::after {
  content: ''; position: absolute; left: 3px; top: 3px;
  width: 16px; height: 16px; background: #fff; border-radius: 50%;
  transition: transform 0.2s;
}
.toggle-input:checked + .toggle-slider { background: #2563eb; }
.toggle-input:checked + .toggle-slider::after { transform: translateX(18px); }
.hint { margin: 6px 0 0; font-size: 0.78rem; color: #94a3b8; }

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
