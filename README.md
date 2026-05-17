# ⚡ ECOGENIE – AI-Driven Smart Energy Optimization Platform

> A production-ready full-stack smart home energy management SaaS platform with real-time sensor simulation, AI-powered automation, and beautiful analytics dashboards.

![ECOGENIE Dashboard](https://via.placeholder.com/1200x600/0f172a/10b981?text=ECOGENIE+Dashboard)

---

## 🚀 Features

### 🔐 Authentication
- JWT-based secure authentication
- bcrypt password hashing (12 salt rounds)
- Protected routes on both frontend and backend
- User profile management

### 🏠 Smart Dashboard
- Real-time room temperature, humidity, occupancy
- Live sensor simulation engine
- Energy consumption overview
- Weather integration (OpenWeatherMap)
- AI-powered recommendations

### ⚡ Appliance Management
- 4 appliance types: Fan, AC, Lights, Heater
- ON/OFF toggle with animated controls
- Speed/intensity adjustment (0–100%)
- Auto mode vs Manual mode
- Schedule support

### 🏡 Multi-Room Management
- 4 rooms: Bedroom, Hall, Kitchen, Study Room
- Independent sensor values per room
- Per-room automation toggle
- Room-level analytics

### 🤖 Smart Automation Engine
- Temperature-based Fan/AC/Heater control
- Occupancy-based appliance shutoff
- Time-based lighting optimization
- Energy saving mode during peak hours
- Extensible for ML integration

### 📊 Energy Analytics
- Daily/weekly/monthly consumption charts
- Appliance-wise breakdown (pie chart)
- Room-wise consumption (bar chart)
- Estimated electricity bill
- Energy saving score (0–100)
- Carbon footprint tracking

### 🌤️ Weather Integration
- Live weather via OpenWeatherMap API
- Graceful fallback to mock data
- Influences automation recommendations

### 🔔 Notification System
- Overheating alerts
- Excessive energy usage warnings
- Automation action notifications
- Mark read / delete notifications

### 📋 Activity Logs
- User action tracking
- Automation action history
- Filterable by type
- Paginated results

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Animations | Framer Motion |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Morgan |

---

## 📁 Project Structure

```
ecogenie/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ApplianceCard.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── WeatherWidget.jsx
│   │   ├── context/           # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── EnergyContext.jsx
│   │   ├── layouts/           # Page layouts
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/             # Route pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Rooms.jsx
│   │   │   ├── Appliances.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Automation.jsx
│   │   │   ├── Activity.jsx
│   │   │   └── Settings.jsx
│   │   └── services/          # API service layer
│   │       └── api.js
│   └── public/
│
└── server/                    # Express backend
    ├── config/
    │   └── db.js              # MongoDB connection
    ├── controllers/           # Route handlers
    │   ├── authController.js
    │   ├── roomController.js
    │   ├── applianceController.js
    │   ├── analyticsController.js
    │   ├── automationController.js
    │   ├── weatherController.js
    │   ├── notificationController.js
    │   └── activityController.js
    ├── middleware/
    │   ├── auth.js            # JWT middleware
    │   ├── errorHandler.js    # Centralized error handling
    │   └── validate.js        # Request validation
    ├── models/                # Mongoose schemas
    │   ├── User.js
    │   ├── Room.js
    │   ├── Appliance.js
    │   ├── Analytics.js
    │   ├── ActivityLog.js
    │   └── Notification.js
    ├── routes/                # Express routers
    │   ├── authRoutes.js
    │   ├── roomRoutes.js
    │   ├── applianceRoutes.js
    │   ├── analyticsRoutes.js
    │   ├── automationRoutes.js
    │   ├── weatherRoutes.js
    │   ├── notificationRoutes.js
    │   └── activityRoutes.js
    ├── utils/
    │   ├── generateToken.js
    │   └── seedData.js
    └── index.js               # Server entry point
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- OpenWeatherMap API key (optional)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ecogenie.git
cd ecogenie
```

### 2. Backend setup
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Frontend setup
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### 4. Environment Variables

**server/.env**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ecogenie
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
WEATHER_API_KEY=your_openweathermap_key   # optional
CLIENT_URL=http://localhost:5173
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import project in Vercel
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy

### Backend → Render
1. Create a new Web Service on Render
2. Connect your GitHub repo, set root to `server/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables

### Database → MongoDB Atlas
1. Create a free cluster
2. Add your IP to the allowlist (or 0.0.0.0/0 for Render)
3. Copy the connection string to `MONGODB_URI`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/rooms` | Get all rooms |
| POST | `/api/rooms/simulate` | Simulate sensors |
| GET | `/api/appliances` | Get appliances |
| PUT | `/api/appliances/:id/toggle` | Toggle appliance |
| PUT | `/api/appliances/:id/intensity` | Set intensity |
| GET | `/api/analytics/overview` | Analytics data |
| GET | `/api/analytics/recommendations` | AI recommendations |
| POST | `/api/automation/run` | Run automation |
| GET | `/api/weather` | Get weather |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/activity` | Activity logs |

---

## 🎨 Design System

- **Theme**: Dark mode (slate-950 base)
- **Style**: Glassmorphism cards with backdrop blur
- **Accent**: Emerald green (#10b981) + Blue (#3b82f6)
- **Typography**: Inter font family
- **Animations**: Framer Motion page transitions and micro-interactions
- **Responsive**: Mobile-first, works on all screen sizes

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

<p align="center">Built with ❤️ by the ECOGENIE Team</p>
