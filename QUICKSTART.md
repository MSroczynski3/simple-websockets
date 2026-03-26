# Quick Start Guide

## Get Up and Running in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

This starts both frontend (http://localhost:5173) and backend (ws://localhost:3001).

### 3. Open Your Browser

Visit http://localhost:5173 and start chatting!

---

## Production Build

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

Visit http://localhost:3001

---

## For Playwright Testing

All interactive elements have `data-testid` attributes:

- `nickname-input` - Enter your name
- `message-input` - Type messages
- `send-button` - Send messages
- `messages-list` - All chat messages
- `connection-status` - Connection state (connecting/connected/disconnected)

See README.md for detailed testing scenarios.
