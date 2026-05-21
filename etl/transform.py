import pandas as pd
import numpy as np
from datetime import date


def _clean_string(s):
    """Strip whitespace and title-case a string."""
    if pd.isna(s):
        return 'Uncategorized'
    return str(s).strip()


def transform_article_analytics(extracted):
    """
    Build the etl_article_analytics table by merging CSV data with live DB
    engagement metrics. Falls back gracefully when DB tables are empty.
    """
    print("[TRANSFORM] Building article analytics...")

    csv_df = extracted['csv_articles'].copy()
    db_df  = extracted['db_articles'].copy()

    # ---------- normalise CSV ----------
    csv_df['title']         = csv_df['title'].apply(_clean_string)
    csv_df['category']      = csv_df['category'].apply(_clean_string)
    csv_df['view_count']    = pd.to_numeric(csv_df['view_count'],    errors='coerce').fillna(0).astype(int)
    csv_df['avg_rating']    = pd.to_numeric(csv_df['avg_rating'],    errors='coerce').fillna(0.0)
    csv_df['comment_count'] = pd.to_numeric(csv_df['comment_count'], errors='coerce').fillna(0).astype(int)
    csv_df['bookmark_count']= pd.to_numeric(csv_df['bookmark_count'],errors='coerce').fillna(0).astype(int)
    csv_df['word_count']    = pd.to_numeric(csv_df['word_count'],    errors='coerce').fillna(0).astype(int)

    # ---------- merge live DB engagement if available ----------
    if not db_df.empty:
        ratings   = extracted['db_ratings'].copy()
        comments  = extracted['db_comments'].copy()
        bookmarks = extracted['db_bookmarks'].copy()

        db_merged = db_df.copy()
        db_merged.rename(columns={'id': 'db_id'}, inplace=True)

        if not ratings.empty:
            db_merged = db_merged.merge(ratings,   left_on='db_id', right_on='article_id', how='left')
        if not comments.empty:
            db_merged = db_merged.merge(comments,  left_on='db_id', right_on='article_id', how='left')
        if not bookmarks.empty:
            db_merged = db_merged.merge(bookmarks, left_on='db_id', right_on='article_id', how='left')

        db_merged['avg_rating']    = db_merged.get('avg_rating',    pd.Series(dtype=float)).fillna(0.0)
        db_merged['comment_count'] = db_merged.get('comment_count', pd.Series(dtype=int)).fillna(0).astype(int)
        db_merged['bookmark_count']= db_merged.get('bookmark_count',pd.Series(dtype=int)).fillna(0).astype(int)
        db_merged['view_count']    = pd.to_numeric(db_merged.get('view_count', 0), errors='coerce').fillna(0).astype(int)
        db_merged['category_name'] = db_merged.get('category_name', 'Uncategorized').apply(_clean_string)

        result_df = db_merged[['title','category_name','view_count','avg_rating','comment_count','bookmark_count']].copy()
        result_df.rename(columns={'category_name': 'category'}, inplace=True)

        # append CSV rows for titles not already in DB
        db_titles = set(result_df['title'].str.lower())
        extra_csv = csv_df[~csv_df['title'].str.lower().isin(db_titles)][
            ['title','category','view_count','avg_rating','comment_count','bookmark_count']
        ]
        result_df = pd.concat([result_df, extra_csv], ignore_index=True)
    else:
        result_df = csv_df[['title','category','view_count','avg_rating','comment_count','bookmark_count']].copy()

    # ---------- engagement score ----------
    result_df['engagement_score'] = (
        result_df['view_count']    * 0.4 +
        result_df['avg_rating']    * 10 * 0.3 +
        result_df['comment_count'] * 0.2 +
        result_df['bookmark_count']* 0.1
    ).round(2)

    result_df['report_date'] = date.today().isoformat()
    print(f"[TRANSFORM] Article analytics: {len(result_df)} rows.")
    return result_df


def transform_category_trends(article_analytics_df):
    """Aggregate article analytics by category."""
    print("[TRANSFORM] Building category trends...")
    grp = article_analytics_df.groupby('category').agg(
        article_count   = ('title',          'count'),
        total_views     = ('view_count',      'sum'),
        avg_views       = ('view_count',      'mean'),
        avg_rating      = ('avg_rating',      'mean'),
        total_comments  = ('comment_count',   'sum'),
        total_bookmarks = ('bookmark_count',  'sum'),
    ).reset_index()
    grp.rename(columns={'category': 'category_name'}, inplace=True)
    grp['avg_views']  = grp['avg_views'].round(2)
    grp['avg_rating'] = grp['avg_rating'].round(2)
    grp['period_date'] = date.today().isoformat()
    print(f"[TRANSFORM] Category trends: {len(grp)} rows.")
    return grp


def transform_search_keywords(extracted):
    """
    Produce a clean search keyword table from DB logs.
    If DB logs are empty, synthesise common keywords from the article titles.
    """
    print("[TRANSFORM] Building search keywords...")
    logs = extracted['search_logs'].copy()

    if logs.empty:
        # synthesise keywords from CSV article titles
        csv_df = extracted['csv_articles']
        words = (
            csv_df['title']
            .str.lower()
            .str.replace(r'[^a-z\s]', '', regex=True)
            .str.split()
            .explode()
        )
        stopwords = {'to','the','a','an','and','or','for','how','with','in','of','on','at','by','from'}
        words = words[~words.isin(stopwords) & (words.str.len() > 3)]
        freq = words.value_counts().reset_index()
        freq.columns = ['keyword', 'search_count']
        logs = freq.head(50)

    logs['period_date'] = date.today().isoformat()
    print(f"[TRANSFORM] Search keywords: {len(logs)} rows.")
    return logs


def transform_author_activity(article_analytics_df, csv_df):
    """Aggregate per-author statistics."""
    print("[TRANSFORM] Building author activity...")
    grp = csv_df.groupby('author_name').agg(
        total_articles    = ('id',          'count'),
        published_articles= ('status',      lambda x: (x == 'published').sum()),
        draft_articles    = ('status',      lambda x: (x == 'draft').sum()),
        total_views       = ('view_count',  'sum'),
        avg_rating        = ('avg_rating',  'mean'),
        total_comments    = ('comment_count','sum'),
        total_bookmarks   = ('bookmark_count','sum'),
    ).reset_index()
    grp['avg_rating']   = grp['avg_rating'].round(2)
    grp['period_date']  = date.today().isoformat()
    print(f"[TRANSFORM] Author activity: {len(grp)} rows.")
    return grp


def transform_all(extracted):
    """Run all transform steps."""
    article_analytics = transform_article_analytics(extracted)
    return {
        'article_analytics': article_analytics,
        'category_trends':   transform_category_trends(article_analytics),
        'search_keywords':   transform_search_keywords(extracted),
        'author_activity':   transform_author_activity(article_analytics, extracted['csv_articles']),
    }
