import sqlite3
import os
DB_PATH = os.path.join(os.path.dirname(__file__), 'logs.db')
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute('SELECT scan_id, timestamp FROM threat_logs ORDER BY id DESC LIMIT 5')
rows = cursor.fetchall()
for r in rows:
    print(r)
