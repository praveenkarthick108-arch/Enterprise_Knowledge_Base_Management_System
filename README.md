# Enterprise Knowledge Base Management System

A full-stack enterprise knowledge base platform built in two phases — Phase 1 covers core knowledge management features, Phase 2 adds a Python ETL pipeline and an advanced reporting dashboard powered by real article analytics.

---

## Phase 1 — Core Knowledge Base

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

---

## Phase 2 — ETL Pipeline & Reporting Dashboard

Phase 2 extends the system with a Python-based ETL (Extract, Transform, Load) pipeline that ingests article datasets, computes engagement analytics, and feeds a rich reporting dashboard in the frontend.

### What's New in Phase 2
- **Python ETL Pipeline** using Pandas — reads CSV datasets, cleans and transforms data, loads results into PostgreSQL reporting tables
- **105-article CSV dataset** covering IT Support, HR, Finance, Security, DevOps, and Operations
- **5 new reporting tables** in PostgreSQL: `etl_run_logs`, `etl_article_analytics`, `etl_category_trends`, `etl_search_keywords`, `etl_author_activity`
- **Reporting REST API** — 8 new endpoints under `/api/reporting`
- **ETL Reports dashboard** — 6-tab reporting UI with charts, tables, and a real-time "Run ETL Now" button for admins

### ETL Workflow

```
datasets/articles.csv
        │
        ▼
┌───────────────┐     ┌─────────────────────┐     ┌──────────────────────────┐
│   EXTRACT     │────▶│     TRANSFORM        │────▶│         LOAD             │
│               │     │                     │     │                          │
│ • CSV dataset │     │ • Clean strings     │     │ • etl_article_analytics  │
│ • DB articles │     │ • Compute engagement│     │ • etl_category_trends    │
│ • Ratings     │     │   score             │     │ • etl_search_keywords    │
│ • Comments    │     │ • Aggregate by      │     │ • etl_author_activity    │
│ • Bookmarks   │     │   category/author   │     │ • etl_run_logs           │
│ • Search logs │     │ • Keyword frequency │     │                          │
└───────────────┘     └─────────────────────┘     └──────────────────────────┘
```

**Engagement Score Formula:**
```
engagement_score = (view_count × 0.4) + (avg_rating × 10 × 0.3) + (comment_count × 0.2) + (bookmark_count × 0.1)
```

### Dataset

Located in `datasets/articles.csv` — 105 knowledge articles with:

| Column | Description |
|--------|-------------|
| id | Unique article ID |
| title | Article title |
| category | Category (IT Support, HR, Finance, Security, DevOps, Operations) |
| tags | Comma-separated tags |
| view_count | Number of views |
| author_name | Author's full name |
| created_date | Creation date |
| status | Article status (published/draft) |
| word_count | Approximate word count |
| avg_rating | Average star rating (1-5) |
| comment_count | Number of comments |
| bookmark_count | Number of bookmarks |

### Phase 2 Setup

#### 1. Run the new database migration
```bash
cd backend
npx sequelize-cli db:migrate
```

#### 2. Install Python dependencies
```bash
cd etl
pip install -r requirements.txt
```

#### 3. Run the ETL pipeline
```bash
# From the etl/ directory:
python run_etl.py
```

Expected output:
```
============================================================
  EKBMS Phase 2 – ETL Pipeline
============================================================

[INFO] Connecting to PostgreSQL...
[INFO] Connection established.

--- EXTRACT STAGE ---
[EXTRACT] Reading articles from CSV dataset...
[EXTRACT] Loaded 105 articles from CSV.
...

--- TRANSFORM STAGE ---
[TRANSFORM] Building article analytics...
[TRANSFORM] Article analytics: 105 rows.
...

--- LOAD STAGE ---
[LOAD] Loading 105 rows into etl_article_analytics...
...
[LOAD] ETL run log id=1, status=success, loaded=158

============================================================
  ETL COMPLETED SUCCESSFULLY in 2.34s
============================================================
```

#### 4. Access the Reporting Dashboard
Navigate to `/reports` in the frontend (requires Admin or Reviewer role).

### Phase 2 Reporting API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reporting/summary` | Dashboard header cards summary |
| GET | `/api/reporting/etl-status` | Latest ETL run status |
| GET | `/api/reporting/top-articles` | Top articles by engagement score |
| GET | `/api/reporting/category-trends` | Category view & article counts |
| GET | `/api/reporting/search-keywords` | Top search keyword frequency |
| GET | `/api/reporting/author-activity` | Per-author productivity metrics |
| GET | `/api/reporting/etl-history` | Last 10 ETL run logs |
| POST | `/api/reporting/trigger-etl` | Trigger ETL run (Admin only) |

### Reporting Dashboard Tabs

| Tab | Content |
|-----|---------|
| Overview | Summary cards + top articles + category pie + keyword bar + author table |
| Top Articles | Full engagement table with all 20 articles ranked by score |
| Category Trends | Bar chart + pie chart + detailed category statistics table |
| Search Keywords | Horizontal bar chart + keyword frequency table |
| Author Activity | Views comparison chart + full author productivity table |
| ETL History | All ETL run logs with status, record counts, and duration |

### Phase 2 File Structure

```
├── datasets/
│   └── articles.csv              # 105-article knowledge base dataset
├── etl/
│   ├── requirements.txt          # Python dependencies (pandas, psycopg2)
│   ├── config.py                 # DB config loader
│   ├── extract.py                # Extract stage (CSV + DB)
│   ├── transform.py              # Transform stage (clean, aggregate, score)
│   ├── load.py                   # Load stage (upsert into reporting tables)
│   └── run_etl.py                # ETL orchestrator (main entry point)
├── backend/src/
│   ├── migrations/
│   │   └── 20240102000001-create-etl-tables.js   # ETL table migration
│   ├── models/
│   │   ├── EtlRunLog.js
│   │   ├── EtlArticleAnalytic.js
│   │   ├── EtlCategoryTrend.js
│   │   ├── EtlSearchKeyword.js
│   │   └── EtlAuthorActivity.js
│   ├── controllers/
│   │   └── reportingController.js
│   └── routes/
│       └── reporting.js
└── frontend/src/
    └── pages/
        └── ReportingDashboardPage.jsx
```
