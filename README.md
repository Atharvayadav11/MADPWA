# Quiz Platform

A Progressive Web App (PWA) quiz platform built using the MERN stack with JWT authentication. Users can take MCQ-based tests, track previous performance, and analyze results.

## Features

- User Authentication (Signup/Login/Logout)
- Multiple test categories
- MCQ-based tests with timer
- Test results and performance analysis
- Mobile-responsive design

## Tech Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install frontend dependencies:

```bash
npm install
```

3. Install backend dependencies:

```bash
cd server
npm install
```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in the server directory
   - Update the MongoDB connection string and JWT secret

5. Seed the database with sample data:

```bash
cd server
npm run seed
```

### Running the Application

1. Start the backend server:

```bash
cd server
npm run dev
```

2. Start the frontend development server:

```bash
npm run dev
```

3. Access the application at `http://localhost:5173`

## Project Structure

- `/src` - Frontend React application
  - `/components` - Reusable UI components
  - `/contexts` - React context providers
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions
  - `/pages` - Application pages

- `/server` - Backend Node.js application
  - `/models` - MongoDB schemas
  - `/routes` - API routes
  - `/middleware` - Express middleware

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/tests` - Get tests by category ID

### Tests
- `GET /api/tests/:id` - Get test by ID
- `GET /api/tests/:id/questions` - Get test questions
- `POST /api/tests/:id/submit` - Submit test answers
- `GET /api/tests/:id/results` - Get test results

### Attempts
- `GET /api/attempts` - Get all attempts by user
- `GET /api/attempts/:id` - Get attempt by ID