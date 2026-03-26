import { test, expect } from '@playwright/test';
import { connectAndWaitForStatus, sendMessage } from './helpers/chat';

test.describe('WebSocket Chat', () => {
  test('connects to WebSocket on page load', async ({ page }) => {
    let wsConnected = false;

    page.on('websocket', (ws) => {
      wsConnected = true;
    });

    await connectAndWaitForStatus(page, 'TestUser');

    expect(wsConnected).toBe(true);
    await expect(page.getByTestId('connection-status')).toContainText('connected');
  });

  test('sends and displays a chat message', async ({ page }) => {
    const sentPayloads: string[] = [];

    page.on('websocket', (ws) => {
      ws.on('framesent', (event) => {
        sentPayloads.push(event.payload as string);
      });
    });

    await connectAndWaitForStatus(page, 'Alice');
    await sendMessage(page, 'Hello, world!');

    await expect(page.getByTestId('messages-list')).toContainText('Hello, world!');

    const hasChatMessage = sentPayloads.some((payload) => {
      try {
        const parsed = JSON.parse(payload);
        return parsed.type === 'chat_message' && parsed.text === 'Hello, world!';
      } catch {
        return false;
      }
    });
    expect(hasChatMessage).toBe(true);
  });

  test('broadcasts message to another client', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await connectAndWaitForStatus(pageA, 'ClientA');
    await connectAndWaitForStatus(pageB, 'ClientB');

    await sendMessage(pageA, 'Broadcast test!');

    await expect(pageA.getByTestId('messages-list')).toContainText('Broadcast test!');
    await expect(pageB.getByTestId('messages-list')).toContainText('Broadcast test!');

    await contextA.close();
    await contextB.close();
  });
});
