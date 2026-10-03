#!/bin/bash
set -e

APP_DIR="/home/ubuntu/exam_portal_project"
SERVER_IP="13.127.244.35"

echo "=========================================================="
echo "🚀 [1/5] Checking Docker & Docker Compose installation..."
echo "=========================================================="

if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker & Compose plugin..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker ubuntu || true
fi

# Detect docker compose syntax
if docker compose version &> /dev/null; then
    COMPOSE_CMD="sudo docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="sudo docker-compose"
else
    echo "Installing docker-compose-plugin..."
    sudo apt-get update -y && sudo apt-get install -y docker-compose-plugin
    COMPOSE_CMD="sudo docker compose"
fi

echo "Using compose command: $COMPOSE_CMD"

echo "=========================================================="
echo "📝 [2/5] Setting up environment variables in $APP_DIR..."
echo "=========================================================="

cd "$APP_DIR"

cat << EOF > .env
POSTGRES_DB=examdb
POSTGRES_USER=examuser
POSTGRES_PASSWORD=exampass
DATABASE_URL=postgresql://examuser:exampass@postgres:5432/examdb
SECRET_KEY=exam_portal_production_secret_key_849204859
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
ADMIN_EMAIL=admin@awslearning.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=AWS Trainer
FRONTEND_URL=http://${SERVER_IP}:5173
VITE_API_URL=http://${SERVER_IP}:8000
EOF

cat << EOF > frontend/.env
VITE_API_URL=http://${SERVER_IP}:8000
EOF

echo "Environment files generated successfully."

echo "=========================================================="
echo "🐳 [3/5] Building and starting Docker containers..."
echo "=========================================================="

$COMPOSE_CMD down --remove-orphans || true
$COMPOSE_CMD up --build -d

echo "=========================================================="
echo "⏳ [4/5] Waiting for services to initialize..."
echo "=========================================================="

sleep 8

# Poll backend health endpoint
HEALTHY=false
for i in $(seq 1 15); do
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        echo "✅ Backend API is healthy and reachable!"
        HEALTHY=true
        break
    fi
    echo "Waiting for backend service to become ready ($i/15)..."
    sleep 4
done

if [ "$HEALTHY" = false ]; then
    echo "⚠️ Warning: Backend health check timed out. Checking container logs..."
    $COMPOSE_CMD logs backend --tail=50
fi

# Ensure database tables and questions are seeded
echo "Ensuring seed data is loaded..."
$COMPOSE_CMD exec -T backend python -m app.services.seed || true

echo "=========================================================="
echo "🎉 [5/5] Deployment Successful!"
echo "=========================================================="
$COMPOSE_CMD ps

echo "Pruning dangling images..."
sudo docker image prune -f || true

echo ""
echo "----------------------------------------------------------"
echo "🌐 Exam Portal Frontend : http://${SERVER_IP}:5173"
echo "🔌 Backend API          : http://${SERVER_IP}:8000"
echo "📖 Swagger API Docs     : http://${SERVER_IP}:8000/docs"
echo "👤 Default Trainer Login: admin@awslearning.com / Admin@123"
echo "----------------------------------------------------------"
