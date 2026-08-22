/**
 * Akshi Smart Farming AI Platform - Agro-Weather & Smart Irrigation Engine
 */

class WeatherAdvisor {
  constructor() {
    this.forecastData = [];
    this.generate7DayForecast();
  }

  generate7DayForecast() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    
    const weatherConditions = [
      { cond: 'Sunny / Clear', icon: 'fa-sun', tempMax: 32, tempMin: 21, rainProb: 5, windKmh: 9, humidity: 55, safe: true },
      { cond: 'Partly Cloudy', icon: 'fa-cloud-sun', tempMax: 30, tempMin: 20, rainProb: 15, windKmh: 12, humidity: 62, safe: true },
      { cond: 'Isolated Showers', icon: 'fa-cloud-sun-rain', tempMax: 27, tempMin: 19, rainProb: 55, windKmh: 18, humidity: 78, safe: false },
      { cond: 'Scattered Rain', icon: 'fa-cloud-showers-heavy', tempMax: 25, tempMin: 18, rainProb: 80, windKmh: 24, humidity: 88, safe: false },
      { cond: 'Moderate Breeze', icon: 'fa-wind', tempMax: 29, tempMin: 20, rainProb: 10, windKmh: 28, humidity: 50, safe: false },
      { cond: 'Clear Sky', icon: 'fa-sun', tempMax: 33, tempMin: 22, rainProb: 0, windKmh: 8, humidity: 48, safe: true },
      { cond: 'Humid & Overcast', icon: 'fa-cloud', tempMax: 28, tempMin: 21, rainProb: 30, windKmh: 11, humidity: 72, safe: true }
    ];

    this.forecastData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = i === 0 ? 'Today' : days[d.getDay()];
      const condition = weatherConditions[i % weatherConditions.length];

      // Calculate approximate Reference Evapotranspiration (ET₀ in mm/day)
      // Simplified Hargreaves / Penman method
      const tMean = (condition.tempMax + condition.tempMin) / 2;
      const et0 = +(0.0023 * (tMean + 17.8) * Math.sqrt(condition.tempMax - condition.tempMin) * 3.8).toFixed(1);

      this.forecastData.push({
        day: dayName,
        date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        ...condition,
        et0
      });
    }
  }

  renderWeatherUI() {
    const container = document.getElementById('weatherWeekGrid');
    if (!container) return;

    container.innerHTML = this.forecastData.map((item, idx) => `
      <div class="weather-day-card ${idx === 0 ? 'today' : ''}">
        <div style="font-weight:700; font-size:0.85rem; color:var(--text-primary);">${item.day}</div>
        <div style="font-size:0.75rem; color:var(--text-dim);">${item.date}</div>
        <i class="fas ${item.icon} weather-icon-big"></i>
        <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">${item.tempMax}° / ${item.tempMin}°</div>
        <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">
          <i class="fas fa-droplet" style="font-size:0.7rem;"></i> ${item.rainProb}% Rain
        </div>
        <div style="margin-top:8px;">
          <span class="spray-safe-badge ${item.safe ? 'safe-green' : 'safe-red'}">
            <i class="fas ${item.safe ? 'fa-check-circle' : 'fa-triangle-exclamation'}"></i>
            ${item.safe ? 'Spray OK' : 'No Spray'}
          </span>
        </div>
      </div>
    `).join('');

    // Today's summary card update
    const today = this.forecastData[0];
    const todayCondEl = document.getElementById('weatherTodayCondition');
    if (todayCondEl) todayCondEl.textContent = today.cond;

    const todayETEl = document.getElementById('weatherTodayET');
    if (todayETEl) todayETEl.textContent = `${today.et0} mm/day`;

    const sprayAdviceEl = document.getElementById('weatherSprayAdvice');
    if (sprayAdviceEl) {
      if (today.safe) {
        sprayAdviceEl.innerHTML = `<span style="color:var(--accent-emerald-light); font-weight:700;"><i class="fas fa-circle-check"></i> Favorable Spray Window:</span> Wind speed is mild (${today.windKmh} km/h) and rain probability is low (${today.rainProb}%). Optimal window: 07:00 AM - 10:30 AM.`;
      } else {
        sprayAdviceEl.innerHTML = `<span style="color:var(--accent-red); font-weight:700;"><i class="fas fa-triangle-exclamation"></i> High Drift / Washoff Risk:</span> High wind or rain probability (${today.rainProb}%). Postpone foliar spraying to prevent chemical loss.`;
      }
    }
  }
}

window.weatherAdvisor = new WeatherAdvisor();
