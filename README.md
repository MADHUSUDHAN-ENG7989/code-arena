# Code Arena ⚔️

Code Arena is a premium, full-featured, LeetCode-style online coding platform. It allows students to solve algorithmic challenges, track their progress, view personal statistics, complete daily challenges, climb leaderboards, and add friends. It also includes an administrative dashboard for managing students, questions, and viewing platform usage statistics.

---

## 🚀 Deployed Links & Services

* **Frontend Client (Vercel)**: Deployed statically via Vercel.
* **Backend Server (Render)**: Deployed at [https://code-arena-api-5am7.onrender.com](https://code-arena-api-5am7.onrender.com) (Subject to cold starts on the free tier).
* **Primary Code Execution Engine (Judge0 CE on AWS EC2)**: Hosted on a dedicated, self-managed AWS EC2 instance.

---

## 🛠️ System Architecture & Services

### 3-Tier Code Execution Engine
Code Arena uses a robust **3-Tier Code Execution Engine** designed to handle students' code submissions across multiple languages (JavaScript, Python, C++, Java, C):

1. **Tier 1: Self-Hosted Judge0 (AWS EC2)**: The primary, high-performance compiler service hosted on a dedicated AWS EC2 instance.
2. **Tier 2: JDoodle API (Cloud Fallback)**: If the EC2 instance is unreachable, the system automatically falls back to the JDoodle compiler API.
3. **Tier 3: Local Server Execution (Fail-Safe)**: If all remote compilation services hit rate limits (e.g., JDoodle daily limit `429` errors) or are offline, the backend server executes submissions locally in a temp sandbox using the server's native compiler runtimes (`node`, `python3`, and `g++`).

### Microservices & Managed Services
To scale performance and keep execution robust, the platform leverages the following distributed services:
* **In-Memory Caching (Redis Labs)**: Deployed on a managed Redis Cloud service to cache ranked leaderboards (weekly, monthly, and overall) and daily challenge stats, preventing database overhead.
* **Database (MongoDB Atlas)**: A managed cloud database service storing user profiles, questions, test cases, and history.
* **AI Code Complexity Analyzer (Groq Cloud API)**: Connects to Groq's high-speed inference microservice using `llama-3.3-70b-versatile` to provide students with instant, platform-grade feedback on space/time complexity, code quality, code smells, and actionable recommendations.

---

## 🌟 Key Features

### For Students:
* **Interactive Coding Sandbox**: Embedded Monaco Editor (same core engine as VS Code) with multi-language auto-generation templates.
* **Live Test Case Runner**: Run specific inputs and view logs, outputs, compile errors, or runtime exceptions.
* **Visual Progress Dashboard**: Interactive activity heatmap calendars (GitHub style), submission breakdowns by difficulty (Easy, Medium, Hard), and problem topic statistics.
* **Gamification & Social**: Global leaderboards, peer search, friend request systems, and daily competitive challenges.

### For Administrators:
* **Student Management**: CRUD interface to register, modify, or delete student profiles.
* **Question Builder**: Custom tool to construct new algorithmic questions, define starter code for 5 languages, add hints, and manage test cases (including hidden validation test cases).
* **Platform Observability**: Real-time activity logs, response-time telemetry, and platform stats dashboard.

---

## 💻 Tech Stack

### Frontend:
* **Core**: React, Vite, TypeScript, TailwindCSS
* **Code Editor**: Monaco Editor (`@monaco-editor/react`)
* **State Management**: Zustand
* **Animations**: Framer Motion
* **Utilities**: Axios, Socket.io-client, React Icons, React Calendar Heatmap

### Backend:
* **Runtime**: Node.js, Express
* **Database**: MongoDB Atlas (managed via Mongoose)
* **Real-time Engine**: Socket.io
* **Telemetry**: Winston logger

---

## ⚙️ Project Structure

```
code_arena/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Editor, Leaderboard, charts, etc.)
│   │   ├── lib/            # Axios API config & query handlers
│   │   ├── store/          # Zustand state management stores
│   │   └── App.tsx         # Routing & primary page assembly
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express Backend API
│   ├── src/
│   │   ├── configs/        # Database configs & problem structures
│   │   ├── models/         # Mongoose Schemas (User, Question, Submission, Challenge)
│   │   ├── routes/         # Express endpoint controllers
│   │   └── services/       # CodeExecutor, driver builders, and auth utilities
│   ├── seed.js             # Initial database seeder
│   ├── add_all_54_final.js # Production seeder for the 54 core problems
│   ├── verify_questions.js # Integrity check verifying problem counts
│   └── package.json
└── test/                   # Mass verification and test scripts
    └── verify_all_execution.js # Automated mock test runner for all 54 questions
```

---

## 🔧 Local Setup & Installation

### Prerequisites:
* [Node.js](https://nodejs.org/) (v16+)
* [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or Atlas URL)
* [Python 3](https://www.python.org/) and [GCC (g++)](https://gcc.gnu.org/) (optional, required for local fail-safe execution testing)

### 1. Clone & Install Dependencies:
```bash
# Install root tools
npm install

# Setup backend dependencies
cd server
npm install

# Setup frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables:

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JUDGE0_API_URL=your_judge0_api_url
JDOODLE_CLIENT_ID=your_jdoodle_id
JDOODLE_CLIENT_SECRET=your_jdoodle_secret
NODE_ENV=development
```

### 3. Database Seeding:
Populate the database with the core 54 algorithmic questions:
```bash
cd server
node add_all_54_final.js
```

### 4. Running the Application Locally:

#### Start Backend Server:
```bash
cd server
npm run dev
```

#### Start Frontend Client:
```bash
cd client
npm run dev
```

---

## 🧪 Testing & Verification

We provide automated test scripts to ensure that the code generation driver, parsing, and compilers are functioning correctly:

* **Verify Database Status**: Checks that the correct 54 problems are seeded.
  ```bash
  cd server
  node verify_questions.js
  ```
* **Verify Execution Engine (573 test cases)**: Compiles and checks placeholder solutions across JS, Python, and C++ to verify compilation safety.
  ```bash
  node test/verify_all_execution.js
  ```

---

## 📄 License
This project is private and proprietary. All rights reserved.
