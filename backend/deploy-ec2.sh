#!/bin/bash
set -e

echo "=================================================="
echo "🚀 AURA TRADING BACKEND — EC2 AUTOMATED DEPLOYMENT"
echo "Elastic IP: 65.1.222.7"
echo "=================================================="

# 1. Check IP address
MY_IP=$(curl -s https://checkip.amazonaws.com || echo "unknown")
echo "[1/7] Static IP Check: $MY_IP"
if [ "$MY_IP" != "65.1.222.7" ]; then
    echo "⚠️ WARNING: Current IP ($MY_IP) does not match expected Elastic IP (65.1.222.7)"
fi

# 2. Update System & Install Node.js LTS, Git, Nginx, PM2
echo "[2/7] Installing System Dependencies (Node 20 LTS, Git, Nginx, PM2)..."
sudo apt-get update -y
sudo apt-get install -y curl git nginx build-essential

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

sudo npm install -g pm2

# 3. Navigate to backend project directory
cd /home/ubuntu/aura-trading/backend || {
    echo "Directory /home/ubuntu/aura-trading/backend not found. Please clone repository first."
    exit 1
}

# 4. Install dependencies and build
echo "[3/7] Installing NPM packages and building shared + backend..."
cd /home/ubuntu/aura-trading
npm install
npm run build -w shared
npm run build -w backend

cd /home/ubuntu/aura-trading/backend

# 5. Check .env file
echo "[4/7] Verifying .env configuration..."
if [ ! -f .env ]; then
    echo "⚠️ .env file missing in /home/ubuntu/aura-trading/backend!"
    echo "Copying .env.production.example to .env..."
    cp .env.production.example .env
    echo "PLEASE EDIT /home/ubuntu/aura-trading/backend/.env WITH REAL SECRETS AND RERUN PM2."
fi

# 6. PM2 Process Management
echo "[5/7] Configuring PM2 Process (aura-backend)..."
pm2 start ecosystem.config.js || pm2 restart aura-backend
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu || pm2 startup

# 7. Configure Nginx Reverse Proxy
echo "[6/7] Configuring Nginx Reverse Proxy..."
sudo cp nginx-aura-backend.conf /etc/nginx/sites-available/aura-backend
sudo ln -sf /etc/nginx/sites-available/aura-backend /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# 8. Health Check
echo "[7/7] Verifying Backend Health..."
sleep 2
curl -s http://127.0.0.1:4000/health | grep '"status":"ok"' && echo "✅ HEALTH CHECK PASSED!" || echo "⚠️ Health check failed."

echo "=================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Backend URL: http://65.1.222.7"
echo "=================================================="
