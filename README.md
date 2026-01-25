# College Coding Platform

A LeetCode-style coding platform built specifically for college students to practice Data Structures and Algorithms (DSA) problems.

## Features

✅ **Student Authentication** - Roll number-based login with forced password change on first login  
✅ **Daily Challenges** - New coding challenge every day  
✅ **Topic-Based Organization** - Questions organized by topics (Arrays, Trees, DP, etc.)  
✅ **Code Execution** - Run and submit code in multiple languages (JavaScript, Python, Java, C++, etc.)  
✅ **Weekly Leaderboard** - Track top performers weekly  
✅ **Progress Tracking** - Monitor solved questions and scores  
✅ **Admin Panel** - Manage students and questions  
✅ **Test Cases** - Validate solutions with visible and hidden test cases  

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Judge0 API for code execution
- Bcrypt for password hashing

### Frontend
- React.js (with Vite)
- React Router for navigation
- Tailwind CSS for styling
- Monaco Editor (VS Code editor)
- Axios for API calls
- Zustand for state management

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Judge0 API key (optional for development, required for production)

### Installation

1. **Clone the repository**
```bash
cd devpro
```

2. **Set up the backend**
```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

3. **Configure environment variables**

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coding-platform
JWT_SECRET=your-secret-key-change-this-in-production
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-judge0-api-key
NODE_ENV=development
```

4. **Seed the database**
```bash
npm run seed
```

This will create:
- Admin account: `ADMIN001` / `admin123`
- Sample students: `2024001` / `student123` and `2024002` / `student123`  
- 5 sample DSA questions (Two Sum, Reverse Linked List, etc.)
- Today's daily challenge

5. **Start the backend server**
```bash
npm run dev
```

Server will run on `http://localhost:5000`

6. **Set up the frontend** (in a new terminal)
```bash
cd ../client

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Default Credentials

### Admin
- **Roll Number:** `ADMIN001`
- **Password:** `admin123`

### Sample Students
- **Roll Number:** `2024001` / **Password:** `student123`
- **Roll Number:** `2024002` / **Password:** `student123`

*Note: Students must change their password on first login*

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with roll number and password
- `POST /api/auth/change-password` - Change password (forced on first login)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `GET /api/questions/:id` - Get single question
- `GET /api/questions/meta/topics` - Get all topics with progress

### Submissions
- `POST /api/submissions/run` - Run code with visible test cases
- `POST /api/submissions/submit` - Submit solution
- `GET /api/submissions/history/:questionId` - Get submissions for a question
- `GET /api/submissions/history` - Get all user submissions

### Challenges
- `GET /api/challenges/daily` - Get today's challenge
- `GET /api/challenges/leaderboard` - Get weekly leaderboard

### Admin (Admin only)
- `POST /api/admin/students` - Add new student
- `GET /api/admin/students` - List all students
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student
- `POST /api/admin/questions` - Add new question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `POST /api/admin/daily-challenge` - Set daily challenge

## Database Models

### User
- Roll number (unique)
- Password (hashed)
- Name, Email
- isAdmin, isFirstLogin flags
- Solved questions array
- Score

### Question
- Title, Slug, Description
- Difficulty (Easy/Medium/Hard)
- Topic
- Constraints, Examples
- Test cases (visible & hidden)
- Starter code (multiple languages)
- Hints

### Submission
- User ID, Question ID
- Code, Language
- Verdict (Accepted, Wrong Answer, TLE, etc.)
- Runtime, Memory
- Passed/Total test cases

### DailyChallenge
- Date, Question ID
- Participants, Solved by

## Code Execution

The platform uses **Judge0 CE API** for code execution. In development mode without an API key, it returns mock responses. For production:

1. Get a free API key from [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Add it to `server/.env` as `JUDGE0_API_KEY`

### Supported Languages
- JavaScript (Node.js)
- Python 3
- Java
- C++
- C
- C#
- Go
- Rust
- Ruby
- PHP

## Scoring System

- **Easy:** 10 points
- **Medium:** 20 points
- **Hard:** 30 points

Points are awarded only on first successful submission of each question.

## Development Notes

- Backend runs on port 5000
- Frontend runs on port 5173
- MongoDB default: `localhost:27017`
- CORS is enabled for `http://localhost:5173`

## Project Structure

```
devpro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities, API client
│   │   ├── contexts/      # Auth context
│   │   └── App.tsx        # Main app
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth middleware
│   │   ├── services/      # Code executor service
│   │   ├── config/        # Database config
│   │   └── index.js       # Server entry
│   ├── seed.js            # Database seeder
│   └── package.json
└── README.md
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

### Judge0 API Errors
- Verify API key is correct
- Check RapidAPI subscription status
- In development, it will use mock responses if no key is provided

### Port Already in Use
- Change `PORT` in `server/.env`
- Update CORS origin in `server/src/index.js`

## Future Enhancements

- [ ] Contest mode with time limits
- [ ] Discussion forum for each question
- [ ] Solution videos/editorials
- [ ] Badge system for achievements
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile responsive improvements

## License

MIT

## Support

For issues or questions, contact the admin at your college.
