"""
Akshi Smart Farming AI Platform - Crop Recommendation ML Engine
"""

import json
import math
import os
import sys

class CropRecommender:
    def __init__(self, data_path=None):
        if not data_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_path = os.path.join(base_dir, 'data', 'crops.json')
        
        self.crops = []
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.crops = data.get('crops', [])

    def recommend(self, n, p, k, ph, temp, humidity, rainfall):
        """
        Calculate multivariable normalized distance score for all crops.
        """
        weights = {
            'n': 0.18,
            'p': 0.15,
            'k': 0.15,
            'ph': 0.16,
            'temp': 0.14,
            'humidity': 0.10,
            'rainfall': 0.12
        }

        results = []
        for crop in self.crops:
            # Nutrient fitness
            score_n = 1.0 - min(1.0, abs(n - crop['optimal_n']) / 140.0)
            score_p = 1.0 - min(1.0, abs(p - crop['optimal_p']) / 100.0)
            score_k = 1.0 - min(1.0, abs(k - crop['optimal_k']) / 120.0)

            # pH fitness
            if ph < crop['optimal_ph_min']:
                score_ph = max(0.0, 1.0 - (crop['optimal_ph_min'] - ph) / 2.0)
            elif ph > crop['optimal_ph_max']:
                score_ph = max(0.0, 1.0 - (ph - crop['optimal_ph_max']) / 2.0)
            else:
                score_ph = 1.0

            # Temperature fitness
            if temp < crop['optimal_temp_min']:
                score_temp = max(0.0, 1.0 - (crop['optimal_temp_min'] - temp) / 15.0)
            elif temp > crop['optimal_temp_max']:
                score_temp = max(0.0, 1.0 - (temp - crop['optimal_temp_max']) / 15.0)
            else:
                score_temp = 1.0

            # Humidity fitness
            if humidity < crop['optimal_humidity_min']:
                score_hum = max(0.0, 1.0 - (crop['optimal_humidity_min'] - humidity) / 40.0)
            elif humidity > crop['optimal_humidity_max']:
                score_hum = max(0.0, 1.0 - (humidity - crop['optimal_humidity_max']) / 40.0)
            else:
                score_hum = 1.0

            # Rainfall fitness
            if rainfall < crop['optimal_rainfall_min']:
                score_rain = max(0.0, 1.0 - (crop['optimal_rainfall_min'] - rainfall) / 1000.0)
            elif rainfall > crop['optimal_rainfall_max']:
                score_rain = max(0.0, 1.0 - (rainfall - crop['optimal_rainfall_max']) / 1000.0)
            else:
                score_rain = 1.0

            total_fitness = (
                score_n * weights['n'] +
                score_p * weights['p'] +
                score_k * weights['k'] +
                score_ph * weights['ph'] +
                score_temp * weights['temp'] +
                score_hum * weights['humidity'] +
                score_rain * weights['rainfall']
            )

            confidence = round(max(10.0, min(99.0, total_fitness * 100.0)), 1)

            results.append({
                'id': crop['id'],
                'name': crop['name'],
                'category': crop['category'],
                'scientific_name': crop['scientific_name'],
                'confidence': confidence,
                'expected_yield_t_ha': crop['expected_yield_t_ha'],
                'market_price_inr_qtl': crop['market_price_inr_qtl'],
                'water_requirement': crop['water_requirement'],
                'description': crop['description'],
                'best_season': crop['best_season']
            })

        results.sort(key=lambda x: x['confidence'], reverse=True)
        return results

if __name__ == '__main__':
    recommender = CropRecommender()
    print("Testing Crop Recommender with sample parameters (N=80, P=40, K=40, pH=6.5, Temp=26, Hum=70, Rain=1200):")
    top_matches = recommender.recommend(80, 40, 40, 6.5, 26, 70, 1200)
    for i, m in enumerate(top_matches[:3], 1):
        print(f"{i}. {m['name']} ({m['category']}) - Match: {m['confidence']}% | Market: Rs. {m['market_price_inr_qtl']}/Q")
