#!/bin/bash

# Start all services for the Enterprise Experience Platform

echo "🚀 Starting Enterprise Experience Platform Services..."

# Activate virtual environment
source venv/bin/activate

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama is not running. Please start Ollama first."
    echo "   Run: ollama serve"
    exit 1
fi

# Check if Gemma3 model is available
if ! ollama list | grep -q "gemma3"; then
    echo "⚠️  Gemma3 model not found. Pulling model..."
    ollama pull gemma3
fi

echo "✅ Ollama and Gemma3 are ready"

# Start AI/ML Service
echo "📦 Starting AI/ML Service..."
cd services/4-ai_ml_service
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload > /tmp/ai_ml_service.log 2>&1 &
AI_ML_PID=$!
echo "   AI/ML Service started (PID: $AI_ML_PID) on port 8004"
cd ../..

# Wait for service to be ready
sleep 3

# Test AI service
echo "🧪 Testing AI/ML Service..."
curl -s http://localhost:8004/health && echo "" || echo "   ⚠️  Service not ready yet"

# Start Identity Service
echo "📦 Starting Identity Service..."
cd services/1-identity_service
python manage.py runserver 0.0.0.0:8001 > /tmp/identity_service.log 2>&1 &
IDENTITY_PID=$!
echo "   Identity Service started (PID: $IDENTITY_PID) on port 8001"
cd ../..

# Start Organization Service
echo "📦 Starting Organization Service..."
cd services/2-organization_service
python manage.py runserver 0.0.0.0:8002 > /tmp/organization_service.log 2>&1 &
ORG_PID=$!
echo "   Organization Service started (PID: $ORG_PID) on port 8002"
cd ../..

# Start Survey Engine Service
echo "📦 Starting Survey Engine Service..."
cd services/3-survey_engine_service
python manage.py runserver 0.0.0.0:8003 > /tmp/survey_service.log 2>&1 &
SURVEY_PID=$!
echo "   Survey Engine Service started (PID: $SURVEY_PID) on port 8003"
cd ../..

# Start Blockchain Service
echo "📦 Starting Blockchain Service..."
cd services/12-blockchain_service
uvicorn app.main:app --host 0.0.0.0 --port 8012 --reload > /tmp/blockchain_service.log 2>&1 &
BLOCKCHAIN_PID=$!
echo "   Blockchain Service started (PID: $BLOCKCHAIN_PID) on port 8012"
cd ../..

# Start Notification Service
echo "📦 Starting Notification Service..."
cd services/9-notification_service
uvicorn app.main:app --host 0.0.0.0 --port 8009 --reload > /tmp/notification_service.log 2>&1 &
NOTIFICATION_PID=$!
echo "   Notification Service started (PID: $NOTIFICATION_PID) on port 8009"
cd ../..

echo ""
echo "✅ Services started!"
echo ""
echo "📊 Service Status:"
echo "   - AI/ML Service: http://localhost:8004"
echo "   - Identity Service: http://localhost:8001"
echo "   - Organization Service: http://localhost:8002"
echo "   - Survey Engine Service: http://localhost:8003"
echo "   - Blockchain Service: http://localhost:8012"
echo "   - Notification Service: http://localhost:8009"
echo ""
echo "🧪 Test AI Service:"
echo "   curl -X POST 'http://localhost:8004/api/v1/models/chat?prompt=Hello&model=gemma3'"
echo ""
echo "📝 Logs:"
echo "   - AI/ML: tail -f /tmp/ai_ml_service.log"
echo "   - Identity: tail -f /tmp/identity_service.log"
echo "   - Organization: tail -f /tmp/organization_service.log"
echo ""
echo "🛑 To stop services, run: pkill -f 'uvicorn\|manage.py runserver'"

# Save PIDs to file
echo "$AI_ML_PID $IDENTITY_PID $ORG_PID $SURVEY_PID $BLOCKCHAIN_PID $NOTIFICATION_PID" > /tmp/ex_platform_pids.txt

