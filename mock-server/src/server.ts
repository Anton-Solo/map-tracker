import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  generateInitialObjects,
  updateObjectPosition,
  shouldLoseObject,
  shouldRecoverObject,
} from './objectGenerator.js';
import { WebSocketMessage, AuthenticatedClient } from './types.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL || '2000', 10);
const OBJECTS_COUNT = parseInt(process.env.OBJECTS_COUNT || '150', 10);
const VALID_API_KEYS = process.env.VALID_API_KEYS?.split(',') || ['test-api-key-123', 'demo-key-456', 'admin-key-789'];

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const objects = generateInitialObjects(OBJECTS_COUNT);
const lostObjects = new Set<string>();
const authenticatedClients = new Map<WebSocket, AuthenticatedClient>();

console.log(`\n Mock Server Starting...\n`);
console.log(` Генерація ${OBJECTS_COUNT} тестових об'єктів...`);
console.log(` Об'єкти згенеровані!\n`);

app.get('/', (req, res) => {
  res.json({
    message: 'Object Tracking Mock Server',
    version: '1.0.0',
    endpoints: {
      websocket: `ws://localhost:${PORT}`,
      status: '/status',
      objects: '/objects',
    },
    documentation: {
      auth: 'Send {"type": "auth", "apiKey": "test-api-key-123"} via WebSocket',
      validKeys: VALID_API_KEYS,
    },
  });
});

app.get('/status', (req: Request, res: Response) => {
  const activeObjects = Array.from(objects.values()).filter(
    (obj) => obj.status === 'active' && !lostObjects.has(obj.id)
  );
  const lostObjectsCount = lostObjects.size;

  res.json({
    status: 'running',
    totalObjects: objects.size,
    activeObjects: activeObjects.length,
    lostObjects: lostObjectsCount,
    connectedClients: authenticatedClients.size,
    updateInterval: UPDATE_INTERVAL,
  });
});

app.get('/objects', (req: Request, res: Response) => {
  const objectsArray = Array.from(objects.values()).map((obj) => ({
    ...obj,
    status: lostObjects.has(obj.id) ? 'lost' : 'active',
  }));

  res.json({
    objects: objectsArray,
    count: objectsArray.length,
  });
});

wss.on('connection', (ws: WebSocket) => {
  console.log(' Нове WebSocket підключення');

  let clientId = `client-${Date.now()}`;

  const welcomeMessage: WebSocketMessage = {
    type: 'auth_error',
    message: 'Please authenticate with API key. Send: {"type": "auth", "apiKey": "your-key"}',
  };
  ws.send(JSON.stringify(welcomeMessage));

  ws.on('message', (data: any) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      if (message.type === 'auth') {
        const { apiKey } = message;

        if (!apiKey) {
          const errorMsg: WebSocketMessage = {
            type: 'auth_error',
            message: 'API key is required',
          };
          ws.send(JSON.stringify(errorMsg));
          return;
        }

        if (VALID_API_KEYS.includes(apiKey)) {
          authenticatedClients.set(ws, {
            ws,
            apiKey,
            id: clientId,
          });

          const successMsg: WebSocketMessage = {
            type: 'auth_success',
            message: 'Authentication successful.',
          };
          ws.send(JSON.stringify(successMsg));

          console.log(` Клієнт ${clientId} авторизований з ключем: ${apiKey}`);

          sendObjectsUpdate(ws);
        } else {
          const errorMsg: WebSocketMessage = {
            type: 'auth_error',
            message: 'Invalid API key',
          };
          ws.send(JSON.stringify(errorMsg));
          console.log(`Невдала спроба авторизації: ${apiKey}`);
        }
      }

      if (message.type === 'ping') {
        const pongMsg: WebSocketMessage = {
          type: 'pong',
          timestamp: Date.now(),
        };
        ws.send(JSON.stringify(pongMsg));
      }
    } catch (error) {
      console.error('Помилка обробки повідомлення:', error);
    }
  });

  ws.on('close', () => {
    if (authenticatedClients.has(ws)) {
      const client = authenticatedClients.get(ws);
      console.log(`👋 Клієнт ${client?.id} від'єднався`);
      authenticatedClients.delete(ws);
    } else {
      console.log('👋 Неавторизований клієнт від\'єднався');
    }
  });

  ws.on('error', (error: Error) => {
    console.error('❌ WebSocket помилка:', error);
  });
});

