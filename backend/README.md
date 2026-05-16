# Team Task Manager API

A production-ready FastAPI backend for team task management with role-based access control (RBAC).

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **Project Management**: Create projects, manage team members
- **Task Management**: Create, assign, update, and delete tasks
- **Dashboard**: Statistics and overview of tasks
- **PostgreSQL Database**: Async database operations with SQLAlchemy ORM
- **CORS Support**: Configurable cross-origin resource sharing
- **Production Ready**: Proper error handling, validation, and security

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Relational database
- **SQLAlchemy**: SQL toolkit and ORM with async support
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Token authentication
- **Passlib**: Password hashing library
- **Python-dotenv**: Environment variable management

## Project Structure

```
backend/
│
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # Database configuration and session management
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py            # User model
│   │   ├── project.py         # Project and ProjectMember models
│   │   └── task.py            # Task model
│   ├── schemas/                # Pydantic schemas for validation
│   │   ├── user.py            # User schemas
│   │   ├── project.py         # Project schemas
│   │   ├── task.py            # Task schemas
│   │   └── dashboard.py       # Dashboard schemas
│   ├── routes/                 # API route handlers
│   │   ├── auth.py            # Authentication routes
│   │   ├── projects.py        # Project routes
│   │   ├── tasks.py           # Task routes
│   │   └── dashboard.py       # Dashboard routes
│   ├── services/               # Business logic layer
│   │   ├── user_service.py    # User business logic
│   │   ├── project_service.py # Project business logic
│   │   ├── task_service.py    # Task business logic
│   │   └── dashboard_service.py # Dashboard business logic
│   ├── startup/               # Startup utilities (admin bootstrap)
│   │   └── admin_bootstrap.py
│   ├── middleware/            # Custom middleware
│   │   └── error_handler.py   # Global error handling
│   ├── utils/                  # Utility functions
│   │   └── auth.py            # JWT and password utilities
│   ├── dependencies/           # FastAPI dependencies
│   │   ├── auth.py            # Authentication dependencies
│   │   └── project.py         # Project access control
│   └── config/                 # Configuration settings
│       └── settings.py        # Application settings
│
├── requirements.txt            # Python dependencies
├── seed.py                     # Optional dev DB seed (users, projects, tasks)
├── Procfile                    # Railway / Heroku web process (PORT + uvicorn)
├── runtime.txt                 # Python version hint for Railway / Nixpacks
├── RAILWAY.md                  # Railway deployment guide and env var list
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## Installation

### Prerequisites

- Python 3.10 or higher
- PostgreSQL 13 or higher
- pip (Python package manager)

### Setup Steps

1. **Clone the repository** (if applicable)
   ```bash
   cd Team Task Manager/backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**

   On Windows:
   ```bash
   venv\Scripts\activate
   ```

   On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**

   Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

   Edit `.env` and configure the following:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SECRET_KEY`: Generate a secure key using `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `CORS_ORIGINS`: Comma-separated list of allowed frontend URLs
   - Optional: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` together enable a one-time default admin on startup (see [Default admin (startup bootstrap)](#default-admin-startup-bootstrap))

6. **Create PostgreSQL database**

   ```sql
   CREATE DATABASE team_task_manager;
   ```

7. **Run database migrations** (optional for development)

   The application will auto-create tables on startup when `DEBUG=True`.
   For production, use Alembic for migrations.

8. **Optional: load sample data** (development)

   With tables in place and `DATABASE_URL` set in `.env`:

   ```bash
   python seed.py
   ```

   Re-run after clearing: `python seed.py --force`. See `seed.py` for seeded emails and the shared demo password printed on success.

## Default admin (startup bootstrap)

On each application startup, the server runs an **idempotent** bootstrap step controlled by environment variables:

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` | Email for the bootstrap admin (normalized to lowercase) |
| `ADMIN_PASSWORD` | Plain password; stored using the same **bcrypt** hashing as `/api/auth/signup` |
| `ADMIN_NAME` | Display name |

**Behavior**

- If **any** of the three variables is missing or empty, bootstrap is **skipped** (no error; an info log explains that variables are unset).
- If `ADMIN_PASSWORD` is shorter than **8** characters, bootstrap is **skipped** (warning log).
- If `ADMIN_EMAIL` is not a simple valid email shape, bootstrap is **skipped** (warning log).
- If a user with that email **already exists**, nothing is inserted — **no duplicate** admin row for the same email.
- If two workers race to create the same email, **IntegrityError** is caught and ignored; a single admin remains.

