# Stock Trading Platform V2

A full-stack Indian stock market trading platform with real-time price updates, portfolio management, candlestick charts, and AI-powered price predictions using numerical methods.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 19, Material UI |
| Backend | Spring Boot 3.5 (Java 17+), REST API, WebSocket |
| Prediction | Python 3 (Flask), Numerical Methods |
| Database | MySQL 8 |
| Auth | JWT (HS384) |
| Real-time | WebSocket + STOMP |

---

## Features

- User registration and login with JWT authentication
- Real-time stock price updates every 3 seconds
- Candlestick charts with zoom/pan (zoom persists across updates)
- Buy/sell stocks with virtual portfolio (starting balance ₹1,00,000)
- Portfolio analytics (P&L, balance, holdings)
- Watchlist management
- Admin dashboard (manage users, stocks, trades)
- AI price prediction using 5 numerical methods

---

## Numerical Methods (Prediction Service)

| Method | Purpose |
|--------|---------|
| Newton's Divided Difference | Polynomial interpolation for next price |
| Simpson's Rule | Numerical integration for trend strength |
| Runge-Kutta (RK4) | ODE-based 5-day price forecast |
| Newton-Raphson | Root finding for breakeven price |
| Gauss Elimination | Linear regression for price direction |

---

## Project Structure

```
StockTradingV2/
├── backend/          # Spring Boot REST API  → port 9090
├── frontend/         # React.js UI           → port 3001
├── python/           # Flask prediction API  → port 5001
└── .env              # Secrets (never commit this)
```

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Java | 17+ | https://adoptium.net |
| Maven | 3.9+ | bundled via `mvnw` |
| Node.js | 18+ | https://nodejs.org |
| Python | 3.8+ | https://python.org |
| MySQL | 8+ | https://dev.mysql.com/downloads |

---

## Setup Instructions

### Step 1 — Clone the repo

```bash
git clone https://github.com/abhay27singh/stock-trading.git
cd stock-trading
```

### Step 2 — Create the `.env` file

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
DB_URL=jdbc:mysql://localhost:3306/stocktrading_v2?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
DB_USERNAME=root           # your MySQL username
DB_PASSWORD=root123        # your MySQL password

JWT_SECRET=your_secret_key_minimum_32_characters_long
JWT_EXPIRATION=86400000

ALPHAVANTAGE_API_KEY=demo
ALPHAVANTAGE_BASE_URL=https://www.alphavantage.co/query

CORS_ALLOWED_ORIGINS=http://localhost:3001
```

> The database `stocktrading_v2` is created automatically on first boot if it doesn't exist.

### Step 3 — Start MySQL

Make sure MySQL is running locally on port `3306`. On Mac:
```bash
brew services start mysql
```
On Windows/Linux — start via MySQL Workbench or system service.

### Step 4 — Start the Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run      # Mac/Linux
mvnw.cmd spring-boot:run    # Windows
```

Wait for:
```
Started BackendApplication in X seconds
```

Runs on: **http://localhost:9090**

**IntelliJ IDEA shortcut:**
1. Open the `backend/` folder in IntelliJ
2. Enable annotation processing: Settings → Build → Compiler → Annotation Processors → ✅ Enable
3. Open `BackendApplication.java` → click the green ▶ button
4. Add `.env` file path under Run Configuration → Environment Variables

### Step 5 — Start the Frontend (React)

```bash
cd frontend
npm install        # first time only
npm start
```

Runs on: **http://localhost:3001** (opens in browser automatically)

**VS Code shortcut:** Open `frontend/` folder → Terminal → `npm start`

### Step 6 — Start the Python Prediction Service

```bash
cd python
python3 -m venv venv              # first time only
source venv/bin/activate          # Mac/Linux
venv\Scripts\activate             # Windows
pip install -r requirements.txt   # first time only
python prediction_service.py
```

Runs on: **http://localhost:5001**

---

## Default Admin Account

After first run, you can register any account. To create an admin:

1. Register normally at http://localhost:3001/register
2. Update the role in MySQL:

```sql
UPDATE stocktrading_v2.users SET role='ADMIN' WHERE email='your@email.com';
```

Admin can access: **http://localhost:3001/admin**

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT token |

### Stocks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks` | Get all stocks |
| GET | `/api/stocks/{symbol}` | Get single stock |
| GET | `/api/stocks/{symbol}/history` | Get price history |

### Trading
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trade/execute` | Buy or sell stock |
| GET | `/api/trade/portfolio` | Get user portfolio |
| GET | `/api/trade/history` | Get trade history |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| POST | `/api/user/deposit` | Add funds |

### Admin (requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Platform stats |
| GET | `/api/admin/users` | All users |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/trades` | All trades |
| POST | `/api/admin/stocks` | Add stock |
| PUT | `/api/admin/stocks/{id}` | Update stock |
| DELETE | `/api/admin/stocks/{id}` | Delete stock |

### Prediction
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | AI price prediction (port 5001) |

---

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| Backend won't start | Make sure MySQL is running and `.env` credentials are correct |
| `Port 9090 already in use` | Run `lsof -ti:9090 \| xargs kill -9` |
| `Port 3001 already in use` | Run `lsof -ti:3001 \| xargs kill -9` |
| Login says "Invalid email or password" | Register first, then login with same credentials |
| CORS errors in browser console | Make sure backend is running on port 9090 |
| Chart not loading | Make sure you are logged in and a stock is selected |

---

## Changes Made (Session — June 2026)

- Fixed `Register.js` navigation bug (`/Dashboard` → `/dashboard`)
- Fixed Spring Security CORS configuration
- Replaced broken `run.sh` (was crashing due to classpath collision) with `./mvnw spring-boot:run`
- Externalized all secrets from `application.properties` into `.env` using `${VAR:default}` placeholders
- Fixed `WebConfig.java` to read CORS origins from properties
- Fixed candlestick chart zoom reset — chart now updates data in-place instead of remounting every 3 seconds
- Fixed `fetchHistory` causing spinner on every background poll (unmounting the chart)
- Removed duplicate `TradingChart.jsx` that was conflicting with `TradingChart.js`

---

## Academic Context

Numerical methods covered:
- **#15** Financial Forecasting — Gauss Elimination for linear regression
- **#16** Stock Price Prediction — Newton's Divided Difference
- **#17** Volatility Simulator — Simpson's Rule + RK4

---

Made by [abhay27singh](https://github.com/abhay27singh)
