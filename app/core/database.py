import os
from pathlib import Path

import psycopg


def _load_local_env():
    env_path = Path(".env")
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_local_env()


def _build_conninfo():
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        return database_url

    password = os.getenv("PGPASSWORD", "").strip()
    if not password:
        return None

    host = os.getenv("PGHOST", "localhost")
    port = os.getenv("PGPORT", "5432")
    user = os.getenv("PGUSER", "postgres")
    database = os.getenv("PGDATABASE", "face_ai")
    return f"postgresql://{user}:{password}@{host}:{port}/{database}"


class EnrollmentMetadataStore:
    def __init__(self, conninfo=None):
        self.conninfo = conninfo or _build_conninfo()
        self.enabled = bool(self.conninfo)
        self.error = ""

        if self.enabled:
            try:
                self.ensure_schema()
            except Exception as exc:
                self.enabled = False
                self.error = str(exc)

    def _connect(self):
        return psycopg.connect(self.conninfo, autocommit=True)

    def ensure_schema(self):
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS people (
                        id BIGSERIAL PRIMARY KEY,
                        name TEXT NOT NULL UNIQUE,
                        total_embeddings INTEGER NOT NULL DEFAULT 0,
                        total_enrollments INTEGER NOT NULL DEFAULT 0,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        last_enrolled_at TIMESTAMPTZ
                    )
                    """
                )
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS enrollment_sessions (
                        id BIGSERIAL PRIMARY KEY,
                        person_id BIGINT NOT NULL REFERENCES people(id) ON DELETE CASCADE,
                        capture_count INTEGER NOT NULL,
                        embedding_count INTEGER NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                    """
                )

    def record_enrollment(self, name, capture_count, embedding_count):
        if not self.enabled:
            return False, self.error or "DATABASE_URL is not configured"

        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO people (name, total_embeddings, total_enrollments, last_enrolled_at, updated_at)
                    VALUES (%s, %s, 1, NOW(), NOW())
                    ON CONFLICT (name) DO UPDATE
                    SET total_embeddings = people.total_embeddings + EXCLUDED.total_embeddings,
                        total_enrollments = people.total_enrollments + 1,
                        last_enrolled_at = NOW(),
                        updated_at = NOW()
                    RETURNING id
                    """,
                    (name, embedding_count),
                )
                person_id = cur.fetchone()[0]
                cur.execute(
                    """
                    INSERT INTO enrollment_sessions (person_id, capture_count, embedding_count)
                    VALUES (%s, %s, %s)
                    """,
                    (person_id, capture_count, embedding_count),
                )

        return True, ""
