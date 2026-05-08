import { test, expect } from '@playwright/test';

/** テストごとに一意なタイトルを生成する */
const makeTitle = (suffix = '') => {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  return suffix ? `E2Eテスト_${id}_${suffix}` : `E2Eテスト_${id}`;
};

/** 課題一覧ビューに切り替えるヘルパー */
async function goToIssues(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('.nav-item', { hasText: '課題一覧' }).click();
  await expect(page.locator('.page-title')).toHaveText('課題一覧');
}

/** 課題を作成して一覧に現れるまで待つヘルパー */
async function createTask(page: import('@playwright/test').Page, title: string) {
  await page.locator('.btn-new').click();
  await page.locator('input[placeholder="課題の件名を入力"]').fill(title);
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();
}

test.describe('課題の作成', () => {
  test.beforeEach(async ({ page }) => {
    await goToIssues(page);
  });

  test('「課題を追加」ボタンをクリックするとフォームが開くこと', async ({ page }) => {
    // Arrange: トップページ表示済み

    // Act
    await page.locator('.btn-new').click();

    // Assert
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('.modal-header h2')).toHaveText('課題を追加');
  });

  test('バックドロップをクリックするとフォームが閉じること', async ({ page }) => {
    // Arrange
    await page.locator('.btn-new').click();
    await expect(page.locator('.modal')).toBeVisible();

    // Act
    await page.locator('.modal-backdrop').click({ position: { x: 5, y: 5 } });

    // Assert
    await expect(page.locator('.modal')).not.toBeVisible();
  });

  test('必須項目（件名）を入力して課題を作成できること', async ({ page }) => {
    // Arrange
    const title = makeTitle();
    await page.locator('.btn-new').click();

    // Act
    await page.locator('input[placeholder="課題の件名を入力"]').fill(title);
    await page.locator('button[type="submit"]').click();

    // Assert
    await expect(page.locator('.modal')).not.toBeVisible();
    await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();
  });

  test('件名が空のままでは送信できないこと', async ({ page }) => {
    // Arrange
    await page.locator('.btn-new').click();

    // Act: 件名を入力せずに送信
    await page.locator('button[type="submit"]').click();

    // Assert: モーダルが開いたまま
    await expect(page.locator('.modal')).toBeVisible();
  });

  test('種別・優先度を指定して課題を作成できること', async ({ page }) => {
    // Arrange
    const title = makeTitle('バグ');
    await page.locator('.btn-new').click();

    // Act
    await page.locator('input[placeholder="課題の件名を入力"]').fill(title);
    await page.locator('select').nth(0).selectOption('bug');
    await page.locator('select').nth(1).selectOption('high');
    await page.locator('button[type="submit"]').click();

    // Assert
    await expect(page.locator('.modal')).not.toBeVisible();
    const row = page.locator('tr', { hasText: title });
    await expect(row.locator('.type-bug')).toContainText('バグ');
    await expect(row.locator('.prio-high')).toContainText('高');
  });
});

test.describe('課題の詳細表示', () => {
  let title: string;

  test.beforeEach(async ({ page }) => {
    title = makeTitle();
    await goToIssues(page);
    await createTask(page, title);
  });

  test('課題行をクリックすると詳細ドロワーが開くこと', async ({ page }) => {
    // Act
    await page.locator('tr', { hasText: title }).click();

    // Assert
    await expect(page.locator('.drawer')).toBeVisible();
    await expect(page.locator('.issue-title')).toContainText(title);
  });

  test('詳細ドロワーに全ステータスボタンが表示されること', async ({ page }) => {
    // Arrange
    await page.locator('tr', { hasText: title }).click();

    // Assert
    const statusBtns = page.locator('.status-btn');
    await expect(statusBtns).toHaveCount(4);
    await expect(statusBtns.nth(0)).toContainText('未対応');
    await expect(statusBtns.nth(1)).toContainText('処理中');
    await expect(statusBtns.nth(2)).toContainText('処理済み');
    await expect(statusBtns.nth(3)).toContainText('完了');
  });

  test('ドロワーを閉じるボタンで閉じること', async ({ page }) => {
    // Arrange
    await page.locator('tr', { hasText: title }).click();
    await expect(page.locator('.drawer')).toBeVisible();

    // Act
    await page.locator('.drawer .btn-close').click();

    // Assert
    await expect(page.locator('.drawer')).not.toBeVisible();
  });
});

test.describe('課題のステータス変更', () => {
  let title: string;

  test.beforeEach(async ({ page }) => {
    title = makeTitle();
    await goToIssues(page);
    await createTask(page, title);
  });

  test('ステータスを「処理中」に変更できること', async ({ page }) => {
    // Arrange: 詳細ドロワーを開く
    await page.locator('tr', { hasText: title }).click();

    // Act
    await page.locator('.status-btn', { hasText: '処理中' }).click();

    // Assert: 一覧のステータスバッジが変わる
    await page.locator('.drawer .btn-close').click();
    const row = page.locator('tr', { hasText: title });
    await expect(row.locator('.status-in-progress')).toBeVisible();
  });
});

test.describe('課題の編集', () => {
  let title: string;

  test.beforeEach(async ({ page }) => {
    title = makeTitle();
    await goToIssues(page);
    await createTask(page, title);
  });

  test('詳細ドロワーから編集フォームを開けること', async ({ page }) => {
    // Arrange
    await page.locator('tr', { hasText: title }).click();

    // Act
    await page.locator('.btn-edit').click();

    // Assert
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('.modal-header h2')).toHaveText('課題を編集');
    await expect(page.locator('input[placeholder="課題の件名を入力"]')).toHaveValue(title);
  });

  test('件名を変更して更新できること', async ({ page }) => {
    // Arrange
    const updatedTitle = makeTitle('更新済み');
    await page.locator('tr', { hasText: title }).click();
    await page.locator('.btn-edit').click();

    // Act
    await page.locator('input[placeholder="課題の件名を入力"]').fill(updatedTitle);
    await page.locator('button[type="submit"]').click();

    // Assert
    await expect(page.locator('.modal')).not.toBeVisible();
    await expect(page.getByRole('cell', { name: updatedTitle, exact: true })).toBeVisible();
  });
});

test.describe('課題の削除', () => {
  test('削除ボタンをクリックして確認後に課題が消えること', async ({ page }) => {
    // Arrange
    const title = makeTitle();
    await goToIssues(page);
    await createTask(page, title);

    // Act
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('tr', { hasText: title }).locator('.btn-del').click();

    // Assert
    await expect(page.getByRole('cell', { name: title, exact: true })).not.toBeVisible();
  });

  test('削除確認ダイアログでキャンセルすると課題が残ること', async ({ page }) => {
    // Arrange
    const title = makeTitle();
    await goToIssues(page);
    await createTask(page, title);

    // Act
    page.on('dialog', (dialog) => dialog.dismiss());
    await page.locator('tr', { hasText: title }).locator('.btn-del').click();

    // Assert
    await expect(page.getByRole('cell', { name: title, exact: true })).toBeVisible();
  });
});
