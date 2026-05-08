---
applyTo: "**/tests/**/*.test.ts,**/tests/**/*.spec.ts"
---

# テスト規約

## AAA パターン

すべてのテストケースは Arrange / Act / Assert の 3 ブロックに分ける。
ブロック間に空行を入れ、コメントは原則不要（構造が自明な場合）。

```ts
it("タイトルが空のとき 400 を返す", async () => {
  // Arrange
  const payload = { title: "" };

  // Act
  const res = await request(app).post("/api/tasks").send(payload);

  // Assert
  expect(res.status).toBe(400);
});
```

## テスト名の書き方

- `it` / `test` の説明は **日本語** で書く
- 形式: `「〜のとき、〜する/返す」` または `「〜が〜であること」`
- 条件と期待値を 1 文に収める（例: `ステータスが open のとき一覧に含まれること`）
- `describe` でテスト対象（関数名・エンドポイント・コンポーネント名）をグループ化する

## モックの方針

- **外部依存（DB・HTTP）はモックする**。ユニットテストで実 DB に接続しない
- ビジネスロジック（バリデーション・計算）はモックしない
- モックは `beforeEach` でリセットし、テスト間の状態汚染を防ぐ
- Vue コンポーネントのテストでは、API 呼び出し（`api/tasks.ts` の関数）をモックし、DOM の振る舞いを検証する

## その他

- 1 つの `it` ブロックにアサーションを詰め込まない（1 ケース 1 観点を目安にする）
- テストが失敗したとき原因が一目でわかるエラーメッセージを意識する（`expect(...).toBe(...)` より `toEqual` / `toMatchObject` を状況に応じて使い分ける）
