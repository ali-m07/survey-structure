# 🌐 Browser URL - Enterprise Experience Platform

## ✅ **MAIN URL TO OPEN IN YOUR BROWSER:**

### **http://localhost:3000**

---

## 🚀 Quick Start

1. **Open your browser**
2. **Navigate to:** `http://localhost:3000`
3. **You should see:**
   - Enterprise Experience Platform Home Page
   - Service Status Dashboard
   - Quick Action Buttons
   - AI Service Testing Section

---

## 📊 All Available URLs

### Frontend
- **Home Page**: http://localhost:3000
- **Frontend Dev Server**: http://localhost:3000

### Backend Services
- **AI/ML Service**: http://localhost:8004
- **AI/ML API Docs**: http://localhost:8004/docs
- **Identity Service**: http://localhost:8001
- **Organization Service**: http://localhost:8002
- **Survey Engine Service**: http://localhost:8003
- **Blockchain Service**: http://localhost:8012
- **Notification Service**: http://localhost:8009

### Infrastructure
- **Traefik Dashboard**: http://localhost:8080
- **Grafana**: http://localhost:3000 (if running via Docker)
- **RabbitMQ Management**: http://localhost:15672
- **n8n Workflow**: http://localhost:5678
- **Vault UI**: http://localhost:8200

---

## 🧪 Test the Platform

### 1. Open Home Page
```
http://localhost:3000
```

### 2. Test AI Service (Gemma3)
```
http://localhost:8004/docs
```

### 3. Check Service Status
The home page will automatically show the status of all services.

---

## 🎯 What You'll See

### Home Page Features:
- ✅ Service Status Dashboard
- ✅ Quick Action Buttons (Create Survey, View Analytics, AI Insights, Generate Reports)
- ✅ Feature Highlights (AI-Powered Insights, Survey Engine, Blockchain Integration)
- ✅ Direct Link to AI Service API Documentation

---

## ⚠️ If Port 3000 is Already in Use

If you see an error that port 3000 is in use, you can:

1. **Change the port** by running:
   ```bash
   cd frontend
   PORT=3001 npm run dev
   ```
   Then open: **http://localhost:3001**

2. **Or stop the service using port 3000:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

---

## ✅ Status

**Frontend is starting...**

Once it's ready, open: **http://localhost:3000**

---

**Last Updated**: Current
**Main URL**: **http://localhost:3000**

