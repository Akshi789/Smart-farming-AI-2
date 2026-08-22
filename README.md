# Akshi Smart Farming AI Platform (`Akshi AgriAI`)

![Akshi Smart Farming AI](https://img.shields.io/badge/System-Smart%20Farming%20AI-10b981?style=for-the-badge&logo=leaf&logoColor=white)
![Version](https://img.shields.io/badge/Version-2.4.0-06b6d4?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-84cc16?style=for-the-badge)

An intelligent precision agriculture and farm decision support platform. **Akshi AgriAI** combines Machine Learning crop suitability recommendations, computer vision plant disease diagnostics, simulated real-time IoT field sensor telemetry, agro-weather evapotranspiration forecasting, and an interactive AI virtual agronomist.

---

## 🌟 Key Capabilities & Modules

1. **AI Crop Recommendation Engine**
   - Multi-factor Euclidean & Cosine distance scoring across 7 critical agronomic variables: Nitrogen (N), Phosphorus (P), Potassium (K), Soil pH, Temperature, Humidity, and Annual Rainfall.
   - Recommends top matching crops with suitability ratings, expected yield in tons/ha, and current mandi market pricing.
   - Includes 5 one-click presets for common regional soil/crop types (*Paddy Wetland*, *Loamy Wheat*, *Black Cotton*, *Tomato Greenhouse*, *Groundnut Sand*).

2. **Plant Pathology & Leaf Disease Vision AI**
   - High-precision visual leaf inspector with drag-and-drop file upload, live laser scanning animation, and lesion bounding box localization.
   - Detailed pathological diagnostic reports covering pathogen species, severity rating, organic biocontrol remedies, chemical fungicide treatments, and cultural prevention steps.

3. **Real-Time IoT Sensor Telemetry & Automated Irrigation**
   - Live simulated sensor telemetry stream updating every 3 seconds:
     - Soil Moisture (%) & Soil Temperature (°C)
     - Ambient Air Temperature (°C) & Relative Humidity (%)
     - Soil pH & Solar Irradiance (PAR) (W/m²)
     - Water Flow Rate (L/min)
   - Closed-loop automated solenoid valve irrigation logic with manual override toggle.
   - Dynamic time-series line charts rendered using Chart.js.

4. **Agro-Weather & Smart Evapotranspiration (ET₀) Advisory**
   - 7-day microclimate agricultural forecast.
   - Daily reference evapotranspiration (ET₀) calculation using Penman-Monteith / Hargreaves formulas.
   - Intelligent foliar chemical spray safety index evaluating wind drift and rain wash-off risks.

5. **Soil Health & Fertilizer Dosing Calculator**
   - Calculates exact commercial fertilizer quantities (Urea, DAP, and MOP) needed based on soil test deficits and farm plot acreage.
   - Converts dosages into standard 50 kg bag counts and provides split basal / top-dressing schedules.

6. **Mandi Market Trends & Farm Profit Planner**
   - Computes gross market revenue, cultivation costs, net profit, and Return on Investment (ROI %) based on acreage and expected yield.

7. **Akshi AI Virtual Agronomist Assistant**
   - 24/7 intelligent agricultural knowledge assistant with NLP intent recognition and voice speech synthesis support.

---

## 📂 Project Architecture

```
cse161/
├── index.html              # Main Interactive Single-Page Dashboard
├── css/
│   ├── style.css           # Global design system (Glassmorphism, dark/light theme, typography)
│   └── components.css      # UI components, stat cards, scanner viewport, gauges, chat widget
├── js/
│   ├── app.js              # Application controller, tab router, toast manager
│   ├── ml_engine.js        # Client-side ML models (Crop suitability, disease classifier)
│   ├── iot_simulator.js    # Live IoT sensor telemetry engine & automatic valve controls
│   ├── weather_advisor.js  # Agro-meteorology and ET₀ calculations
│   └── chat_assistant.js   # AI Agronomist chatbot with Web Speech API voice support
├── python/
│   ├── server.py           # Dual Python REST API and static file web server
│   ├── crop_model.py       # Standalone Python Crop Recommendation ML model
│   └── disease_model.py    # Python Plant Disease pathology diagnostic engine
├── data/
│   ├── crops.json          # Dataset of 25+ crops with scientific criteria & market values
│   └── diseases.json       # Database of crop diseases, symptoms, and remedies
└── README.md               # Documentation & usage manual
```

---

## 🚀 How to Run

### Method 1: Instant Standalone Launch (Zero Dependencies)
Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari):
```bash
# Windows
start index.html
```

### Method 2: Python REST API Server
To launch the integrated Python backend with live REST endpoints and web dashboard:
```bash
python python/server.py
```
Then visit: **`http://localhost:8000`** in your browser.

---

## 📡 REST API Documentation

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Service status and version check |
| `/api/sensor-data` | `GET` | Fetches instantaneous IoT field telemetry |
| `/api/crops` | `GET` | Returns list of all supported agricultural crops |
| `/api/diseases` | `GET` | Returns plant pathology database |
| `/api/recommend-crop` | `POST` | Calculates optimal crops given N, P, K, pH, temp, humidity, rainfall |
| `/api/diagnose` | `POST` | Diagnoses disease from symptom queries or image indicators |
| `/api/calculate-fertilizer` | `POST` | Calculates exact Urea, DAP, and MOP dosages in kg and 50kg bags |

---

## 🔬 Agronomic Science & Formulas

1. **Normalized Crop Fitness:**
   $$\text{Fitness} = \sum_{i} w_i \cdot \max\left(0, 1 - \frac{|v_i - \text{optimal}_i|}{\text{tolerance}_i}\right)$$

2. **Evapotranspiration ($ET_0$):**
   $$ET_0 \approx 0.0023 \cdot (T_{\text{mean}} + 17.8) \cdot \sqrt{T_{\text{max}} - T_{\text{min}}} \cdot R_a$$

3. **Fertilizer Bag Calculation:**
   $$\text{DAP (kg)} = \frac{\text{Required P}_2\text{O}_5}{0.46}$$
   $$\text{Urea (kg)} = \frac{\max(0, \text{Required N} - (\text{DAP} \times 0.18))}{0.46}$$
   $$\text{MOP (kg)} = \frac{\text{Required K}_2\text{O}}{0.60}$$

---

**Developed for CSE161 Agricultural Intelligence & Smart Systems.**
