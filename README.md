# WebSocket Chat Demo

A minimal full-stack WebSocket application for learning Playwright E2E testing.

## Overview

This is a simple realtime chat room where multiple users can send and receive messages instantly via WebSocket. The application is designed to be clear, stable, and easy to test with Playwright.

## Features

- Realtime bidirectional communication using WebSockets
- Simple nickname-based chat (no authentication)
- Connection status indicator
- Automatic reconnection on disconnect
- System messages for user join/leave events
- All data stored in-memory (no database)

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- Node.js
- Express
- ws (WebSocket library)

## Project Structure

```
.
├── server/
│   └── index.js          # Backend server with WebSocket handling
├── src/
│   ├── components/
│   │   └── ChatRoom.tsx  # Main chat UI component
│   ├── hooks/
│   │   └── useWebSocket.ts  # WebSocket connection logic
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone git@github.com:MSroczynski3/simple-websockets.git
cd simple-websockets
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

No configuration is required - the app works with default settings.

## Running the Application

### Development Mode

Start both frontend and backend in development mode:

```bash
npm run dev
```

This will start:
- Frontend dev server on http://localhost:5173
- Backend WebSocket server on http://localhost:3001

The frontend will automatically proxy to the backend.

### Production Mode

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The backend will serve the built frontend and handle WebSocket connections on http://localhost:3001.

### Individual Services

Run frontend only:
```bash
npm run dev:frontend
```

Run backend only:
```bash
npm run dev:backend
```

## Testing with Playwright

### Test Identifiers

The following `data-testid` attributes are available for E2E testing:

**Nickname Screen:**
- `nickname-input` - Input field for entering nickname

**Chat Room:**
- `message-input` - Input field for typing messages
- `send-button` - Button to send messages
- `messages-list` - Container holding all chat messages
- `connection-status` - WebSocket connection status indicator

### Connection States

The `connection-status` element displays one of:
- `connecting` - Attempting to establish connection
- `connected` - Successfully connected to server
- `disconnected` - Connection lost (will auto-reconnect)

### WebSocket Events

The application handles three message types:

1. **user_joined**
   ```json
   {
     "type": "user_joined",
     "id": "1",
     "nickname": "Alice",
     "text": "Alice joined the chat",
     "timestamp": "2024-01-01T12:00:00.000Z"
   }
   ```

2. **chat_message**
   ```json
   {
     "type": "chat_message",
     "id": "2",
     "nickname": "Alice",
     "text": "Hello everyone!",
     "timestamp": "2024-01-01T12:00:01.000Z"
   }
   ```

3. **user_left**
   ```json
   {
     "type": "user_left",
     "id": "3",
     "nickname": "Alice",
     "text": "Alice left the chat",
     "timestamp": "2024-01-01T12:01:00.000Z"
   }
   ```

### Example Playwright Test Scenarios

Here are some test scenarios you can implement:

1. **User can join chat with nickname**
   - Enter nickname
   - Verify user enters chat room
   - Verify connection status shows "connected"

2. **User can send and receive messages**
   - Open two browser contexts (two users)
   - Send message from user 1
   - Verify message appears for user 2

3. **Connection status updates correctly**
   - Start server
   - Verify status shows "connected"
   - Stop server
   - Verify status shows "disconnected"
   - Restart server
   - Verify status returns to "connected"

4. **Messages appear in correct order**
   - Send multiple messages
   - Verify messages display in chronological order

5. **System messages appear for join/leave**
   - User joins chat
   - Verify "joined" message appears
   - Close browser
   - Verify "left" message appears in other sessions

## API Endpoints

### HTTP

- `GET /health` - Health check endpoint (returns `{"status": "ok"}`)

### WebSocket

Connect to `ws://localhost:3001`

**Client to Server:**
```json
{
  "type": "join",
  "nickname": "Alice"
}
```

```json
{
  "type": "chat_message",
  "nickname": "Alice",
  "text": "Hello!"
}
```

**Server to Client:**
- Broadcasts all messages to all connected clients
- Message format includes: `type`, `id`, `nickname`, `text`, `timestamp`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `VITE_WS_URL` | `ws://localhost:3001` | WebSocket URL for frontend |

## Troubleshooting

**Frontend can't connect to backend:**
- Ensure backend is running on port 3001
- Check that no firewall is blocking the connection
- Verify WebSocket URL in browser console

**Port already in use:**
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

**Dependencies not installing:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Development Notes

- No database required - all data is stored in memory
- No authentication - users identified by nickname only
- Messages are lost on server restart (expected behavior)
- Auto-reconnect attempts every 3 seconds on disconnect
- Message IDs are simple incrementing numbers (reset on restart)

## License

MIT
