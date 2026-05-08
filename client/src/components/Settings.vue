<script setup lang="ts">
import { ref, watch } from 'vue';
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

function saveSettings() {
  const settings: AppSettings = {
    displayName: displayName.value,
    theme: theme.value,
    language: language.value,
    notificationsEnabled: notificationsEnabled.value,
    timezone: timezone.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  applyTheme(theme.value);
}

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

// displayName は入力頻度が高いため debounce で保存
let saveTimer: ReturnType<typeof setTimeout> | null = null;
watch(displayName, () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveSettings, 500);
});

// その他の設定は即時保存
watch([theme, language, notificationsEnabled, timezone], saveSettings);
</script>

<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">⚙️ 設定</h1>
    </div>

    <div class="settings-body">
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
        <h3 class="section-title">言語 <span class="coming-soon">準備中</span></h3>
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
        <h3 class="section-title">通知設定 <span class="coming-soon">準備中</span></h3>
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
        <h3 class="section-title">タイムゾーン <span class="coming-soon">準備中</span></h3>
        <div class="field">
          <label for="timezone">タイムゾーン</label>
          <select id="timezone" v-model="timezone">
            <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
          </select>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-page { max-width: 560px; }
.page-header { margin-bottom: 24px; }
.page-title { margin: 0; font-size: 1.3rem; font-weight: 700; color: var(--text-primary); }

.settings-body {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
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
  max-width: 280px;
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
.coming-soon {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
  vertical-align: middle;
  margin-left: 6px;
}
</style>
