# Copilot Instructions

チームメンバーが課題をスムーズに管理できる Jira 風の課題管理ツールを、Vue 3 + Express + SQLite で提供する。

## 最重要原則

- 回答・コメント・UI テキストはすべて **日本語** で書く
- 機能開発は `develop` を最新化してから新ブランチを切る。PR は `develop` へ出す
- コードレビューは PR に対して行う

## コーディング規約

### 共通

- TypeScript の `strict: true` を維持する。`any` は使わない
- クライアントとサーバーで型定義は共有しない（それぞれ独立して定義する）

### Vue（`client/`）

- `<script setup lang="ts">` を使う（Options API 禁止）
- Props は `defineProps<{ ... }>()` のジェネリクス形式で型付けする
- Emits は `defineEmits<{ (e: 'event', ...): void }>()` で型付けする
- スタイルは `<style scoped>` に書く。CSS フレームワークは使わず手書き CSS のみ
- カラーパレット: プライマリ `#2563eb`、ヘッダー背景 `#1e3a5f`
- バッジは `border-radius: 100px` の pill 形式を使う

### Express（`server/`）

- DB は Node.js built-in の `node:sqlite`（`DatabaseSync`）を使う。`better-sqlite3` は使わない
- SQL は prepared statements（`.prepare(...).get/all/run`）で書く
- PUT エンドポイントはパーシャル更新パターン：リクエストにないフィールドは既存値を維持する
- バリデーションエラーは `400`、Not Found は `404` を返す

### ディレクトリ

- 新しい API エンドポイント → `server/src/routes/` にファイル追加 → `index.ts` でマウント
- 新しい Vue コンポーネント → `client/src/components/`
- 新しい型 → 既存の型ファイル（`client/src/types/task.ts` / `server/src/entity/Task.ts`）に追加、または機能ごとに新ファイルを作る

## レビュー観点

- `strict: true` に違反する型が混入していないか（特に `any`）
- Vue コンポーネントが `<script setup lang="ts">` を使っているか
- DB 操作が prepared statements を使っているか
- PUT が既存値を上書きせず partial update になっているか
- エラーレスポンスのステータスコードが適切か（400 / 404）
- UI テキストが日本語になっているか

## 禁止事項

- `any` の使用
- Options API（`export default { ... }`）の使用
- `better-sqlite3` や生の SQL 文字列結合（SQL インジェクション対策）
- CSS フレームワーク（Tailwind、Bootstrap など）の導入
- クライアント・サーバー間での型定義の直接共有
- `develop` や `main` への直接コミット（必ずブランチ経由）
