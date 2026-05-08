import { test, expect } from '@playwright/test';

/** テストごとに一意なタイトルを生成する */
const makeTitle = (suffix = '') => {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return suffix ? `DBテスト_${id}_${suffix}` : `DBテスト_${id}`;
};

/** 今日から n 日後の日付をローカルタイムで YYYY-MM-DD 形式で返す */
function daysFromToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 課題一覧ビューに切り替えて課題を作成し、ダッシュボードに戻るヘルパー */
async function createTaskAndGoToDashboard(
  page: import('@playwright/test').Page,
  title: string,
  options: { type?: string; priority?: string; dueDate?: string } = {},
) {
  // page.goto でアプリを確実にリセットしてから課題一覧へ
  await page.goto('/');
  await page.locator('.nav-item', { hasText: '課題一覧' }).click();
  await expect(page.locator('.page-title')).toHaveText('課題一覧');
  await page.locator('.btn-new').click();
  await page.locator('input[placeholder="課題の件名を入力"]').fill(title);
  if (options.type) await page.locator('select').nth(0).selectOption(options.type);
  if (options.priority) await page.locator('select').nth(1).selectOption(options.priority);
  if (options.dueDate) {
    await page.locator('input[type="date"]').fill(options.dueDate);
  }
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();
  await page.locator('.nav-item', { hasText: 'ダッシュボード' }).click();
  await expect(page.locator('.page-title')).toHaveText('ダッシュボード');
}

test.describe('ダッシュボード', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('デフォルト表示がダッシュボードであること', async ({ page }) => {
    // Assert
    await expect(page.locator('.nav-item', { hasText: 'ダッシュボード' })).toHaveClass(/active/);
    await expect(page.locator('.page-title')).toHaveText('ダッシュボード');
  });

  test('ナビゲーション順序が「ダッシュボード → 課題一覧 → 設定」であること', async ({ page }) => {
    // Assert
    const items = page.locator('.nav-item');
    await expect(items.nth(0)).toContainText('ダッシュボード');
    await expect(items.nth(1)).toContainText('課題一覧');
    await expect(items.nth(2)).toContainText('設定');
  });

  test('「課題一覧」をクリックすると課題一覧に切り替わること', async ({ page }) => {
    // Act
    await page.locator('.nav-item', { hasText: '課題一覧' }).click();

    // Assert
    await expect(page.locator('.page-title')).toHaveText('課題一覧');
    await expect(page.locator('.nav-item', { hasText: '課題一覧' })).toHaveClass(/active/);
    await expect(page.locator('.nav-item', { hasText: 'ダッシュボード' })).not.toHaveClass(/active/);
  });

  test('「ダッシュボード」をクリックするとダッシュボードに戻ること', async ({ page }) => {
    // Arrange: 課題一覧に移動
    await page.locator('.nav-item', { hasText: '課題一覧' }).click();
    await expect(page.locator('.page-title')).toHaveText('課題一覧');

    // Act
    await page.locator('.nav-item', { hasText: 'ダッシュボード' }).click();

    // Assert
    await expect(page.locator('.page-title')).toHaveText('ダッシュボード');
    await expect(page.locator('.nav-item', { hasText: 'ダッシュボード' })).toHaveClass(/active/);
  });

  test('ステータスサマリーが4種類表示されること', async ({ page }) => {
    // Assert
    const cards = page.locator('.summary-card');
    await expect(cards).toHaveCount(4);
    await expect(cards.nth(0)).toContainText('未対応');
    await expect(cards.nth(1)).toContainText('処理中');
    await expect(cards.nth(2)).toContainText('処理済み');
    await expect(cards.nth(3)).toContainText('完了');
  });
});

