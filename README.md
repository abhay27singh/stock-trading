# Stock Trading Platform V2

A full-stack stock trading web application with real-time data, portfolio management, and AI-powered price predictions using numerical methods.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | Spring Boot (Java), REST API, WebSocket |
| Prediction | Python (Flask), Numerical Methods |
| Database | MySQL |
| Auth | JWT |
| Stock Data | Alpha Vantage API |

## Features

- User registration and login with JWT authentication
- Real-time stock price charts
- Buy/sell stocks with virtual portfolio
- Watchlist management
- Admin dashboard
- AI price prediction using 5 numerical methods

## Numerical Methods Used (Prediction Service)

| Method | Purpose |
|--------|---------|
| Newton's Divided Difference | Polynomial interpolation for next price |
| Simpson's Rule | Numerical integration for trend strength |
| Runge-Kutta (RK4) | ODE-based 5-day price forecast |
| Newton-Raphson | Root finding for breakeven price |
| Gauss Elimination | Linear regression for price direction |

## Project Structure

```
StockTradingV2/
├── backend/          # Spring Boot REST API (port 9090)
├── frontend/         # React.js UI (port 3001)
└── python/           # Flask prediction service (port 5001)
```

## Setup & Run

### Prerequisites
- Java 17+
- Node.js 18+
- Python 3.8+
- MySQL 8

### 1. Database
```sql
CREATE DATABASE stocktrading_v2;
```

### 2. Backend
```bash
cd backend
./mvnw spring-boot:run
```
Runs on: `http://localhost:9090`

### 3. Frontend
```bash
cd frontend
npm install
npm start
```
Runs on: `http://localhost:3001`

### 4. Python Prediction Service
```bash
cd python
pip install -r requirements.txt
python prediction_service.py
```
Runs on: `http://localhost:5001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/stocks` | Get all stocks |
| POST | `/api/trades/buy` | Buy stock |
| POST | `/api/trades/sell` | Sell stock |
| GET | `/api/portfolio` | Get portfolio |
| POST | `/predict` | Get price prediction |

## Screenshots

> Dashboard with real-time stock prices, portfolio overview, and prediction cards.

## Academic Context

This project covers the following lab mini-projects:
- **Numerical Methods:** #16 Stock Price Prediction, #17 Volatility Simulator, #15 Financial Forecasting
- **Cloud Computing:** Deployable on AWS EC2, S3, ECS

---
Made by [abhay27singh](https://github.com/abhay27singh)
