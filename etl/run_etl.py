#!/usr/bin/env python3
"""
ETL Pipeline Runner for Enterprise Knowledge Base Management System - Phase 2
Usage:  python run_etl.py
"""
import sys
import time

from extract import extract_all
from transform import transform_all
from load import load_all


def main():
    print("=" * 60)
    print("  EKBMS Phase 2 - ETL Pipeline")
    print("=" * 60)
    start = time.time()

    error = None
    extracted = {}
    transformed = {}
    records_extracted = 0

    try:
        # EXTRACT
        print("\n--- EXTRACT STAGE ---")
        extracted = extract_all()
        records_extracted = sum(len(df) for df in extracted.values())
        print(f"[EXTRACT] Total records extracted: {records_extracted}")

        # TRANSFORM
        print("\n--- TRANSFORM STAGE ---")
        transformed = transform_all(extracted)
        records_transformed = sum(len(df) for df in transformed.values())
        print(f"[TRANSFORM] Total records transformed: {records_transformed}")

        # LOAD
        print("\n--- LOAD STAGE ---")

    except Exception as exc:
        error = exc
        print(f"\n[ERROR] Pipeline stage failed: {exc}", file=sys.stderr)

    duration = time.time() - start

    try:
        run_id, records_loaded = load_all(
            transformed=transformed,
            records_extracted=records_extracted,
            duration_seconds=duration,
            error=error,
        )
    except Exception as load_exc:
        print(f"[ERROR] Load stage failed: {load_exc}", file=sys.stderr)
        sys.exit(1)

    duration = time.time() - start
    print("\n" + "=" * 60)
    if error:
        print(f"  ETL FAILED in {duration:.2f}s - see error above.")
        sys.exit(1)
    else:
        print(f"  ETL COMPLETED SUCCESSFULLY in {duration:.2f}s")
        print(f"  Run ID: {run_id} | Records loaded: {records_loaded}")
    print("=" * 60)


if __name__ == '__main__':
    main()
