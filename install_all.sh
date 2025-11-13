#!/bin/bash

# Install all dependencies for all services
# This script should be run from the project root with venv activated

echo "Installing dependencies for all services..."

# Activate virtual environment
source venv/bin/activate

# Install root requirements
echo "Installing root requirements..."
pip install -r requirements.txt

# Install service-specific requirements
echo "Installing Identity Service dependencies..."
cd services/1-identity_service
pip install -r requirements.txt
cd ../..

echo "Installing Organization Service dependencies..."
cd services/2-organization_service
pip install -r requirements.txt
cd ../..

echo "Installing Survey Engine Service dependencies..."
cd services/3-survey_engine_service
pip install -r requirements.txt
cd ../..

echo "Installing AI/ML Service dependencies..."
cd services/4-ai_ml_service
pip install -r requirements.txt
cd ../..

echo "Installing Action Planner Service dependencies..."
cd services/5-action_planner_service
pip install -r requirements.txt
cd ../..

echo "Installing Reporting Service dependencies..."
cd services/6-reporting_service
pip install -r requirements.txt
cd ../..

echo "Installing Workflow Automation Service dependencies..."
cd services/7-workflow_automation_service
pip install -r requirements.txt
cd ../..

echo "Installing Integration Marketplace Service dependencies..."
cd services/8-integration_marketplace_service
pip install -r requirements.txt
cd ../..

echo "Installing Notification Service dependencies..."
cd services/9-notification_service
pip install -r requirements.txt
cd ../..

echo "Installing Performance Service dependencies..."
cd services/10-performance_service
pip install -r requirements.txt
cd ../..

echo "Installing Feedback Service dependencies..."
cd services/11-feedback_service
pip install -r requirements.txt
cd ../..

echo "Installing Blockchain Service dependencies..."
cd services/12-blockchain_service
pip install -r requirements.txt
cd ../..

echo "All dependencies installed successfully!"
echo "Remember to start Ollama with: ollama run gemma3"

