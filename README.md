Team Task Manager

A full-stack team collaboration and task management platform built with Next.js, FastAPI, PostgreSQL, and Railway/Vercel deployment.
The application allows teams to create projects, assign tasks, manage members, and track progress with secure role-based authentication.

🚀 Live Demo
Frontend

https://team-task-manager-ashy-ten.vercel.app

Backend API Docs

https://teamtaskmanager-production-1dc5.up.railway.app/docs

📌 Project Overview

Team Task Manager is a production-ready task collaboration platform where:

Admins can create projects and manage teams
Members can access assigned projects and tasks
Tasks can be assigned, updated, and tracked
Dashboard provides task/project insights
Authentication is secured using JWT tokens
APIs are fully documented with Swagger

This project was built as a full-stack assignment and deployed publicly using Railway and Vercel.

🛠 Tech Stack
Frontend
Next.js 14 (App Router)
TypeScript
Tailwind CSS
Axios
Context API
Middleware route protection
Backend
FastAPI
SQLAlchemy Async ORM
PostgreSQL
JWT Authentication
Pydantic
AsyncPG
Deployment
Frontend → Vercel
Backend → Railway
Database → Railway PostgreSQL


✨ Features
Authentication
User signup/login
JWT-based authentication
Persistent sessions
Protected routes
Role-Based Access Control
Admin
Create projects
Add members
Create/update/delete tasks
Member
View assigned projects
View/update assigned tasks
Project Management
Create projects
Add team members
View project details
Task Management
Create tasks
Assign users
Update task status
Priority levels
Due dates
Dashboard
Project statistics
Task statistics
Overdue tracking
Status overview
UI/UX
Responsive layout
Mobile-friendly task cards
Toast notifications
Loading states
Accessible modals/forms
🏗 Architecture
Frontend Architecture
frontend/
├── app/
├── components/
├── context/
├── hooks/
├── lib/
├── services/
├── types/
└── middleware.ts
Design Decisions
Service layer for API abstraction
Context API for auth/session state
Middleware for route protection
Shared Axios instance with interceptors
Reusable UI components
Backend Architecture
backend/
├── app/
│   ├── config/
│   ├── dependencies/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   └── startup/
├── seed.py
└── requirements.txt
Design Decisions
Layered architecture
Service-based business logic
Dependency injection
Async database operations
Modular route structure


🔐 Authentication Flow
Client → Login API
       → JWT Generated
       → Stored in localStorage
       → Sent via Authorization Header
       → Backend validates token
       → Protected routes accessible

       
🗄 Database Schema
Users
id
name
email
password_hash
role
Projects
id
title
description
created_by
Tasks
id
title
description
status
priority
due_date
assigned_to
project_id
Project Members
project_id
user_id


📡 API Architecture
Auth Routes
/api/auth/signup
/api/auth/login
/api/auth/me
Project Routes
/api/projects
/api/projects/{id}
/api/projects/{id}/members
Task Routes
/api/tasks
/api/tasks/{id}
Dashboard Routes
/api/dashboard/stats


⚙️ Local Setup
Clone Repository
git clone <repo-url>
cd team-task-manager
Backend Setup
Create Virtual Environment
python -m venv venv
Activate Environment
Windows
venv\Scripts\activate
Linux/Mac
source venv/bin/activate
Install Dependencies
pip install -r requirements.txt
Run Backend
uvicorn app.main:app --reload

Backend runs on:

http://localhost:8000
Frontend Setup
Install Dependencies
npm install
Run Frontend
npm run dev

Frontend runs on:

http://localhost:3000

🔑 Environment Variables
Backend .env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/db
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

CORS_ORIGINS=http://localhost:3000

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=System Administrator
Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
🚀 Deployment
Backend Deployment
Platform: Railway
Database: Railway PostgreSQL
Frontend Deployment
Platform: Vercel
⚠️ Tradeoffs & Decisions
JWT Storage

JWT is stored in localStorage for simplicity and frontend-only auth handling.

Tradeoff
Easier frontend integration
Slightly less secure than HTTP-only cookies

A production-scale improvement would be:

HTTP-only cookie auth
Backend-for-Frontend proxy layer
Context API Instead of Redux

Context was chosen to keep the architecture lightweight.

Tradeoff
Simpler setup
Less boilerplate
Suitable for assignment scale
Async SQLAlchemy

Used async database operations for scalability and modern backend practices.

Tradeoff
Better concurrency
More complex ORM behavior/debugging
🧪 Testing
Verified Features
Authentication flow
Role-based access
CRUD operations
Dashboard stats
Protected routes
Production deployment
📸 Screenshots

Add screenshots here:

- Login Page
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/52efd993-9a22-4bb4-b4fb-c98500b7198d" />

- Dashboard

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0aa9daef-a53d-406c-b008-d1e1c8b4e6f8" />

- Projects Page

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ab01d907-a975-4897-96a4-e1c94d9e0ab8" />

- Tasks Page

  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4435b01e-a88f-444d-8088-85b5003cb802" />

- Swagger Docs

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/77c95fa8-293e-4c7f-9058-290d3cd02d6c" />


👨‍💻 Author

Manish Giri
Full-Stack Developer
Built using Next.js, FastAPI, PostgreSQL, Railway, and Vercel.
