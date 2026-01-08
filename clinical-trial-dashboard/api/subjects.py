from http.server import BaseHTTPRequestHandler
import json
import os
import csv
import random

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Read subjects from CSV file
            csv_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'all_studies_subjects.csv')
            
            subjects = []
            status_dist = {}
            risk_dist = {}
            study_dist = {}
            total_count = 0
            
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                all_rows = list(reader)
                total_count = len(all_rows)
                
                # Sample 1000 subjects for performance
                if len(all_rows) > 1000:
                    sampled = random.sample(all_rows, 1000)
                else:
                    sampled = all_rows
                
                for row in sampled:
                    # Handle NaN values
                    subject = {
                        'Subject': row.get('Subject', 'Unknown'),
                        'Study': row.get('Study', 'Unknown'),
                        'Country': row.get('Country', '') or 'Unknown',
                        'Site': row.get('Site', '') or 'Unknown',
                        'Region': row.get('Region', '') or 'Unknown',
                        'LatestVisit': row.get('LatestVisit', '') or 'Unknown',
                        'SubjectStatus': row.get('SubjectStatus', '') or 'Unknown',
                        'risk_category': row.get('risk_category', 'Low') or 'Low',
                        'total_issues': int(float(row.get('total_issues', 0) or 0)),
                        'predicted_risk': row.get('predicted_risk', 'Low') or 'Low',
                        'risk_probability': float(row.get('risk_probability', 0) or 0),
                        'open_issues_count': int(float(row.get('open_issues_count', 0) or 0)),
                        'safety_discrepancy_count': int(float(row.get('safety_discrepancy_count', 0) or 0)),
                    }
                    subjects.append(subject)
                    
                    # Build distributions
                    status = subject['SubjectStatus']
                    if status and status != 'Unknown':
                        status_dist[status] = status_dist.get(status, 0) + 1
                    
                    risk = subject['risk_category']
                    if risk:
                        risk_dist[risk] = risk_dist.get(risk, 0) + 1
                    
                    study = subject['Study']
                    if study:
                        study_dist[study] = study_dist.get(study, 0) + 1
            
            response = {
                "subjects": subjects,
                "total_count": total_count,
                "sample_count": len(subjects),
                "status_distribution": status_dist,
                "risk_distribution": risk_dist,
                "study_distribution": study_dist
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
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