function sendObjectsUpdate(ws: WebSocket) {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }

  const objectsArray = Array.from(objects.values())
    .filter((obj) => !lostObjects.has(obj.id))
    .map((obj) => ({
      ...obj,
      lastUpdate: obj.lastUpdate.toISOString(),
    }));

  const message: WebSocketMessage = {
    type: 'objects_update',
    objects: objectsArray,
    timestamp: Date.now(),
  };

  try {
    ws.send(JSON.stringify(message));
  } catch (error) {
    console.error('Помилка надсилання даних:', error);
  }
}

function broadcastObjectsUpdate() {
  authenticatedClients.forEach((client) => {
    sendObjectsUpdate(client.ws);
  });
}

function updateAllObjects() {
  const deltaTime = UPDATE_INTERVAL / 1000;

  objects.forEach((obj, id) => {
    if (lostObjects.has(id)) {  
      if (shouldRecoverObject()) {
        lostObjects.delete(id);
        console.log(`🔄 Об'єкт ${id} повернувся`);
      }
      return;
    }

    if (shouldLoseObject()) {
      lostObjects.add(id);
      console.log(`📡 Об'єкт ${id} втрачено (симуляція)`);
      return;
    }

    const updatedObj = updateObjectPosition(obj, deltaTime);
    objects.set(id, updatedObj);
  });
}

function startUpdateLoop() {
  setInterval(() => {
    updateAllObjects();

    if (authenticatedClients.size > 0) {
      broadcastObjectsUpdate();
    }
  }, UPDATE_INTERVAL);

  console.log(`🔄 Цикл оновлення запущено (кожні ${UPDATE_INTERVAL}ms)\n`);
}

server.listen(PORT, () => {
  console.log(`╔════════════════════════════════════════════╗`);
  console.log(`║  🗺️  Object Tracking Mock Server         ║`);
  console.log(`╠════════════════════════════════════════════╣`);
  console.log(`║                                            ║`);
  console.log(`║  HTTP:       http://localhost:${PORT}       ║`);
  console.log(`║  WebSocket:  ws://localhost:${PORT}         ║`);
  console.log(`║                                            ║`);
  console.log(`║  📊 Об'єкти: ${OBJECTS_COUNT} (симуляція)            ║`);
  console.log(`║  🔄 Оновлення: кожні ${UPDATE_INTERVAL / 1000}s              ║`);
  console.log(`║  🔑 API Keys: ${VALID_API_KEYS.length} валідних               ║`);
  console.log(`║                                            ║`);
  console.log(`╠════════════════════════════════════════════╣`);
  console.log(`║  Тестовий ключ: test-api-key-123          ║`);
  console.log(`╚════════════════════════════════════════════╝`);
  console.log();
  console.log(`📝 Endpoints:`);
  console.log(`   GET  /         - Server info`);
  console.log(`   GET  /status   - Server status`);
  console.log(`   GET  /objects  - All objects (REST)`);
  console.log();
  console.log(`💡 Для підключення через WebSocket:`);
  console.log(`   1. Підключитись до ws://localhost:${PORT}`);
  console.log(`   2. Надіслати: {"type":"auth","apiKey":"test-api-key-123"}`);
  console.log(`   3. Отримувати оновлення кожні ${UPDATE_INTERVAL / 1000} секунди`);
  console.log();

  startUpdateLoop();
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Зупинка сервера...');

  authenticatedClients.forEach((client) => {
    client.ws.close();
  });

  server.close(() => {
    console.log('✅ Сервер зупинено');
    process.exit(0);
  });
});

