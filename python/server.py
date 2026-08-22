"""
Akshi Smart Farming AI Platform - Dual REST API & Web Server
"""

import json
import mimetypes
import os
import random
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

from crop_model import CropRecommender
from disease_model import DiseaseDiagnoser

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
recommender = CropRecommender()
diagnoser = DiseaseDiagnoser()

class AkshiAPIHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # API Routes
        if parsed.path == '/api/health':
            self.send_json_response({'status': 'online', 'service': 'Akshi Smart Farming AI API', 'version': '2.4.0'})
            return
        
        if parsed.path == '/api/sensor-data':
            telemetry = {
                'soil_moisture_pct': round(40.0 + random.uniform(-2.0, 3.0), 1),
                'soil_temp_c': round(23.0 + random.uniform(-0.5, 0.5), 1),
                'soil_ph': 6.6,
                'ambient_temp_c': round(28.0 + random.uniform(-1.0, 1.0), 1),
                'relative_humidity_pct': round(64.0 + random.uniform(-2.0, 2.0), 1),
                'solar_irradiance_w_m2': round(700 + random.uniform(-30, 40)),
                'irrigation_valve_open': False,
                'status': 'HEALTHY'
            }
            self.send_json_response(telemetry)
            return

        if parsed.path == '/api/crops':
            self.send_json_response({'crops': recommender.crops})
            return

        if parsed.path == '/api/diseases':
            self.send_json_response({'diseases': diagnoser.diseases})
            return

        # Default static file handler (Serves index.html, css/, js/, data/)
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_length).decode('utf-8')
        
        payload = {}
        if post_body:
            try:
                payload = json.loads(post_body)
            except Exception:
                payload = parse_qs(post_body)

        if parsed.path == '/api/recommend-crop':
            n = float(payload.get('n', 80))
            p = float(payload.get('p', 40))
            k = float(payload.get('k', 40))
            ph = float(payload.get('ph', 6.5))
            temp = float(payload.get('temp', 25))
            humidity = float(payload.get('humidity', 65))
            rainfall = float(payload.get('rainfall', 800))

            results = recommender.recommend(n, p, k, ph, temp, humidity, rainfall)
            self.send_json_response({'success': True, 'recommendations': results})
            return

        if parsed.path == '/api/diagnose':
            query = payload.get('symptoms', 'brown spots')
            result = diagnoser.diagnose_by_symptoms(query)
            self.send_json_response({'success': True, 'diagnosis': result})
            return

        if parsed.path == '/api/calculate-fertilizer':
            target_n = float(payload.get('target_n', 100))
            target_p = float(payload.get('target_p', 50))
            target_k = float(payload.get('target_k', 40))
            current_n = float(payload.get('current_n', 45))
            current_p = float(payload.get('current_p', 20))
            current_k = float(payload.get('current_k', 25))
            area = float(payload.get('area', 1.0))

            req_n = max(0.0, target_n - current_n) * area
            req_p = max(0.0, target_p - current_p) * area
            req_k = max(0.0, target_k - current_k) * area

            dap_kg = req_p / 0.46
            n_from_dap = dap_kg * 0.18
            rem_n = max(0.0, req_n - n_from_dap)
            urea_kg = rem_n / 0.46
            mop_kg = req_k / 0.60

            self.send_json_response({
                'success': True,
                'urea_kg': round(urea_kg),
                'urea_bags': round(urea_kg / 50.0, 1),
                'dap_kg': round(dap_kg),
                'dap_bags': round(dap_kg / 50.0, 1),
                'mop_kg': round(mop_kg),
                'mop_bags': round(mop_kg / 50.0, 1),
                'total_kg': round(urea_kg + dap_kg + mop_kg)
            })
            return

        self.send_response(404)
        self.end_headers()

    def send_json_response(self, data, status_code=200):
        response_bytes = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(response_bytes)

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, AkshiAPIHandler)
    print(f"============================================================")
    print(f"  Akshi Smart Farming AI Platform is Live!")
    print(f"  Access Dashboard: http://localhost:{port}")
    print(f"  API Endpoint:     http://localhost:{port}/api/health")
    print(f"============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
