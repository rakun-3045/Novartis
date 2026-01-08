from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            request_data = json.loads(body) if body else {}
            
            question = request_data.get('question', '')
            
            # Load dashboard data for context-aware responses
            data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'data', 'dashboard_api.json')
            
            with open(data_path, 'r', encoding='utf-8') as f:
                dashboard_data = json.load(f)
            
            # Generate a helpful response based on available data
            kpis = dashboard_data.get('global_kpis', {})
            studies = dashboard_data.get('studies', [])
            
            # Simple keyword-based response generation
            question_lower = question.lower()
            
            if 'critical' in question_lower or 'risk' in question_lower:
                response = f"""## Risk Analysis Summary

Based on the clinical trial data:

### Current Risk Distribution
- **Total Subjects**: {kpis.get('total_subjects', 0):,}
- **Critical Risk**: {kpis.get('critical_risk_count', 0):,} subjects
- **High Risk**: {kpis.get('high_risk_count', 0):,} subjects
- **Pending Items**: {kpis.get('pending_items_count', 0):,} subjects ({kpis.get('pending_items_pct', 0):.1f}%)

### Key Findings
- Average issues per subject: {kpis.get('avg_issues_per_subject', 0):.2f}
- Total issues identified: {kpis.get('total_issues', 0):,}
- Safety discrepancies: {kpis.get('safety_discrepancies', 0):,}

### Recommended Actions
1. Prioritize review of {kpis.get('critical_risk_count', 0)} critical risk subjects
2. Address {kpis.get('safety_discrepancies', 0)} safety discrepancies
3. Follow up on {kpis.get('outstanding_visits', 0)} outstanding visits"""
            
            elif 'study' in question_lower or 'studies' in question_lower:
                sorted_studies = sorted(studies, key=lambda x: x.get('total_issues', 0), reverse=True)[:5]
                
                study_list = "\n".join([
                    f"- **{s.get('study_id')}**: {s.get('total_subjects'):,} subjects, {s.get('total_issues'):,} issues"
                    for s in sorted_studies
                ])
                
                response = f"""## Study Overview

### Total Studies: {len(studies)}

### Top 5 Studies by Issues:
{study_list}

### Global Statistics
- Total Subjects: {kpis.get('total_subjects', 0):,}
- Total Issues: {kpis.get('total_issues', 0):,}
- Average Issues/Subject: {kpis.get('avg_issues_per_subject', 0):.2f}"""
            
            elif 'safety' in question_lower:
                response = f"""## Safety Discrepancies Analysis

### Current Status
- **Total Safety Discrepancies**: {kpis.get('safety_discrepancies', 0):,}
- **Missing Pages**: {kpis.get('missing_pages_total', 0):,}
- **Outstanding Visits**: {kpis.get('outstanding_visits', 0):,}

### Risk Distribution
- Critical: {kpis.get('critical_risk_count', 0):,}
- High: {kpis.get('high_risk_count', 0):,}

### Recommended Actions
1. Review all safety discrepancies as priority
2. Follow up on missing documentation
3. Schedule outstanding visits"""
            
            elif 'pending' in question_lower:
                response = f"""## Pending Items Analysis

### Current Status
- **Subjects with Pending Items**: {kpis.get('pending_items_count', 0):,}
- **Pending Percentage**: {kpis.get('pending_items_pct', 0):.1f}%

### Breakdown by Category
Studies with highest pending rates need immediate attention.

### Recommended Actions
1. Complete pending MedDRA coding
2. Resolve WHO-DD coding items
3. Address missing page entries"""
            
            else:
                response = f"""## Clinical Trial Dashboard Summary

### Key Performance Indicators
- **Total Subjects**: {kpis.get('total_subjects', 0):,}
- **Total Studies**: {len(studies)}
- **Total Issues**: {kpis.get('total_issues', 0):,}
- **Critical Risk Subjects**: {kpis.get('critical_risk_count', 0):,}
- **High Risk Subjects**: {kpis.get('high_risk_count', 0):,}
- **Pending Items**: {kpis.get('pending_items_pct', 0):.1f}%

### Data Quality Metrics
- Average Issues per Subject: {kpis.get('avg_issues_per_subject', 0):.2f}
- Safety Discrepancies: {kpis.get('safety_discrepancies', 0):,}
- Outstanding Visits: {kpis.get('outstanding_visits', 0):,}

### Ask Me About
- Risk analysis and critical subjects
- Study-specific information  
- Safety discrepancies
- Pending items and data quality"""
            
            # Send SSE-formatted response
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Simulate streaming by sending the full response
            chunk_data = json.dumps({"chunk": response, "done": False})
            self.wfile.write(f"data: {chunk_data}\n\n".encode())
            
            # Send done signal with sources
            done_data = json.dumps({
                "done": True,
                "sources": [
                    {"doc_type": "dashboard_data", "study": "All Studies"}
                ]
            })
            self.wfile.write(f"data: {done_data}\n\n".encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
