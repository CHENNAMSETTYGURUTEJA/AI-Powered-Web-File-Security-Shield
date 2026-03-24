import sqlite3
import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'logs.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Initial table creation
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS threat_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            scan_type TEXT NOT NULL,
            target_payload TEXT NOT NULL,
            prediction TEXT NOT NULL,
            confidence TEXT NOT NULL
        )
    ''')

    # Heartbeat table for extension status
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS extension_heartbeats (
            client_id TEXT PRIMARY KEY,
            last_ping TEXT NOT NULL
        )
    ''')
    
    # Check if 'source' column exists, if not add it (simple migration)
    cursor.execute("PRAGMA table_info(threat_logs)")
    columns = [column[1] for column in cursor.fetchall()]
    if 'source' not in columns:
        print("[DB] Migrating database: adding 'source' column")
        cursor.execute("ALTER TABLE threat_logs ADD COLUMN source TEXT DEFAULT 'unknown'")
    
    conn.commit()
    conn.close()

def insert_log(scan_id, scan_type, target_payload, prediction, confidence, source="unknown"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Store as UTC ISO 8601 string
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cursor.execute('''
        INSERT INTO threat_logs (scan_id, timestamp, scan_type, target_payload, prediction, confidence, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (scan_id, timestamp, scan_type, target_payload, prediction, confidence, source))
    conn.commit()
    conn.close()

def get_logs():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM threat_logs ORDER BY id DESC LIMIT 100')
    rows = cursor.fetchall()
    conn.close()
    
    logs = []
    for row in rows:
        logs.append({
            "id": row["scan_id"],
            "time": row["timestamp"],
            "type": row["scan_type"],
            "target": row["target_payload"],
            "result": row["prediction"],
            "confidence": row["confidence"],
            "source": row["source"] if "source" in row.keys() else "unknown"
        })
    return logs

def delete_log(scan_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM threat_logs WHERE scan_id = ?', (scan_id,))
    conn.commit()
    conn.close()

def update_heartbeat(client_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cursor.execute('''
        INSERT INTO extension_heartbeats (client_id, last_ping)
        VALUES (?, ?)
        ON CONFLICT(client_id) DO UPDATE SET last_ping = excluded.last_ping
    ''', (client_id, timestamp))
    conn.commit()
    conn.close()

def get_heartbeat(client_id=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    if client_id:
        cursor.execute('SELECT last_ping FROM extension_heartbeats WHERE client_id = ?', (client_id,))
        result = cursor.fetchone()
        conn.close()
        return result[0] if result else None
    else:
        # Get the most recent heartbeat from any client
        cursor.execute('SELECT client_id, last_ping FROM extension_heartbeats ORDER BY last_ping DESC LIMIT 1')
        result = cursor.fetchone()
        conn.close()
        return result if result else (None, None)

