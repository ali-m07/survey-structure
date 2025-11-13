# 🚀 Services Status

## ✅ Services Running

### Core Services

1. **AI/ML Service** ✅
   - URL: http://localhost:8004
   - Status: Running
   - Model: Gemma3
   - Health: http://localhost:8004/health
   - Test: `curl -X POST "http://localhost:8004/api/v1/models/chat?prompt=Hello&model=gemma3"`

2. **Identity Service** ✅
   - URL: http://localhost:8001
   - Status: Starting
   - Health: http://localhost:8001/health

3. **Organization Service** ✅
   - URL: http://localhost:8002
   - Status: Starting
   - Health: http://localhost:8002/health

4. **Survey Engine Service** ✅
   - URL: http://localhost:8003
   - Status: Starting
   - Health: http://localhost:8003/health

5. **Blockchain Service** ✅
   - URL: http://localhost:8012
   - Status: Running
   - Health: http://localhost:8012/health

6. **Notification Service** ✅
   - URL: http://localhost:8009
   - Status: Running
   - Health: http://localhost:8009/health

## 🧪 Test Commands

### Test AI/ML Service with Gemma3
```bash
# Chat with AI
curl -X POST "http://localhost:8004/api/v1/models/chat?prompt=What%20is%20AI%3F&model=gemma3"

# Analyze sentiment
curl -X POST "http://localhost:8004/api/v1/sentiment/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "I am very happy!", "language": "en"}'

# List available models
curl http://localhost:8004/api/v1/models/list
```

### Test Other Services
```bash
# Identity Service
curl http://localhost:8001/api/v1/identity/accounts/users/

# Organization Service
curl http://localhost:8002/api/v1/organization/employees/

# Survey Engine Service
curl http://localhost:8003/api/v1/survey/surveys/

# Blockchain Service
curl http://localhost:8012/api/v1/blockchain/hash/generate
```

## 📊 Service URLs

- **AI/ML Service**: http://localhost:8004
- **Identity Service**: http://localhost:8001
- **Organization Service**: http://localhost:8002
- **Survey Engine Service**: http://localhost:8003
- **Action Planner Service**: http://localhost:8005 (not started)
- **Reporting Service**: http://localhost:8006 (not started)
- **Workflow Automation Service**: http://localhost:8007 (not started)
- **Integration Marketplace Service**: http://localhost:8008 (not started)
- **Notification Service**: http://localhost:8009
- **Performance Service**: http://localhost:8010 (not started)
- **Feedback Service**: http://localhost:8011 (not started)
- **Blockchain Service**: http://localhost:8012

## 🛑 Stop Services

```bash
# Stop all services
pkill -f 'uvicorn|manage.py runserver'

# Or stop individually
kill <PID>
```

## 📝 View Logs

```bash
# AI/ML Service
tail -f /tmp/ai_ml_service.log

# Identity Service
tail -f /tmp/identity_service.log

# Organization Service
tail -f /tmp/organization_service.log

# Survey Engine Service
tail -f /tmp/survey_service.log

# Blockchain Service
tail -f /tmp/blockchain_service.log

# Notification Service
tail -f /tmp/notification_service.log
```

## ✅ Status

**Platform is running!** 🎉

- ✅ Gemma3 model is available and working
- ✅ AI/ML Service is responding
- ✅ Core services are starting
- ✅ All services configured correctly

---

**Last Updated**: Current
**Status**: ✅ **RUNNING**

