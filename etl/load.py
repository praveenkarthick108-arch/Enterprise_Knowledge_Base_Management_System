from sqlalchemy import create_engine, text
from datetime import datetime
from config import DB_CONFIG


def _engine():
    cfg = DB_CONFIG
    url = f"postgresql+psycopg2://{cfg['user']}:{cfg['password']}@{cfg['host']}:{cfg['port']}/{cfg['dbname']}"
    return create_engine(url)


def _truncate(conn, table):
    conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))


def load_article_analytics(conn, df, run_id):
    print(f"[LOAD] Loading {len(df)} rows into etl_article_analytics...")
    _truncate(conn, 'etl_article_analytics')
    rows = [
        {
            'article_title':   row['title'],
            'category_name':   row['category'],
            'view_count':      int(row['view_count']),
            'avg_rating':      float(row['avg_rating']),
            'comment_count':   int(row['comment_count']),
            'bookmark_count':  int(row['bookmark_count']),
            'engagement_score':float(row['engagement_score']),
            'report_date':     row['report_date'],
            'etl_run_id':      run_id,
        }
        for _, row in df.iterrows()
    ]
    conn.execute(text("""
        INSERT INTO etl_article_analytics
            (article_title, category_name, view_count, avg_rating,
             comment_count, bookmark_count, engagement_score, report_date, etl_run_id,
             created_at, updated_at)
        VALUES
            (:article_title, :category_name, :view_count, :avg_rating,
             :comment_count, :bookmark_count, :engagement_score, :report_date, :etl_run_id,
             NOW(), NOW())
    """), rows)
    print(f"[LOAD] etl_article_analytics: {len(rows)} rows inserted.")
    return len(rows)


def load_category_trends(conn, df, run_id):
    print(f"[LOAD] Loading {len(df)} rows into etl_category_trends...")
    _truncate(conn, 'etl_category_trends')
    rows = [
        {
            'category_name':        row['category_name'],
            'article_count':        int(row['article_count']),
            'total_views':          int(row['total_views']),
            'avg_views_per_article':float(row['avg_views']),
            'avg_rating':           float(row['avg_rating']),
            'total_comments':       int(row['total_comments']),
            'total_bookmarks':      int(row['total_bookmarks']),
            'period_date':          row['period_date'],
            'etl_run_id':           run_id,
        }
        for _, row in df.iterrows()
    ]
    conn.execute(text("""
        INSERT INTO etl_category_trends
            (category_name, article_count, total_views, avg_views_per_article,
             avg_rating, total_comments, total_bookmarks, period_date, etl_run_id,
             created_at, updated_at)
        VALUES
            (:category_name, :article_count, :total_views, :avg_views_per_article,
             :avg_rating, :total_comments, :total_bookmarks, :period_date, :etl_run_id,
             NOW(), NOW())
    """), rows)
    print(f"[LOAD] etl_category_trends: {len(rows)} rows inserted.")
    return len(rows)


def load_search_keywords(conn, df, run_id):
    print(f"[LOAD] Loading {len(df)} rows into etl_search_keywords...")
    _truncate(conn, 'etl_search_keywords')
    rows = [
        {
            'keyword':      str(row['keyword']),
            'search_count': int(row['search_count']),
            'period_date':  row['period_date'],
            'etl_run_id':   run_id,
        }
        for _, row in df.iterrows()
    ]
    conn.execute(text("""
        INSERT INTO etl_search_keywords
            (keyword, search_count, period_date, etl_run_id, created_at, updated_at)
        VALUES (:keyword, :search_count, :period_date, :etl_run_id, NOW(), NOW())
    """), rows)
    print(f"[LOAD] etl_search_keywords: {len(rows)} rows inserted.")
    return len(rows)


def load_author_activity(conn, df, run_id):
    print(f"[LOAD] Loading {len(df)} rows into etl_author_activity...")
    _truncate(conn, 'etl_author_activity')
    rows = [
        {
            'author_name':         row['author_name'],
            'total_articles':      int(row['total_articles']),
            'published_articles':  int(row['published_articles']),
            'draft_articles':      int(row['draft_articles']),
            'total_views':         int(row['total_views']),
            'avg_rating':          float(row['avg_rating']),
            'total_comments':      int(row['total_comments']),
            'total_bookmarks':     int(row['total_bookmarks']),
            'period_date':         row['period_date'],
            'etl_run_id':          run_id,
        }
        for _, row in df.iterrows()
    ]
    conn.execute(text("""
        INSERT INTO etl_author_activity
            (author_name, total_articles, published_articles, draft_articles,
             total_views, avg_rating, total_comments, total_bookmarks,
             period_date, etl_run_id, created_at, updated_at)
        VALUES
            (:author_name, :total_articles, :published_articles, :draft_articles,
             :total_views, :avg_rating, :total_comments, :total_bookmarks,
             :period_date, :etl_run_id, NOW(), NOW())
    """), rows)
    print(f"[LOAD] etl_author_activity: {len(rows)} rows inserted.")
    return len(rows)


def create_run_log(conn, status, records_extracted, records_transformed,
                   records_loaded, duration_seconds, error_message=None):
    result = conn.execute(text("""
        INSERT INTO etl_run_logs
            (status, records_extracted, records_transformed,
             records_loaded, duration_seconds, error_message,
             created_at, updated_at)
        VALUES (:status, :re, :rt, :rl, :dur, :err, NOW(), NOW())
        RETURNING id
    """), {
        'status': status,
        're': records_extracted,
        'rt': records_transformed,
        'rl': records_loaded,
        'dur': round(duration_seconds, 2),
        'err': str(error_message) if error_message else None,
    })
    return result.fetchone()[0]


def load_all(transformed, records_extracted, duration_seconds, error=None):
    """Load all transformed DataFrames and write a run log."""
    engine = _engine()
    records_loaded = 0

    with engine.begin() as conn:
        run_id = create_run_log(
            conn,
            status='failed' if error else 'running',
            records_extracted=records_extracted,
            records_transformed=sum(len(df) for df in transformed.values()) if transformed else 0,
            records_loaded=0,
            duration_seconds=duration_seconds,
            error_message=str(error) if error else None,
        )

        if not error and transformed:
            records_loaded += load_article_analytics(conn, transformed['article_analytics'], run_id)
            records_loaded += load_category_trends(conn,   transformed['category_trends'],   run_id)
            records_loaded += load_search_keywords(conn,   transformed['search_keywords'],   run_id)
            records_loaded += load_author_activity(conn,   transformed['author_activity'],   run_id)

            conn.execute(text("""
                UPDATE etl_run_logs
                SET status = 'success',
                    records_loaded = :rl,
                    duration_seconds = :dur,
                    updated_at = NOW()
                WHERE id = :id
            """), {'rl': records_loaded, 'dur': round(duration_seconds, 2), 'id': run_id})

    print(f"[LOAD] ETL run log id={run_id}, status={'success' if not error else 'failed'}, loaded={records_loaded}")
    return run_id, records_loaded
