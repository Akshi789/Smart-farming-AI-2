/**
 * Akshi Smart Farming AI Platform - IoT Telemetry & Sensor Simulator Engine
 */

class IoTSimulator {
  constructor() {
    this.telemetry = {
      soilMoisture: 42,        // %
      soilTemp: 23.4,          // °C
      soilPH: 6.6,
      soilN: 76,               // mg/kg
      soilP: 38,               // mg/kg
      soilK: 44,               // mg/kg
      airTemp: 28.2,           // °C
      airHumidity: 64,         // %
      solarIrradiance: 720,    // W/m²
      waterFlowRate: 0.0,      // L/min
      irrigationActive: false,
      autoIrrigationMode: true,
      moistureThreshold: 35
    };

    this.history = {
      labels: [],
      moisture: [],
      airTemp: [],
      soilTemp: [],
      humidity: []
    };

    this.charts = {};
    this.intervalId = null;
    this.initHistory();
  }

  initHistory() {
    const now = new Date();
    for (let i = 10; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5000);
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.history.labels.push(timeStr);
      this.history.moisture.push(+(40 + Math.sin(i) * 3 + Math.random()).toFixed(1));
      this.history.airTemp.push(+(27.5 + Math.cos(i) * 1.5 + Math.random() * 0.5).toFixed(1));
      this.history.soilTemp.push(+(23.0 + Math.random() * 0.4).toFixed(1));
      this.history.humidity.push(+(62 + Math.random() * 4).toFixed(1));
    }
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), 3000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tick() {
    // 1. Natural fluctuations
    const delta = (Math.random() - 0.5) * 0.4;
    this.telemetry.airTemp = +(Math.max(16, Math.min(42, this.telemetry.airTemp + delta))).toFixed(1);
    this.telemetry.airHumidity = +(Math.max(30, Math.min(95, this.telemetry.airHumidity + (Math.random() - 0.5) * 0.8))).toFixed(1);
    this.telemetry.solarIrradiance = Math.round(Math.max(100, Math.min(1050, this.telemetry.solarIrradiance + (Math.random() - 0.5) * 20)));

    // 2. Moisture dynamics & irrigation loop
    if (this.telemetry.irrigationActive) {
      this.telemetry.soilMoisture = +(Math.min(80, this.telemetry.soilMoisture + 1.2)).toFixed(1);
      this.telemetry.waterFlowRate = 18.5; // L/min pumping
      
      // Auto shut-off when field is adequately saturated
      if (this.telemetry.soilMoisture >= 62 && this.telemetry.autoIrrigationMode) {
        this.toggleIrrigation(false, 'Auto threshold reached: Soil moisture optimal (62%)');
      }
    } else {
      // Natural drying
      this.telemetry.soilMoisture = +(Math.max(18, this.telemetry.soilMoisture - 0.25)).toFixed(1);
      this.telemetry.waterFlowRate = 0.0;

      // Auto trigger irrigation if soil dry
      if (this.telemetry.soilMoisture < this.telemetry.moistureThreshold && this.telemetry.autoIrrigationMode) {
        this.toggleIrrigation(true, `Auto Irrigation Triggered: Soil moisture dropped below ${this.telemetry.moistureThreshold}%`);
      }
    }

    // 3. Update time series
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.history.labels.push(timeStr);
    this.history.moisture.push(this.telemetry.soilMoisture);
    this.history.airTemp.push(this.telemetry.airTemp);
    this.history.soilTemp.push(this.telemetry.soilTemp);
    this.history.humidity.push(this.telemetry.airHumidity);

    if (this.history.labels.length > 15) {
      this.history.labels.shift();
      this.history.moisture.shift();
      this.history.airTemp.shift();
      this.history.soilTemp.shift();
      this.history.humidity.shift();
    }

    this.updateUI();
    this.updateCharts();
  }

  toggleIrrigation(state = null, message = null) {
    if (state === null) {
      this.telemetry.irrigationActive = !this.telemetry.irrigationActive;
    } else {
      this.telemetry.irrigationActive = state;
    }

    const valveToggle = document.getElementById('irrigationToggle');
    if (valveToggle) {
      valveToggle.checked = this.telemetry.irrigationActive;
    }

    const statusEl = document.getElementById('irrigationStatusText');
    if (statusEl) {
      statusEl.textContent = this.telemetry.irrigationActive ? 'VALVE OPEN (Flowing)' : 'VALVE CLOSED (Standby)';
      statusEl.className = this.telemetry.irrigationActive ? 'stat-trend trend-up' : 'stat-trend trend-stable';
    }

    if (message && window.app) {
      window.app.showToast(message, this.telemetry.irrigationActive ? 'info' : 'success');
    }
  }

  updateUI() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('sensorMoistureVal', this.telemetry.soilMoisture);
    setVal('sensorAirTempVal', this.telemetry.airTemp);
    setVal('sensorAirHumidityVal', this.telemetry.airHumidity);
    setVal('sensorSolarVal', this.telemetry.solarIrradiance);
    setVal('sensorSoilTempVal', this.telemetry.soilTemp);
    setVal('sensorSoilPHVal', this.telemetry.soilPH);
    setVal('sensorWaterFlowVal', this.telemetry.waterFlowRate.toFixed(1));

    // Progress bars
    const moistureBar = document.getElementById('moistureProgressBar');
    if (moistureBar) moistureBar.style.width = `${this.telemetry.soilMoisture}%`;

    const humidityBar = document.getElementById('humidityProgressBar');
    if (humidityBar) humidityBar.style.width = `${this.telemetry.airHumidity}%`;
  }

  initTelemetryCharts() {
    if (typeof Chart === 'undefined') return;

    const chartConfig = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8', font: { size: 10 } }
        }
      }
    };

    // 1. Overview Telemetry Chart
    const ctxOverview = document.getElementById('overviewTelemetryChart');
    if (ctxOverview) {
      this.charts.overview = new Chart(ctxOverview, {
        type: 'line',
        data: {
          labels: [...this.history.labels],
          datasets: [
            {
              label: 'Soil Moisture (%)',
              data: [...this.history.moisture],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              tension: 0.35,
              fill: true,
              borderWidth: 2.5
            },
            {
              label: 'Air Temp (°C)',
              data: [...this.history.airTemp],
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.05)',
              tension: 0.35,
              borderWidth: 2
            }
          ]
        },
        options: {
          ...chartConfig,
          plugins: {
            legend: {
              display: true,
              labels: { color: '#a7f3d0', font: { family: 'Outfit', size: 11 } }
            }
          }
        }
      });
    }

    // 2. Dedicated IoT Soil Chart
    const ctxSoil = document.getElementById('iotSoilChart');
    if (ctxSoil) {
      this.charts.soil = new Chart(ctxSoil, {
        type: 'line',
        data: {
          labels: [...this.history.labels],
          datasets: [{
            label: 'Moisture (%)',
            data: [...this.history.moisture],
            borderColor: '#34d399',
            backgroundColor: 'rgba(52, 211, 153, 0.2)',
            tension: 0.3,
            fill: true
          }]
        },
        options: chartConfig
      });
    }
  }

  updateCharts() {
    if (this.charts.overview) {
      this.charts.overview.data.labels = [...this.history.labels];
      this.charts.overview.data.datasets[0].data = [...this.history.moisture];
      this.charts.overview.data.datasets[1].data = [...this.history.airTemp];
      this.charts.overview.update('none');
    }

    if (this.charts.soil) {
      this.charts.soil.data.labels = [...this.history.labels];
      this.charts.soil.data.datasets[0].data = [...this.history.moisture];
      this.charts.soil.update('none');
    }
  }
}

window.iotSimulator = new IoTSimulator();
