# Setup Instructions

## Prerequisites

1. Python 3.11+
2. Ollama installed and running
3. PostgreSQL, Redis, Neo4j (or use Docker Compose)

## Step 1: Create Virtual Environment

```bash
cd /Users/ali/ex_platform_project
python3 -m venv venv
source venv/bin/activate
```

## Step 2: Install Ollama and Gemma3 Model

```bash
# Install Ollama (if not already installed)
# Visit https://ollama.ai for installation instructions

# Pull and run Gemma3 model
ollama pull gemma3
ollama run gemma3
```

## Step 3: Install All Dependencies

### Option 1: Use the install script
```bash
./install_all.sh
```

### Option 2: Install manually
```bash
# Install root requirements
pip install -r requirements.txt

# Install each service's requirements
cd services/1-identity_service && pip install -r requirements.txt && cd ../..
cd services/2-organization_service && pip install -r requirements.txt && cd ../..
cd services/3-survey_engine_service && pip install -r requirements.txt && cd ../..
cd services/4-ai_ml_service && pip install -r requirements.txt && cd ../..
cd services/5-action_planner_service && pip install -r requirements.txt && cd ../..
cd services/6-reporting_service && pip install -r requirements.txt && cd ../..
cd services/7-workflow_automation_service && pip install -r requirements.txt && cd ../..
cd services/8-integration_marketplace_service && pip install -r requirements.txt && cd ../..
cd services/9-notification_service && pip install -r requirements.txt && cd ../..
cd services/10-performance_service && pip install -r requirements.txt && cd ../..
cd services/11-feedback_service && pip install -r requirements.txt && cd ../..
cd services/12-blockchain_service && pip install -r requirements.txt && cd ../..
```

## Step 4: Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
# Make sure OLLAMA_MODEL=gemma3
```

## Step 5: Start Infrastructure Services

```bash
# Using Docker Compose
make dev-up

# Or start services individually
docker-compose up -d postgres redis rabbitmq kafka neo4j
```

## Step 6: Run Database Migrations

```bash
# For Django services
cd services/1-identity_service
python manage.py migrate
cd ../..

cd services/2-organization_service
python manage.py migrate
cd ../..

# Repeat for all Django services
```

## Step 7: Start Services

### Start AI/ML Service (FastAPI)
```bash
cd services/4-ai_ml_service
source ../../venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
```

### Start Identity Service (Django)
```bash
cd services/1-identity_service
source ../../venv/bin/activate
python manage.py runserver 0.0.0.0:8001
```

### Start Organization Service (Django)
```bash
cd services/2-organization_service
source ../../venv/bin/activate
python manage.py runserver 0.0.0.0:8002
```

### Start Survey Engine Service (Django)
```bash
cd services/3-survey_engine_service
source ../../venv/bin/activate
python manage.py runserver 0.0.0.0:8003
```

### Start Blockchain Service (FastAPI)
```bash
cd services/12-blockchain_service
source ../../venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8012 --reload
```

### Start Notification Service (FastAPI)
```bash
cd services/9-notification_service
source ../../venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8009 --reload
```

## Step 8: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

## Verification

1. Check Ollama is running with Gemma3:
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. Test AI/ML Service:
   ```bash
   curl -X POST "http://localhost:8004/api/v1/models/chat" \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Hello, how are you?", "model": "gemma3"}'
   ```

3. Check service health:
   ```bash
   curl http://localhost:8004/health
   curl http://localhost:8001/health
   ```

## Troubleshooting

1. **Ollama connection error**: Make sure Ollama is running and Gemma3 model is pulled
2. **Database connection error**: Check PostgreSQL is running and credentials in .env are correct
3. **Port already in use**: Change port numbers in service settings or .env file
4. **Module not found**: Make sure you've activated the virtual environment and installed all requirements

## Environment Variables

Key environment variables to set in `.env`:
- `OLLAMA_BASE_URL=http://localhost:11434`
- `OLLAMA_MODEL=gemma3`
- `DATABASE_HOST=localhost`
- `DATABASE_NAME=ex_platform_db`
- `DATABASE_USER=user`
- `DATABASE_PASSWORD=password`

## Next Steps

1. Set up database migrations for all services
2. Configure authentication and authorization
3. Set up monitoring and logging
4. Configure CI/CD pipelines
5. Deploy to production

