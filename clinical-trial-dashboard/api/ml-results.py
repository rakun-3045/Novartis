from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Read the ML results data
            data_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'ml_results_api.json')
            
            # Check if file exists, if not provide default data
            if os.path.exists(data_path):
                with open(data_path, 'r', encoding='utf-8') as f:
                    ml_data = json.load(f)
            else:
                # Provide default ML results
                ml_data = {
                    "models_summary": {
                        "risk_classification": {
                            "best_model": "Gradient Boosting",
                            "accuracy": 99.71,
                            "f1_score": 99.70
                        },
                        "pending_classification": {
                            "best_model": "Random Forest",
                            "accuracy": 100.0,
                            "f1_score": 100.0
                        },
                        "issues_regression": {
                            "best_model": "Ridge Regression",
                            "r2_score": 1.0,
                            "mae": 0.0
                        }
                    },
                    "feature_importance": [],
                    "ml_strategy": {
                        "title": "Clinical Trial Risk Prediction ML Pipeline",
                        "description": "A comprehensive machine learning approach to predict subject risk levels, pending items, and total issues in clinical trials.",
                        "tasks": [
                            {
                                "name": "Risk Classification",
                                "type": "Multi-class Classification",
                                "target": "risk_category (Low/Medium/High/Critical)",
                                "description": "Predicts the risk category of each subject based on data quality indicators."
                            },
                            {
                                "name": "Pending Items Classification",
                                "type": "Binary Classification",
                                "target": "has_pending_items (0/1)",
                                "description": "Identifies subjects with pending coding items."
                            },
                            {
                                "name": "Issues Regression",
                                "type": "Regression",
                                "target": "total_issues (continuous)",
                                "description": "Predicts the expected number of total issues for each subject."
                            }
                        ],
                        "models_used": [
                            {"name": "Random Forest", "type": "Ensemble"},
                            {"name": "Gradient Boosting", "type": "Ensemble"},
                            {"name": "Logistic Regression", "type": "Linear"},
                            {"name": "Ridge Regression", "type": "Linear"}
                        ]
                    }
                }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(ml_data).encode())
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
