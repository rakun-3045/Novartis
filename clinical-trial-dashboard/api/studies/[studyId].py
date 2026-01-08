from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse the study ID from the path
            path = self.path
            study_id = path.split('/')[-1].split('?')[0]
            study_id = urllib.parse.unquote(study_id)
            
            # Load dashboard data
            data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'data', 'dashboard_api.json')
            
            with open(data_path, 'r', encoding='utf-8') as f:
                dashboard_data = json.load(f)
            
            # Find the specific study
            study = None
            for s in dashboard_data.get('studies', []):
                if s.get('study_id') == study_id:
                    study = s
                    break
            
            if not study:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Study {study_id} not found"}).encode())
                return
            
            # Generate detailed study data
            study_detail = {
                "study_id": study.get('study_id'),
                "total_subjects": study.get('total_subjects', 0),
                "total_issues": study.get('total_issues', 0),
                "risk_distribution": study.get('risk_distribution', {
                    "Low": 0,
                    "Medium": 0,
                    "High": 0,
                    "Critical": 0
                }),
                "status_distribution": study.get('status_distribution', {}),
                "top_sites": study.get('top_sites', []),
                "metrics": {
                    "avg_issues_per_subject": round(study.get('total_issues', 0) / max(study.get('total_subjects', 1), 1), 2),
                    "critical_subjects": study.get('risk_distribution', {}).get('Critical', 0),
                    "high_risk_subjects": study.get('risk_distribution', {}).get('High', 0),
                    "pending_items": study.get('pending_items_count', 0)
                },
                "recommendations": [
                    f"Focus on {study.get('risk_distribution', {}).get('Critical', 0)} critical risk subjects",
                    f"Review {study.get('total_issues', 0)} open issues",
                    "Conduct weekly data quality reviews"
                ]
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(study_detail).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
