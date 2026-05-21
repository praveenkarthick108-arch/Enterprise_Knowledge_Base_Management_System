import os
from dotenv import load_dotenv

# Load .env from backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

DB_CONFIG = {
    'host':     os.getenv('DB_HOST', 'localhost'),
    'port':     int(os.getenv('DB_PORT', 5432)),
    'dbname':   os.getenv('DB_NAME', 'enterprise_kb'),
    'user':     os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
}

DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', 'datasets')
ARTICLES_CSV = os.path.join(DATASET_DIR, 'articles.csv')
