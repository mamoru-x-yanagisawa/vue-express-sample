# Copilot Instructions

## 前提

- 日本語で回答すること
- 機能開発を行うときはdevelopブランチを最新にし、そこから新しい開発用ブランチを切ること
- PRは開発用ブランチからdevelopブランチに対して行うこと
- コードレビューはPRに対して行うこと

## プロジェクト概要

課題管理ツール（Jira 風）。Vue 3 + Express + SQLite のモノレポ構成。

- `client/` — Vue 3 + Vite + TypeScript（フロントエンド）
- `server/` — Express + TypeScript + Node.js built-in SQLite（バックエンド）

## 開発コマンド

```bash
# 依存インストール
npm run install:all

# サーバー起動（ポート 3000）
npm run server

# クライアント起動（ポート 5173）
npm run client
```

Vite の dev サーバーは `/api` を `http://localhost:3000` にプロキシする。

## アーキテクチャ

## コーディング規約

### Vue コンポーネント

- **必ず** `<script setup lang="ts">` を使う（Options API は使わない）
- Props は `defineProps<{ ... }>()` でジェネリクス型を使う
- Emits は `defineEmits<{ (e: 'event', ...): void }>()` で型付けする
- スタイルは `<style scoped>` で書く
- CSS フレームワークは使わず、手書き CSS のみ

### TypeScript

- `strict: true` を維持する
- `any` は使わない。型不明の箇所は適切な型またはジェネリクスで対応する
- クライアント・サーバーで型定義は共有しない（それぞれ独立して定義する）

### API / サーバー

- DB 操作は `better-sqlite3` ではなく Node.js built-in の `node:sqlite`（`DatabaseSync`）を使う
- SQL は prepared statements（`db.prepare(...).get/all/run`）で書く
- PUT エンドポイントはパーシャル更新パターンを使う（リクエストにないフィールドは既存値を維持）
- バリデーションエラーは `400`、Not Found は `404` を返す

## UI・UX

- **UI テキストはすべて日本語**で記述する
- カラーパレットは既存のデザインに合わせる（プライマリ: `#2563eb`、ヘッダー背景: `#1e3a5f`）
- バッジスタイルは `border-radius: 100px` の pill 形式を使う

## ディレクトリ追加時のガイドライン

- 新しい API エンドポイントは `server/src/routes/` にファイルを追加し、`index.ts` でマウントする
- 新しい Vue コンポーネントは `client/src/components/` に追加する
- 新しい型は既存の型ファイル（`types/task.ts` / `entity/Task.ts`）に追加するか、機能ごとに新ファイルを作る