**Production notes**

- Supply secrets via your host environment or a secrets manager; do not bake real passwords into images or git.
- After first login, rotate the bootstrap password if your policy requires it.
- Password values are **never** written to logs.

**Example `.env` fragment**

```env
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=your-long-random-bootstrap-secret
ADMIN_NAME=Platform Admin
```

Watch application logs for either `Admin bootstrap: created default admin user` or `Admin bootstrap skipped`.

## Running the Application

### Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

On **Railway**, **Render**, or similar platforms, bind to **`$PORT`** instead of a fixed port. The included **`Procfile`** runs:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips "*"
```

Deployment steps, required variables, and CORS setup for Railway: **[RAILWAY.md](./RAILWAY.md)**.

The API will be available at:
- API: `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (requires auth)

### Users (admin only)

- `GET /api/users` - List users (`id`, `name`, `email` only). Query: `q` optional search, `limit` (1–500, default 200)

### Projects

- `POST /api/projects` - Create a project (admin only)
- `GET /api/projects` - Get all projects (admin: all, member: own)
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects/{id}/members` - Add member to project (admin only)

### Tasks

- `POST /api/tasks` - Create a task (admin only)
- `GET /api/tasks` - Get all tasks (admin: all, member: assigned)
- `PATCH /api/tasks/{id}` - Update task (admin: all, member: status only)
- `DELETE /api/tasks/{id}` - Delete task (admin only)

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

## Role-Based Access Control

### Admin Role
- Create projects
- Add project members
- Create tasks
- Assign tasks to members
- Update/delete all tasks
- View all projects and tasks

### Member Role
- View assigned projects
- View assigned tasks
- Update task status only (for assigned tasks)

## Sample Requests

### Signup

```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Create Project (Admin)

```bash
curl -X POST "http://localhost:8000/api/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Website Redesign",
    "description": "Redesign the company website"
  }'
```

### Create Task (Admin)

```bash
curl -X POST "http://localhost:8000/api/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Design homepage",
    "description": "Create mockups for homepage",
    "priority": "high",
    "project_id": 1,
    "assigned_to": 2
  }'
```

## Database Models

### User
- `id`: Primary key
- `name`: User's full name
- `email`: Unique email address
- `password_hash`: Hashed password
- `role`: User role (admin/member)
- `created_at`: Timestamp

### Project
- `id`: Primary key
- `title`: Project title
- `description`: Project description
- `created_by`: Foreign key to User
- `created_at`: Timestamp

### ProjectMember
- `id`: Primary key
- `project_id`: Foreign key to Project
- `user_id`: Foreign key to User
- `created_at`: Timestamp

### Task
- `id`: Primary key
- `title`: Task title
- `description`: Task description
- `status`: Task status (todo, in_progress, done)
- `priority`: Task priority (low, medium, high)
- `due_date`: Optional due date
- `project_id`: Foreign key to Project
- `assigned_to`: Foreign key to User (nullable)
- `created_by`: Foreign key to User
- `created_at`: Timestamp

## Security Best Practices

1. **Always use HTTPS** in production
2. **Generate a strong SECRET_KEY** for JWT tokens
3. **Use environment variables** for sensitive configuration
4. **Set DEBUG=False** in production
5. **Use a production WSGI server** like Gunicorn with Uvicorn workers
6. **Implement rate limiting** for API endpoints
7. **Use database migrations** (Alembic) in production
8. **Regularly update dependencies** for security patches

## Production Deployment

### Using Docker (Recommended)

Create a `Dockerfile`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t team-task-manager .
docker run -p 8000:8000 --env-file .env team-task-manager
```

### Using Systemd

Create a systemd service file `/etc/systemd/system/team-task-manager.service`:

```ini
[Unit]
Description=Team Task Manager API
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable team-task-manager
sudo systemctl start team-task-manager
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL format: `postgresql+asyncpg://user:password@host:port/database`
- Verify database exists and user has permissions

### JWT Token Issues

- Ensure SECRET_KEY is set in .env
- Check token expiration (default 30 minutes)
- Verify Authorization header format: `Bearer <token>`

### CORS Issues

- Add your frontend URL to CORS_ORIGINS in .env
- Ensure frontend sends proper headers

## License

This project is provided as-is for educational and commercial use.

## Support

For issues and questions, please refer to the API documentation at `/docs` endpoint.
