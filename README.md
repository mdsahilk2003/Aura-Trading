# 📈 Aura Trading Platform

> **Smarter Trading. Better Insights.**  
> A production-grade, modular algorithmic and paper trading platform built with Next.js 15, Node.js, Express, MongoDB, Socket.io, and Tailwind CSS v4.

![Aura Trading Banner](https://aura-trading-flame.vercel.app/og-banner.png)

---

## ✨ Features

- **📊 Real-Time Market Feed**: Live WebSocket streaming price tickers for NIFTY, BANKNIFTY, RELIANCE, TCS, INFY, and custom watchlist instruments.
- **🤖 Automated Trading Bot**: Execute predefined algorithmic strategies (MA Crossover, RSI Mean Reversion, Momentum Breakout) with built-in RiskManager safeguards.
- **💼 Paper Trading Engine**: Simulate real market trades with zero financial risk and ₹10,00,000 virtual paper trading capital.
- **📈 Interactive Candlestick Charts**: High-performance market data visualization powered by Lightweight Charts.
- **🔐 Multi-Method Authentication**: Secure OAuth 2.0 via Google Authentication and local Developer Test Auth.
- **⚡ Angel One SmartAPI Integration**: Seamless live broker connectivity using Angel One SmartAPI & TOTP authentication.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, TanStack Query.
- **Backend**: Node.js, Express.js, TypeScript, Passport.js, Socket.io, Mongoose (MongoDB).
- **Database**: MongoDB Atlas.
- **Deployment**: Vercel (Frontend), Render (Backend via Blueprint `render.yaml`).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- MongoDB Atlas cluster URI or local MongoDB instance

### 2. Installation
```bash
# Clone repository
git clone https://github.com/mdsahilk2003/Aura-Trading.git
cd Aura-Trading

# Install dependencies for all workspaces
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Fill in your MongoDB URI and API keys in `.env`:
```env
PORT=4000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

### 4. Run Development Servers
```bash
# Run both Frontend & Backend concurrently
npm run dev
```

- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:4000`

---

## ☁️ Deployment

### Backend (Render)
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Blueprint**.
2. Connect `mdsahilk2003/Aura-Trading`.
3. Render automatically provisions the service using `render.yaml`.

### Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
   ```
3. Deploy!

---

## 📄 License

MIT © [Md Sahil](https://github.com/mdsahilk2003)
