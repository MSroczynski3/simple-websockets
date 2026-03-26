import { type Page, expect } from '@playwright/test';

/**
 * Navigate to the app, enter a nickname to join, and wait for WebSocket connection.
 */
export async function connectAndWaitForStatus(page: Page, nickname: string): Promise<void> {
  await page.goto('/');
  await page.getByTestId('nickname-input').fill(nickname);
  await page.getByTestId('nickname-input').press('Enter');
  await expect(page.getByTestId('connection-status')).toContainText('connected');
}

/**
 * Send a chat message (assumes the user has already joined the chat room).
 */
export async function sendMessage(page: Page, message: string): Promise<void> {
  await page.getByTestId('message-input').fill(message);
  await page.getByTestId('send-button').click();
}
