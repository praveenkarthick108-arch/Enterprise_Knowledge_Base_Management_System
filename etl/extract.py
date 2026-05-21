import pandas as pd
from sqlalchemy import create_engine, text
from config import DB_CONFIG, ARTICLES_CSV


def _engine(cfg):
    url = f"postgresql+psycopg2://{cfg['user']}:{cfg['password']}@{cfg['host']}:{cfg['port']}/{cfg['dbname']}"
    return create_engine(url)


def extract_csv_articles():
    """Extract article metadata from the CSV dataset."""
    print("[EXTRACT] Reading articles from CSV dataset...")
    df = pd.read_csv(ARTICLES_CSV)
    print(f"[EXTRACT] Loaded {len(df)} articles from CSV.")
    return df


def extract_db_articles(engine):
    """Extract live article data from the PostgreSQL articles table."""
    print("[EXTRACT] Fetching live articles from database...")
    query = text("""
        SELECT
            a.id,
            a.title,
            a.status,
            a.view_count,
            a.created_at,
            u.name  AS author_name,
            c.name  AS category_name
        FROM articles a
        LEFT JOIN users u ON a.author_id = u.id
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.is_deleted = FALSE
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn)
    print(f"[EXTRACT] Fetched {len(df)} live articles from DB.")
    return df


def extract_db_ratings(engine):
    """Extract ratings data (column is 'score')."""
    print("[EXTRACT] Fetching ratings from database...")
    query = text("""
        SELECT article_id, AVG(score) AS avg_rating, COUNT(*) AS rating_count
        FROM ratings
        GROUP BY article_id
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn)
    print(f"[EXTRACT] Fetched ratings for {len(df)} articles.")
    return df


def extract_db_comments(engine):
    """Extract comment counts per article."""
    print("[EXTRACT] Fetching comment counts from database...")
    query = text("""
        SELECT article_id, COUNT(*) AS comment_count
        FROM comments
        WHERE is_deleted = FALSE
        GROUP BY article_id
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn)
    print(f"[EXTRACT] Fetched comment counts for {len(df)} articles.")
    return df


def extract_db_bookmarks(engine):
    """Extract bookmark counts per article."""
    print("[EXTRACT] Fetching bookmark counts from database...")
    query = text("""
        SELECT article_id, COUNT(*) AS bookmark_count
        FROM bookmarks
        GROUP BY article_id
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn)
    print(f"[EXTRACT] Fetched bookmark counts for {len(df)} articles.")
    return df


def extract_db_search_logs(engine):
    """Extract search keyword frequencies."""
    print("[EXTRACT] Fetching search logs from database...")
    query = text("""
        SELECT
            LOWER(TRIM(query)) AS keyword,
            COUNT(*) AS search_count
        FROM search_logs
        GROUP BY LOWER(TRIM(query))
        ORDER BY search_count DESC
        LIMIT 100
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn)
    print(f"[EXTRACT] Fetched {len(df)} search keywords.")
    return df


def extract_all(cfg=None):
    """Run all extract steps and return a dict of DataFrames."""
    engine = _engine(DB_CONFIG)
    return {
        'csv_articles':  extract_csv_articles(),
        'db_articles':   extract_db_articles(engine),
        'db_ratings':    extract_db_ratings(engine),
        'db_comments':   extract_db_comments(engine),
        'db_bookmarks':  extract_db_bookmarks(engine),
        'search_logs':   extract_db_search_logs(engine),
    }
