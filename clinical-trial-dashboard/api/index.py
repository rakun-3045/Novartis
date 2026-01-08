from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "name": "ClinicalAI API",
            "version": "1.0.0",
            "status": "healthy",
            "endpoints": [
                "/api/dashboard",
                "/api/studies",
                "/api/studies/:studyId",
                "/api/sites",
                "/api/subjects",
                "/api/ml-results",
                "/api/chat",
                "/api/chat/stream"
            ]
        }
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
