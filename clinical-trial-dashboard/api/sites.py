from http.server import BaseHTTPRequestHandler
import json
import os
import csv

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Generate sites data from study summaries
            data_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'dashboard_api.json')
            
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Create sites from studies data
            sites = []
            for study in data.get('studies', []):
                # Generate sample sites for each study
                study_id = study.get('study_id', 'Unknown')
                total_subjects = study.get('total_subjects', 0)
                total_issues = study.get('total_issues', 0)
                
                # Create representative sites for the study
                num_sites = max(1, total_subjects // 50)  # Estimate ~50 subjects per site
                for i in range(min(num_sites, 10)):  # Cap at 10 sites per study for demo
                    sites.append({
                        "id": f"{study_id}_Site_{i+1}",
                        "study": study_id,
                        "site": f"Site {i+1}",
                        "total_subjects": total_subjects // num_sites if num_sites > 0 else 0,
                        "total_issues": total_issues // num_sites if num_sites > 0 else 0
                    })
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"sites": sites}).encode())
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
