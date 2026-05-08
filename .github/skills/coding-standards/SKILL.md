---
name: coding-standards
description: コードレビュー・PR 作成・リファクタリング時に、このリポジトリのコーディング規約に沿っているかを体系的に確認したいときに使う。
---

## 概要

Vue 3 + Express + Node.js built-in SQLite で構成されたこのリポジトリの
コーディング規約チェックを、以下の手順で実施する。

---

## チェック手順

### Step 1: 対象ファイルの特定

変更・作成されたファイルを確認し、以下の区分に分類する。

- **Vue コンポーネント** (`client/src/**/*.vue`)
- **クライアント TypeScript** (`client/src/**/*.ts`)
- **サーバー TypeScript** (`server/src/**/*.ts`)

---

### Step 2: 共通チェック（全ファイル対象）

以下を必ず確認する。

1. **`any` の禁止**: `any` が使われていないか。不明な型は適切な型またはジェネリクスで表現されているか
2. **型の独立性**: `client/` と `server/` で型を直接 `import` し合っていないか
3. **TypeScript strict**: `null`/`undefined` チェックが適切に行われているか（`strict: true` 相当）

---

### Step 3: Vue コンポーネントチェック

`.vue` ファイルに対して以下を確認する。

1. **Script setup**: `<script setup lang="ts">` を使っているか（`export default { ... }` は禁止）
2. **Props 型**: `defineProps<{ propName: Type }>()` のジェネリクス形式か
3. **Emits 型**: `defineEmits<{ (e: 'event-name', payload: Type): void }>()` の形式か
4. **Scoped スタイル**: スタイルが `<style scoped>` に書かれているか
5. **CSS フレームワーク**: Tailwind / Bootstrap 等の外部 CSS フレームワークを使っていないか
6. **カラーパレット**: プライマリカラーが `#2563eb`、ヘッダー背景が `#1e3a5f` に準拠しているか
7. **バッジ**: 件数表示等のバッジは `border-radius: 100px` の pill 形式か
8. **UI テキスト**: ラベル・ボタン・エラーメッセージなどが日本語で書かれているか

---

### Step 4: サーバー（Express）チェック

`server/src/**/*.ts` に対して以下を確認する。

1. **SQLite ドライバ**: `node:sqlite` の `DatabaseSync` を使っているか（`better-sqlite3` は禁止）
2. **Prepared statements**: SQL が `.prepare(...).get()` / `.prepare(...).all()` / `.prepare(...).run()` を使っているか。文字列結合で SQL を組み立てていないか
3. **PUT のパーシャル更新**: PUT エンドポイントで、リクエストボディに含まれないフィールドは既存値を維持しているか
4. **エラーステータス**:
   - バリデーションエラー → `400`
   - リソース未存在 → `404`
   - それ以外のサーバーエラー → `500`
5. **ルーティング**: 新しいルートを追加した場合、`server/src/index.ts` でマウントされているか

---

### Step 5: ディレクトリ構成チェック

新規ファイルが追加された場合、配置場所が正しいかを確認する。

| 追加物 | 正しい配置場所 |
|--------|--------------|
| API エンドポイント | `server/src/routes/` |
| Vue コンポーネント | `client/src/components/` |
| クライアント型定義 | `client/src/types/` |
| サーバー型定義 | `server/src/entity/` |

---

### Step 6: チェック結果の報告

以下のフォーマットで結果を出力する。

```
## コーディング規約チェック結果

### ✅ 適合
- ...

### ❌ 違反
- [ファイル名:行番号] 違反内容 → 修正方法

### ⚠️ 要確認
- ...
```

違反がある場合は、修正例も合わせて示す。
