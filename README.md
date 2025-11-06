## ⚡ Швидкий старт за 3 кроки

### 1️⃣ Запустити сервери (автоматично)
```bash
cd /Users/antonsolo/Documents/map-tracker
./START.sh
```

Або вручну (2 термінали):
```bash
# Термінал 1
cd mock-server && npm install
cp .env.example .env
npm run dev

# Термінал 2
cd frontend && npm install
cp .env.example .env
npm run dev
```

### 2️⃣ Відкрити браузер
```
http://localhost:5173
```

### 3️⃣ Ввести API ключ
```
test-api-key-123
```
## 🎯 Основні файли проекту

```
frontend/          → React застосунок
mock-server/       → WebSocket сервер
START.sh           → Автоматичний запуск
STOP.sh            → Зупинка серверів
```

## ⚠️ Якщо щось не працює

### Проблема: Команда не знайдена
```bash
chmod +x START.sh STOP.sh
./START.sh
```

### Проблема: Порт зайнятий
```bash
./STOP.sh
./START.sh
```

### Проблема: Залежності
```bash
cd frontend && npm install && cp .env.example .env
cd mock-server && npm install && cp .env.example .env
```

## ⚙️ Конфігурація (.env файли)

### Frontend (.env):
```env
VITE_WS_URL=ws://localhost:3001
VITE_LOST_OBJECT_TIMEOUT=30000      # 30 сек
VITE_REMOVE_OBJECT_TIMEOUT=300000   # 5 хвилин
VITE_RECONNECT_INTERVAL=3000        # 3 сек
```

### Mock Server (.env):
```env
PORT=3001
UPDATE_INTERVAL=2000                # 2 сек
OBJECTS_COUNT=150
VALID_API_KEYS=test-api-key-123,demo-key-456,admin-key-789
```