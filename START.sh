# ./START.sh

echo "╔════════════════════════════════════════════╗"
echo "║       🗺️  Map Tracker - Запуск           ║"
echo "╚════════════════════════════════════════════╝"
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js не встановлено!"
    echo "   Встановіть Node.js >= 22.x з https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo "✅ npm $(npm -v)"
echo ""

echo "📦 Перевірка залежностей..."

if [ ! -d "mock-server/node_modules" ]; then
    echo "   Встановлення залежностей mock-server..."
    cd mock-server && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "   Встановлення залежностей frontend..."
    cd frontend && npm install && cd ..
fi

echo "✅ Залежності готові"
echo ""

echo "⚙️  Перевірка конфігурації (.env файлів)..."

if [ ! -f "mock-server/.env" ]; then
    echo "   Створення mock-server/.env з .env.example..."
    if [ -f "mock-server/.env.example" ]; then
        cp mock-server/.env.example mock-server/.env
        echo "   ✅ mock-server/.env створено"
    else
        echo "   ⚠️  .env.example не знайдено, створюю з defaults..."
        cat > mock-server/.env << 'ENVEOF'
PORT=3001
UPDATE_INTERVAL=2000
OBJECTS_COUNT=150
VALID_API_KEYS=test-api-key-123,demo-key-456,admin-key-789
ENVEOF
        echo "   ✅ mock-server/.env створено з defaults"
    fi
else
    echo "   ✅ mock-server/.env вже існує"
fi

if [ ! -f "frontend/.env" ]; then
    echo "   Створення frontend/.env з .env.example..."
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env
        echo "   ✅ frontend/.env створено"
    else
        echo "   ⚠️  .env.example не знайдено, створюю з defaults..."
        cat > frontend/.env << 'ENVEOF'
VITE_WS_URL=ws://localhost:3001
VITE_LOST_OBJECT_TIMEOUT=30000
VITE_REMOVE_OBJECT_TIMEOUT=300000
VITE_RECONNECT_INTERVAL=3000
ENVEOF
        echo "   ✅ frontend/.env створено з defaults"
    fi
else
    echo "   ✅ frontend/.env вже існує"
fi

echo ""

echo "🧹 Очищення портів..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
echo "✅ Порти вільні"
echo ""

echo "🚀 Запуск Mock сервера..."
cd mock-server
npm run dev > ../server.log 2>&1 &
SERVER_PID=$!
cd ..

sleep 3

if curl -s http://localhost:3001/status > /dev/null 2>&1; then
    echo "✅ Mock сервер запущено (PID: $SERVER_PID)"
    echo "   URL: http://localhost:3001"
else
    echo "❌ Помилка запуску mock сервера"
    echo "   Перевірте: cat server.log"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""

echo "🚀 Запуск Frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

sleep 5

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║            ✅ ВСЕ ЗАПУЩЕНО!              ║"
echo "╠════════════════════════════════════════════╣"
echo "║                                            ║"
echo "║  Frontend:  http://localhost:5173         ║"
echo "║  Mock API:  http://localhost:3001         ║"
echo "║                                            ║"
echo "║  API Key:   test-api-key-123              ║"
echo "║                                            ║"
echo "╠════════════════════════════════════════════╣"
echo "║  PIDs: Server=$SERVER_PID Frontend=$FRONTEND_PID      ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "💡 Відкрийте http://localhost:5173 в браузері"
echo "🔑 Введіть API ключ: test-api-key-123"
echo ""
echo "🛑 Для зупинки натисніть Ctrl+C або виконайте:"
echo "   kill $SERVER_PID $FRONTEND_PID"
echo ""
echo "📝 Логи:"
echo "   Server:   cat server.log"
echo "   Frontend: cat frontend.log"
echo ""

echo "$SERVER_PID $FRONTEND_PID" > .pids

trap "echo ''; echo '🛑 Зупинка...'; kill $SERVER_PID $FRONTEND_PID 2>/dev/null; rm -f .pids server.log frontend.log; echo '✅ Зупинено'; exit 0" INT

echo "⏳ Сервери працюють... (Ctrl+C для зупинки)"
wait

