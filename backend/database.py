import sqlite3
import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'logs.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
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
    conn.commit()
    conn.close()

def insert_log(scan_id, scan_type, target_payload, prediction, confidence):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Format: 10:42 AM
    timestamp = datetime.datetime.now().strftime("%I:%M %p")
    cursor.execute('''
        INSERT INTO threat_logs (scan_id, timestamp, scan_type, target_payload, prediction, confidence)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (scan_id, timestamp, scan_type, target_payload, prediction, confidence))
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
            "confidence": row["confidence"]
        })
    return logs

def delete_log(scan_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM threat_logs WHERE scan_id = ?', (scan_id,))
    conn.commit()
    conn.close()
