# 🗺️ Mock Server для відстеження об'єктів

WebSocket сервер для симуляції відстеження 150 рухомих об'єктів на карті.

## 🚀 Запуск

```bash
npm install
cp .env.example .env
npm run dev
```

Сервер буде доступний на `http://localhost:3001`

## ⚙️ Конфігурація

Створіть файл `.env` (або скопіюйте `.env.example`):

```env
PORT=3001
UPDATE_INTERVAL=2000
OBJECTS_COUNT=150
VALID_API_KEYS=test-api-key-123,demo-key-456,admin-key-789
```

**Параметри:**
- `PORT` - порт сервера (default: 3001)
- `UPDATE_INTERVAL` - інтервал оновлень в ms (default: 2000)
- `OBJECTS_COUNT` - кількість об'єктів (default: 150, max: 200)
- `VALID_API_KEYS` - список ключів

## 📡 WebSocket Protocol

### 1. Підключення
```javascript
const ws = new WebSocket('ws://localhost:3001');
```

### 2. Авторизація
```json
{
  "type": "auth",
  "apiKey": "test-api-key-123"
}
```

**Валідні API ключі:**
- `test-api-key-123`
- `demo-key-456`
- `admin-key-789`

### 3. Відповіді сервера

**Успішна авторизація:**
```json
{
  "type": "auth_success",
  "message": "Authentication successful"
}
```

**Помилка авторизації:**
```json
{
  "type": "auth_error",
  "message": "Invalid API key"
}
```

**Оновлення об'єктів (кожні 2 секунди):**
```json
{
  "type": "objects_update",
  "objects": [
    {
      "id": "OBJ-0001",
      "latitude": 50.4501,
      "longitude": 30.5234,
      "direction": 45,
      "speed": 25.5,
      "status": "active",
      "lastUpdate": "2025-11-03T12:00:00.000Z"
    }
  ],
  "timestamp": 1699012800000
}
```

## 🌐 REST API

### GET /
Інформація про сервер
```bash
curl http://localhost:3001/
```

### GET /status
Статус сервера
```bash
curl http://localhost:3001/status
```

Відповідь:
```json
{
  "status": "running",
  "totalObjects": 150,
  "activeObjects": 145,
  "lostObjects": 5,
  "connectedClients": 2,
  "updateInterval": 2000
}
```

### GET /objects
Всі об'єкти (REST endpoint)
```bash
curl http://localhost:3001/objects
```

