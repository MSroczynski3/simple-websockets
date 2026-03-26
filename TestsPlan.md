# WebSocket E2E Testing Plan (Playwright)

## Goal

Create a minimal but solid set of Playwright E2E tests that verify:

- WebSocket connection is established
- Messages are sent correctly
- Messages are received in realtime
- Multiple clients stay in sync

---

## Scope (MVP)

Focus only on these 3 core scenarios:

1. WebSocket connects on page load
2. A user can send and see a message
3. A second client receives the message in realtime

Everything else is deferred to **Optional Extensions**.

---

## Test Cases

### Test 1: Connects to WebSocket on page load

**Steps:**

1. Open the app at the base URL.
2. Wait for connection status to become `connected`.

**Assertions:**

- Element with `data-testid="connection-status"` contains the text `connected`.
- A `WebSocket` connection event is captured via `page.on('websocket')`.

---

### Test 2: Sends and displays a chat message

**Steps:**

1. Open the app and wait for `connected` status.
2. Fill `data-testid="nickname-input"` with a nickname.
3. Fill `data-testid="message-input"` with a message.
4. Click `data-testid="send-button"`.

**Assertions:**

- The message text appears inside `data-testid="messages-list"`.
- A `framesent` event is captured on the WebSocket with a payload containing the message.
- *(Optional)* A `framereceived` event is captured with the echoed message.

---

### Test 3: Broadcasts message to another client

**Steps:**

1. Create two isolated browser contexts (Client A and Client B).
2. Each context opens the app and waits for `connected` status.
3. Client A sends a message (nickname + text).

**Assertions:**

- Client B's `data-testid="messages-list"` contains the message **without a page refresh**.
- Client A's `data-testid="messages-list"` also contains the message.

---

## Technical Strategy

### Selectors

All tests use stable `data-testid` attributes:

| Selector                          | Element                |
| --------------------------------- | ---------------------- |
| `data-testid="nickname-input"`    | Nickname text input    |
| `data-testid="message-input"`     | Message text input     |
| `data-testid="send-button"`       | Send button            |
| `data-testid="messages-list"`     | Message list container |
| `data-testid="connection-status"` | Connection status text |

### Assertion Style

Prefer Playwright auto-retrying assertions:

```ts
await expect(locator).toContainText('hello');
```

Avoid hard waits:

```ts
// DO NOT use this
await page.waitForTimeout(1000);
```

### WebSocket Inspection

Attach a listener to capture frames:

```ts
page.on('websocket', ws => {
  ws.on('framesent', event => {
    // store or assert on event.payload
  });

  ws.on('framereceived', event => {
    // store or assert on event.payload
  });
});
```

Use this to:

- Confirm messages are **sent** over the socket.
- Confirm messages are **received** from the server.

---

## Project Structure

```text
tests/
  websocket.spec.ts      # all 3 test cases
  helpers/
    chat.ts              # shared helper functions
```

---

## Helper Functions

Define these in `tests/helpers/chat.ts`:

### `connectAndWaitForStatus(page: Page): Promise<void>`

1. Navigate to the base URL.
2. Wait until `data-testid="connection-status"` contains `connected`.

### `sendMessage(page: Page, nickname: string, message: string): Promise<void>`

1. Fill `data-testid="nickname-input"` with `nickname`.
2. Fill `data-testid="message-input"` with `message`.
3. Click `data-testid="send-button"`.

---

## Execution Plan

### Step 1 — Setup

- Install Playwright (`npm init playwright@latest`).
- Verify the app runs locally (`npm run dev` + `node server/index.js`).
- Set `baseURL` in `playwright.config.ts` to `http://localhost:5173`.

**Done when:** `npx playwright test` executes with zero tests and no errors.

### Step 2 — Connection test

- Create `tests/websocket.spec.ts`.
- Implement **Test 1** (connects to WebSocket on page load).
- Assert both UI status and WebSocket event.

**Done when:** `npx playwright test` passes with 1 green test.

### Step 3 — Message flow test

- Add **Test 2** (sends and displays a chat message) to `websocket.spec.ts`.
- Include `framesent` WebSocket verification.

**Done when:** `npx playwright test` passes with 2 green tests.

### Step 4 — Multi-client broadcast test

- Add **Test 3** (broadcasts message to another client) to `websocket.spec.ts`.
- Use two isolated browser contexts:

```ts
const contextA = await browser.newContext();
const contextB = await browser.newContext();
```

**Done when:** `npx playwright test` passes with 3 green tests.

### Step 5 — Refactor

- Extract `connectAndWaitForStatus` and `sendMessage` into `tests/helpers/chat.ts`.
- Replace duplicated code in all tests with helper calls.
- Remove any remaining duplication.

**Done when:** All 3 tests still pass and no helper logic is duplicated in the spec file.

---

## Known Challenges

| Challenge              | Risk                                          | Mitigation                                                             |
| ---------------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| Timing issues          | WebSocket events are async and may race        | Use `expect(...).toContainText()` (auto-retries) instead of hard waits |
| Dynamic fields         | `id` and `timestamp` change on every run       | Assert on message **text content only**; never assert full payload     |
| Multi-client isolation | Shared state could leak between contexts       | Use `browser.newContext()` for each client; never share cookies/state  |

---

## Optional Extensions (later)

- Test `user_joined` event.
- Test `user_left` event.
- Test reconnect behavior after server restart.
- Validate message schema more strictly.

---

## Definition of Done

- [ ] 3 core tests implemented and passing: connection, send message, broadcast.
- [ ] Tests run reliably with no flakiness.
- [ ] No hardcoded timeouts (`waitForTimeout`).
- [ ] Clear, maintainable structure with helpers extracted.