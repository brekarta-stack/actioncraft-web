#!/usr/bin/env python3
"""테스트용 목 Slack 웹훅 서버.

사용: mock_webhook.py <port_file> <body_log> <mode>
  mode = ok   : 200 "ok" 응답
  mode = fail : 500 응답 (Slack 장애 시뮬레이션)
포트는 OS가 고른 뒤 port_file에 기록된다.
수신한 모든 POST body는 body_log에 '\n===\n' 구분자로 누적된다.
"""
import http.server
import socketserver
import sys

port_file, body_log, mode = sys.argv[1], sys.argv[2], sys.argv[3]


class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(n)
        with open(body_log, "ab") as f:
            f.write(body + b"\n===\n")
        self.send_response(500 if mode == "fail" else 200)
        self.end_headers()
        self.wfile.write(b"ok")

    def log_message(self, *args):
        pass


with socketserver.TCPServer(("127.0.0.1", 0), Handler) as srv:
    with open(port_file, "w") as f:
        f.write(str(srv.server_address[1]))
    srv.serve_forever()
