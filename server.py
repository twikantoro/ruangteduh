#!/usr/bin/env python3
"""
Lightweight threaded HTTP server with caching and gzip-friendly headers
for Ruang Teduh (Soothing Idle).
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class RelaxRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable basic caching and security headers
        if self.path.endswith(('.js', '.css', '.png', '.jpg', '.svg', '.woff2')):
            self.send_header('Cache-Control', 'public, max-age=86400')
        elif self.path.endswith(('.html', '/')):
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        super().end_headers()

    def log_message(self, format, *args):
        # Keep logs clean and minimal
        sys.stdout.write(f"[{self.log_date_time_string()}] {self.address_string()} - {format % args}\n")
        sys.stdout.flush()

def run(host='127.0.0.1', port=8088):
    server_address = (host, port)
    httpd = ThreadingHTTPServer(server_address, RelaxRequestHandler)
    print(f"🌿 Server Ruang Teduh aktif di http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
    host = sys.argv[2] if len(sys.argv) > 2 else '127.0.0.1'
    run(host=host, port=port)
