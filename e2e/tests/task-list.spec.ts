import { test, expect } from '@playwright/test';

/** 課題一覧ビューに切り替えるヘルパー */
async function goToIssues(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('.nav-item', { hasText: '課題一覧' }).click();
  await expect(page.locator('.page-title')).toHaveText('課題一覧');
}

test.describe('課題一覧', () => {
  test.beforeEach(async ({ page }) => {
    await goToIssues(page);
  });

  test('ページタイトルと基本レイアウトが表示されること', async ({ page }) => {
    // Arrange: 課題一覧ビューを開いた状態

    // Act: ページの各要素を確認

    // Assert
    await expect(page.locator('.logo-text')).toHaveText('MyProject');
    await expect(page.locator('.page-title')).toHaveText('課題一覧');
    await expect(page.locator('.btn-new')).toBeVisible();
  });

  test('ステータスフィルタータブが全種表示されること', async ({ page }) => {
    // Arrange: 課題一覧ビューを開いた状態

    // Act: タブを取得

    // Assert
    const tabs = page.locator('.tab');
    await expect(tabs).toHaveCount(5);
    await expect(tabs.nth(0)).toContainText('すべて');
    await expect(tabs.nth(1)).toContainText('未対応');
    await expect(tabs.nth(2)).toContainText('処理中');
    await expect(tabs.nth(3)).toContainText('処理済み');
    await expect(tabs.nth(4)).toContainText('完了');
  });

  test('ステータスフィルタータブをクリックするとアクティブになること', async ({ page }) => {
    // Arrange: 「未対応」タブ

    // Act
    await page.locator('.tab').nth(1).click();

    // Assert
    await expect(page.locator('.tab').nth(1)).toHaveClass(/active/);
    await expect(page.locator('.tab').nth(0)).not.toHaveClass(/active/);
  });

  test('サイドバーのナビゲーションが表示されること', async ({ page }) => {
    // Arrange: 課題一覧ビューを開いた状態

    // Act: サイドバー要素を取得

    // Assert
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.nav-item').first()).toContainText('ダッシュボード');
  });
});
