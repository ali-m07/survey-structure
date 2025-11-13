#!/bin/bash

# Verification script to check all installations

echo "🔍 Verifying installation..."

# Check virtual environment
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found"
    exit 1
fi
echo "✅ Virtual environment exists"

# Activate venv
source venv/bin/activate

# Check Python packages
echo "Checking Python packages..."
python -c "import django; print('✅ Django installed')" 2>/dev/null || echo "❌ Django not installed"
python -c "import fastapi; print('✅ FastAPI installed')" 2>/dev/null || echo "❌ FastAPI not installed"
python -c "import requests; print('✅ Requests installed')" 2>/dev/null || echo "❌ Requests not installed"
python -c "import numpy; print('✅ NumPy installed')" 2>/dev/null || echo "❌ NumPy not installed"
python -c "import sklearn; print('✅ Scikit-learn installed')" 2>/dev/null || echo "❌ Scikit-learn not installed"
python -c "import neo4j; print('✅ Neo4j driver installed')" 2>/dev/null || echo "❌ Neo4j driver not installed"
python -c "import web3; print('✅ Web3 installed')" 2>/dev/null || echo "❌ Web3 not installed"

# Check requirements files
echo ""
echo "Checking requirements files..."
for service in services/*/requirements.txt; do
    if [ -f "$service" ]; then
        echo "✅ $(basename $(dirname $service)) requirements.txt exists"
    else
        echo "❌ $(basename $(dirname $service)) requirements.txt missing"
    fi
done

# Check Ollama (if available)
echo ""
echo "Checking Ollama..."
if command -v ollama &> /dev/null; then
    echo "✅ Ollama is installed"
    # Check if gemma3 is available
    if ollama list | grep -q "gemma3"; then
        echo "✅ Gemma3 model is available"
    else
        echo "⚠️  Gemma3 model not found. Run: ollama pull gemma3"
    fi
else
    echo "⚠️  Ollama not found. Install from https://ollama.ai"
fi

echo ""
echo "✨ Verification complete!"

