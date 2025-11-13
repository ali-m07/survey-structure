.PHONY: help build test deploy-k8s deploy-n8n-workflows clean install dev-up dev-down

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies for all services
	@echo "Installing Python dependencies..."
	@for service in services/*/; do \
		if [ -f "$$service/pyproject.toml" ]; then \
			echo "Installing dependencies for $$service"; \
			cd $$service && poetry install && cd ../..; \
		fi \
	done
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install

build: ## Build all Docker images
	@echo "Building Docker images..."
	docker-compose build

test: ## Run tests for all services
	@echo "Running tests..."
	@for service in services/*/; do \
		if [ -f "$$service/pyproject.toml" ]; then \
			echo "Running tests for $$service"; \
			cd $$service && poetry run pytest && cd ../..; \
		fi \
	done

dev-up: ## Start development environment
	@echo "Starting development environment..."
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 10
	@echo "Services are up! Access Traefik dashboard at http://localhost:8080"
	@echo "Grafana at http://localhost:3000 (admin/admin)"
	@echo "n8n at http://localhost:5678"

dev-down: ## Stop development environment
	@echo "Stopping development environment..."
	docker-compose down

dev-logs: ## View logs from all services
	docker-compose logs -f

deploy-k8s: ## Deploy to Kubernetes using Helm
	@echo "Deploying to Kubernetes..."
	@cd k8s/charts && helm install ex-platform . --namespace ex-platform --create-namespace
	@echo "Deployment complete! Check status with: kubectl get pods -n ex-platform"

deploy-n8n-workflows: ## Deploy n8n workflows
	@echo "Deploying n8n workflows..."
	@if [ -d "ci-cd/n8n-workflows" ]; then \
		n8n import:workflow --input=ci-cd/n8n-workflows/*.json; \
	else \
		echo "No n8n workflows found in ci-cd/n8n-workflows/"; \
	fi

clean: ## Clean up Docker resources
	@echo "Cleaning up..."
	docker-compose down -v
	docker system prune -f

migrate: ## Run database migrations
	@echo "Running migrations..."
	@for service in services/*/; do \
		if [ -f "$$service/manage.py" ]; then \
			echo "Running migrations for $$service"; \
			cd $$service && poetry run python manage.py migrate && cd ../..; \
		fi \
	done

lint: ## Run linters
	@echo "Running linters..."
	@for service in services/*/; do \
		if [ -f "$$service/pyproject.toml" ]; then \
			echo "Linting $$service"; \
			cd $$service && poetry run black . && poetry run flake8 . && cd ../..; \
		fi \
	done

security-scan: ## Run security scans
	@echo "Running security scans..."
	trivy image --exit-code 1 --severity HIGH,CRITICAL ex-platform:latest

