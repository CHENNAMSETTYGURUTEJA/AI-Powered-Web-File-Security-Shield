import os
import sys

sys.path.append(os.path.dirname(__file__))

from database import init_db, insert_log

init_db()
insert_log("DUMMY-8888", "URL", "http://test-validation.com", "MALICIOUS", "99%")
print("Inserted dummy log successfully")
