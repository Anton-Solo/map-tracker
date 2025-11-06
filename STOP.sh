# ./STOP.sh

echo "🛑 Зупинка Map Tracker..."
echo ""

if [ -f .pids ]; then
    read SERVER_PID FRONTEND_PID < .pids
    
    echo "Зупинка процесів:"
    echo "  Server PID: $SERVER_PID"
    echo "  Frontend PID: $FRONTEND_PID"
    
    kill $SERVER_PID $FRONTEND_PID 2>/dev/null
    rm -f .pids
fi

echo "Очищення портів..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

rm -f server.log frontend.log 2>/dev/null

echo ""
echo "✅ Map Tracker зупинено"
echo ""

