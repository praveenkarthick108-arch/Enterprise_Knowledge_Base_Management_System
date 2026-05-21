# Enterprise Knowledge Base Management System

A full-stack enterprise knowledge base platform with role-based access, approval workflows, rich text editing, full-text search, and analytics.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + TipTap + React Query + Zustand
- **Backend**: Node.js + Express + Sequelize ORM
- **Database**: PostgreSQL
- **Auth**: JWT (access + refresh tokens)

## Prerequisites
- Node.js 18+
- PostgreSQL 14+ (running on localhost:5432)

## Setup

### 1. Create PostgreSQL Database
```sql
-- In psql or pgAdmin:
CREATE DATABASE enterprise_kb;
```

### 2. Configure Backend
Edit `backend/.env` if your PostgreSQL credentials differ:
```
DB_USER=postgres
DB_PASSWORD=postgres  # ← change this
DB_NAME=enterprise_kb
```

### 3. Install & Migrate
```bash
# Backend
cd backend
npm install
npm run db:migrate
npm run db:seed

# Frontend
cd ../frontend
npm install
```

### 4. Start
```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Open: http://localhost:3000

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | Admin@123 |
| Author | author@company.com | Author@123 |
| Reviewer | reviewer@company.com | Review@123 |
| Employee | employee@company.com | Employee@123 |

## Features
- **Authentication**: JWT login/register/forgot-password with role-based access
- **Articles**: Create/edit with TipTap rich text editor, draft → review → publish workflow
- **Categories**: Hierarchical category management
- **Tags**: Color-coded tags for article discovery
- **Approval Workflow**: Submit → Reviewer approves/rejects with comments
- **Search**: PostgreSQL full-text search with filters and suggestions
- **Comments**: Threaded comments on articles
- **Ratings**: 1-5 star article ratings
- **Bookmarks**: Save articles for later
- **File Attachments**: Upload PDF, DOC, PPT, XLS, PNG, JPG
- **Analytics**: Dashboard with charts, popular articles, search trends
- **User Management**: Admin user/role management
- **Version History**: Tracks article edit history

## API
Backend API: http://localhost:5000/api
Health check: http://localhost:5000/api/health
