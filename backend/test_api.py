import requests
import json

def test_scan():
    url = "http://127.0.0.1:8000/scan_file"
    
    # Test 1: Safe file
    safe_payload = {
        "filename": "safe_document.pdf",
        "file_size_bytes": 1024,
        "file_type": "application/pdf"
    }
    try:
        r = requests.post(url, json=safe_payload)
        print(f"Safe Test: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Safe Test Failed: {e}")

    # Test 2: Malicious file (using keyword override)
    mal_payload = {
        "filename": "virus_installer.exe",
        "file_size_bytes": 102400,
        "file_type": "application/x-msdownload"
    }
    try:
        r = requests.post(url, json=mal_payload)
        print(f"Malicious Test: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Malicious Test Failed: {e}")

    # Test 3: Suspicious zip
    suspicious_payload = {
        "filename": "crack_setup.zip",
        "file_size_bytes": 50000,
        "file_type": "application/zip"
    }
    try:
        r = requests.post(url, json=suspicious_payload)
        print(f"Suspicious Test: {r.status_code} - {r.text}")
    except Exception as e:
        print(f"Suspicious Test Failed: {e}")

if __name__ == "__main__":
    test_scan()
