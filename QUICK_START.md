# Quick Start Guide

## ✅ Updated to Use Gemma3

All AI/ML services have been updated to use `gemma3` model.

## Setup Steps

### 1. Create and Activate Virtual Environment
```bash
cd /Users/ali/ex_platform_project
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Ollama and Gemma3
```bash
# Make sure Ollama is installed
# Then pull and run the model
ollama pull gemma3
ollama run gemma3
```

### 3. Install All Dependencies
```bash
# Run the installation script
./install_all.sh

# OR install manually
pip install -r requirements.txt
```

### 4. Set Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env and set:
# OLLAMA_MODEL=gemma3
# OLLAMA_BASE_URL=http://localhost:11434
```

### 5. Start Services

#### Start AI/ML Service (with Gemma3)
```bash
cd services/4-ai_ml_service
source ../../venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
```

#### Test AI Service
```bash
curl -X POST "http://localhost:8004/api/v1/models/chat" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?", "model": "gemma3"}'
```

## Key Changes Made

1. ✅ Updated all references to use `gemma3`
2. ✅ Created `requirements.txt` for all 12 services
3. ✅ Created root `requirements.txt` with common dependencies
4. ✅ Created `install_all.sh` script for easy installation
5. ✅ Updated `.env.example` with `OLLAMA_MODEL=gemma3`
6. ✅ Created setup documentation

## Files Created

- `requirements.txt` (root)
- `services/*/requirements.txt` (12 service-specific files)
- `install_all.sh` (installation script)
- `README_SETUP.md` (detailed setup guide)
- `QUICK_START.md` (this file)

## Verification

Check that Gemma3 is working:
```bash
# Check Ollama models
curl http://localhost:11434/api/tags

# Test AI service
curl -X POST "http://localhost:8004/api/v1/models/chat" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is AI?", "model": "gemma3"}'
```

## Next Steps

1. Start all infrastructure services (PostgreSQL, Redis, etc.)
2. Run database migrations
3. Start all microservices
4. Start frontend
5. Test the complete platform

For detailed instructions, see `README_SETUP.md`.

