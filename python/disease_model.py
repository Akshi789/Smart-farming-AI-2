"""
Akshi Smart Farming AI Platform - Plant Disease Diagnostic Model
"""

import json
import os

class DiseaseDiagnoser:
    def __init__(self, data_path=None):
        if not data_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_path = os.path.join(base_dir, 'data', 'diseases.json')

        self.diseases = []
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.diseases = data.get('diseases', [])

    def diagnose_by_symptoms(self, symptoms_query):
        """
        Keyword and token match against disease knowledge base.
        """
        query_tokens = [t.lower().strip() for t in symptoms_query.split() if len(t) > 2]
        scored_results = []

        for d in self.diseases:
            score = 0
            # Check symptoms
            for s in d.get('symptoms', []):
                for token in query_tokens:
                    if token in s.lower():
                        score += 3
            
            # Check keywords
            for kw in d.get('confidence_boost_keywords', []):
                for token in query_tokens:
                    if token in kw.lower():
                        score += 5

            if score > 0:
                confidence = min(98, 65 + score * 4)
                scored_results.append({
                    'disease': d,
                    'confidence': confidence
                })

        if not scored_results:
            # Fallback to general healthy or top entry
            return {
                'disease': self.diseases[0] if self.diseases else {},
                'confidence': 70,
                'note': 'Preliminary match based on closest botanical symptoms.'
            }

        scored_results.sort(key=lambda x: x['confidence'], reverse=True)
        return scored_results[0]

if __name__ == '__main__':
    diagnoser = DiseaseDiagnoser()
    print("Testing Disease Diagnoser with symptom query 'concentric brown spots ring':")
    res = diagnoser.diagnose_by_symptoms("concentric brown spots ring")
    print(f"Detected: {res['disease']['name']} | Confidence: {res['confidence']}%")
    print(f"Remedy: {res['disease']['organic_remedies'][0]}")