test.describe('ダッシュボード：期日が迫っている課題', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('7日以内の課題がウィジェットに表示されること', async ({ page }) => {
    // Arrange
    const title = makeTitle('期日7日');
    await createTaskAndGoToDashboard(page, title, { dueDate: daysFromToday(5) });

    // Assert
    const widget = page.locator('.section', { hasText: '期日が迫っている課題' });
    await expect(widget.locator('.widget-row', { hasText: title })).toBeVisible();
  });

  test('今日が期日の課題がウィジェットに表示されること', async ({ page }) => {
    // Arrange
    const title = makeTitle('期日今日');
    await createTaskAndGoToDashboard(page, title, { dueDate: daysFromToday(0) });

    // Assert
    const widget = page.locator('.section', { hasText: '期日が迫っている課題' });
    await expect(widget.locator('.widget-row', { hasText: title })).toBeVisible();
  });

  test('8日後が期日の課題はウィジェットに表示されないこと', async ({ page }) => {
    // Arrange
    const title = makeTitle('期日8日後');
    await createTaskAndGoToDashboard(page, title, { dueDate: daysFromToday(8) });

    // Assert
    const widget = page.locator('.section', { hasText: '期日が迫っている課題' });
    await expect(widget.locator('.widget-row', { hasText: title })).not.toBeVisible();
  });

  test('期日が設定されていない課題はウィジェットに表示されないこと', async ({ page }) => {
    // Arrange
    const title = makeTitle('期日なし');
    await createTaskAndGoToDashboard(page, title);

    // Assert
    const widget = page.locator('.section', { hasText: '期日が迫っている課題' });
    await expect(widget.locator('.widget-row', { hasText: title })).not.toBeVisible();
  });
});

test.describe('ダッシュボード：優先度が高い未完了課題', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('優先度「緊急」の課題がウィジェットに表示されること', async ({ page }) => {
    // Arrange
    const title = makeTitle('緊急');
    await createTaskAndGoToDashboard(page, title, { priority: 'urgent' });

    // Assert
    const widget = page.locator('.section', { hasText: '優先度が高い未完了課題' });
    await expect(widget.locator('.widget-row', { hasText: title })).toBeVisible();
  });

  test('優先度「高」の課題がウィジェットに表示されること', async ({ page }) => {
    // Arrange
    const title = makeTitle('高優先度');
    await createTaskAndGoToDashboard(page, title, { priority: 'high' });

    // Assert
    const widget = page.locator('.section', { hasText: '優先度が高い未完了課題' });
    await expect(widget.locator('.widget-row', { hasText: title })).toBeVisible();
  });

  test('優先度「中」の課題はウィジェットに表示されないこと', async ({ page }) => {
    // Arrange
    const title = makeTitle('中優先度');
    await createTaskAndGoToDashboard(page, title, { priority: 'normal' });

    // Assert
    const widget = page.locator('.section', { hasText: '優先度が高い未完了課題' });
    await expect(widget.locator('.widget-row', { hasText: title })).not.toBeVisible();
  });
});

test.describe('ダッシュボード：未解決バグ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('種別「バグ」の課題が未解決バグウィジェットに表示されること', async ({ page }) => {
    // Arrange
    const title = makeTitle('バグ');
    await createTaskAndGoToDashboard(page, title, { type: 'bug' });

    // Assert
    const widget = page.locator('.section', { hasText: '未解決バグ' });
    await expect(widget.locator('.widget-row', { hasText: title })).toBeVisible();
  });

  test('種別「タスク」の課題は未解決バグウィジェットに表示されないこと', async ({ page }) => {
    // Arrange
    const title = makeTitle('タスク');
    await createTaskAndGoToDashboard(page, title, { type: 'task' });

    // Assert
    const widget = page.locator('.section', { hasText: '未解決バグ' });
    await expect(widget.locator('.widget-row', { hasText: title })).not.toBeVisible();
  });
});

test.describe('ダッシュボード：空状態', () => {
  test('各ウィジェットセクションは内容か空状態メッセージのいずれかを表示すること', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Assert: 3つのウィジェットセクション（サマリー除く）それぞれに
    // widget-list または .empty のいずれかが存在すること
    const widgetSections = page.locator('.section').filter({
      has: page.locator('.widget-list, .empty'),
    });
    await expect(widgetSections).toHaveCount(3);

    // 空状態が存在する場合は正しいメッセージが表示されていること
    const emptyMsgs = page.locator('.empty');
    const emptyCount = await emptyMsgs.count();
    for (let i = 0; i < emptyCount; i++) {
      await expect(emptyMsgs.nth(i)).toHaveText('該当する課題はありません。');
    }
  });
});

test.describe('ダッシュボード：詳細ドロワー連携', () => {
  test('ダッシュボードの課題行をクリックすると詳細ドロワーが開くこと', async ({ page }) => {
    // Arrange: 高優先度課題を作成してダッシュボードに戻る
    await page.goto('/');
    const title = makeTitle('ドロワー確認');
    await createTaskAndGoToDashboard(page, title, { priority: 'urgent' });

    // Act
    const widget = page.locator('.section', { hasText: '優先度が高い未完了課題' });
    await widget.locator('.widget-row', { hasText: title }).click();

    // Assert
    await expect(page.locator('.drawer')).toBeVisible();
    await expect(page.locator('.issue-title')).toContainText(title);
  });
});
