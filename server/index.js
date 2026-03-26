import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

const clients = new Map();
let messageIdCounter = 0;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(2, 15);
  let nickname = 'Anonymous';

  clients.set(clientId, { ws, nickname });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'join') {
        nickname = message.nickname || 'Anonymous';
        clients.set(clientId, { ws, nickname });

        const joinMessage = {
          type: 'user_joined',
          id: `${messageIdCounter++}`,
          nickname,
          text: `${nickname} joined the chat`,
          timestamp: new Date().toISOString()
        };

        broadcast(joinMessage);
      } else if (message.type === 'chat_message') {
        const chatMessage = {
          type: 'chat_message',
          id: `${messageIdCounter++}`,
          nickname: message.nickname || nickname,
          text: message.text,
          timestamp: new Date().toISOString()
        };

        broadcast(chatMessage);
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);

    const leaveMessage = {
      type: 'user_left',
      id: `${messageIdCounter++}`,
      nickname,
      text: `${nickname} left the chat`,
      timestamp: new Date().toISOString()
    };

    broadcast(leaveMessage);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

function broadcast(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach(({ ws }) => {
    if (ws.readyState === 1) {
      ws.send(messageStr);
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
