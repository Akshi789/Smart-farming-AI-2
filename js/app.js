/**
 * Akshi Smart Farming AI Platform - Master Application Controller
 */

class AkshiApp {
  constructor() {
    this.currentTab = 'overview';
    this.init();
  }

  async init() {
    // Setup event listeners
    this.bindNavigation();
    this.bindPresets();
    this.bindCropForm();
    this.bindDiseaseScanner();
    this.bindFertilizerCalc();
    this.bindMarketCalculator();
    this.bindThemeToggle();

    // Start background IoT telemetry and weather
    setTimeout(() => {
      if (window.iotSimulator) {
        window.iotSimulator.initTelemetryCharts();
        window.iotSimulator.start();
      }
      if (window.weatherAdvisor) {
        window.weatherAdvisor.renderWeatherUI();
      }
      // Trigger initial crop recommendation
      this.runCropRecommendation();
    }, 300);

    this.showToast('Akshi Smart Farming AI Platform initialized successfully.', 'success');
  }

  /* ---------------------------------------------------------
     Navigation & Tab Management
     --------------------------------------------------------- */
  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTab = item.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Chat input submit
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatUserInput');
    if (chatForm && chatInput) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value;
        if (text && window.chatAssistant) {
          window.chatAssistant.processUserQuery(text);
          chatInput.value = '';
        }
      });
    }

    // Quick prompt buttons
    document.querySelectorAll('.quick-prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-prompt');
        if (text && window.chatAssistant) {
          window.chatAssistant.processUserQuery(text);
        }
      });
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active nav button
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tab') === tabId);
    });

    // Update active content pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `tab-${tabId}`);
    });

    // Update header title
    const headerTitle = document.getElementById('pageHeaderTitle');
    const titles = {
      overview: '<i class="fas fa-chart-pie" style="color:var(--accent-emerald-light);"></i> Executive Farm Dashboard',
      cropai: '<i class="fas fa-seedling" style="color:var(--accent-emerald-light);"></i> AI Crop Recommendation Engine',
      scanner: '<i class="fas fa-microscope" style="color:var(--accent-cyan);"></i> Plant Pathology & Disease Vision AI',
      iot: '<i class="fas fa-tower-broadcast" style="color:var(--accent-emerald-light);"></i> Real-Time IoT Telemetry & Irrigation',
      weather: '<i class="fas fa-cloud-sun" style="color:var(--accent-amber);"></i> Agro-Weather & Irrigation Advisory',
      fertilizer: '<i class="fas fa-flask-vial" style="color:var(--accent-lime);"></i> Soil Health & Fertilizer Calculator',
      market: '<i class="fas fa-chart-line" style="color:var(--accent-emerald-light);"></i> Mandi Market Trends & Profit Planner',
      chat: '<i class="fas fa-robot" style="color:var(--accent-emerald-light);"></i> Akshi AI Virtual Agronomist'
    };

    if (headerTitle && titles[tabId]) {
      headerTitle.innerHTML = titles[tabId];
    }

    // Chart redraws on tab activation
    if (tabId === 'overview' || tabId === 'iot') {
      setTimeout(() => {
        if (window.iotSimulator) window.iotSimulator.updateCharts();
      }, 100);
    }
  }

  /* ---------------------------------------------------------
     Presets Loader
     --------------------------------------------------------- */
  bindPresets() {
    const presets = {
      rice: { n: 85, p: 42, k: 38, ph: 6.2, temp: 28, humidity: 82, rainfall: 1800 },
      wheat: { n: 105, p: 52, k: 40, ph: 6.8, temp: 18, humidity: 55, rainfall: 620 },
      cotton: { n: 125, p: 65, k: 58, ph: 7.2, temp: 31, humidity: 60, rainfall: 750 },
      tomato: { n: 95, p: 85, k: 95, ph: 6.4, temp: 24, humidity: 65, rainfall: 800 },
      groundnut: { n: 25, p: 60, k: 40, ph: 6.5, temp: 27, humidity: 60, rainfall: 650 }
    };

    document.querySelectorAll('.preset-chip[data-preset]').forEach(chip => {
      chip.addEventListener('click', () => {
        const key = chip.getAttribute('data-preset');
        if (presets[key]) {
          const p = presets[key];
          this.setFormValue('inputN', p.n, 'valN');
          this.setFormValue('inputP', p.p, 'valP');
          this.setFormValue('inputK', p.k, 'valK');
          this.setFormValue('inputPH', p.ph, 'valPH');
          this.setFormValue('inputTemp', p.temp, 'valTemp');
          this.setFormValue('inputHum', p.humidity, 'valHum');
          this.setFormValue('inputRain', p.rainfall, 'valRain');
          this.runCropRecommendation();
          this.showToast(`Applied preset profile for ${key.toUpperCase()}`, 'info');
        }
      });
    });
  }

  setFormValue(id, val, displayId = null) {
    const el = document.getElementById(id);
    if (el) {
      el.value = val;
      if (displayId) {
        const dispEl = document.getElementById(displayId);
        if (dispEl) dispEl.textContent = val;
      }
    }
  }

  /* ---------------------------------------------------------
     Crop Recommendation Handlers
     --------------------------------------------------------- */
  bindCropForm() {
    const inputs = ['inputN', 'inputP', 'inputK', 'inputPH', 'inputTemp', 'inputHum', 'inputRain'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      const valDisp = document.getElementById(`val${id.replace('input', '')}`);
      if (el && valDisp) {
        el.addEventListener('input', () => {
          valDisp.textContent = el.value;
          this.runCropRecommendation();
        });
      }
    });

    const form = document.getElementById('cropAIForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.runCropRecommendation();
      });
    }
  }

  runCropRecommendation() {
    if (!window.mlEngine) return;

    const payload = {
      n: parseFloat(document.getElementById('inputN')?.value || 80),
      p: parseFloat(document.getElementById('inputP')?.value || 40),
      k: parseFloat(document.getElementById('inputK')?.value || 40),
      ph: parseFloat(document.getElementById('inputPH')?.value || 6.5),
      temp: parseFloat(document.getElementById('inputTemp')?.value || 25),
      humidity: parseFloat(document.getElementById('inputHum')?.value || 65),
      rainfall: parseFloat(document.getElementById('inputRain')?.value || 800)
    };

    const results = window.mlEngine.recommendCrops(payload);
    if (!results || results.length === 0) return;

    // Top Recommendation (Hero Card)
    const top = results[0];
    const heroTitle = document.getElementById('topCropName');
    if (heroTitle) heroTitle.textContent = top.name;

    const heroYield = document.getElementById('topCropYield');
    if (heroYield) heroYield.textContent = `${top.expected_yield_t_ha} Tons / Hectare`;

    const heroPrice = document.getElementById('topCropPrice');
    if (heroPrice) heroPrice.textContent = `₹${top.market_price_inr_qtl.toLocaleString()} / Quintal`;

    const heroScore = document.getElementById('topCropScore');
    if (heroScore) heroScore.textContent = `${top.matchPercentage}%`;

    const heroDesc = document.getElementById('topCropDesc');
    if (heroDesc) heroDesc.textContent = top.description;

    const heroWater = document.getElementById('topCropWater');
    if (heroWater) heroWater.textContent = top.water_requirement;

    const heroSeason = document.getElementById('topCropSeason');
    if (heroSeason) heroSeason.textContent = top.best_season;

    // Render Secondary Top 3 Grid
    const gridContainer = document.getElementById('top3CropsGrid');
    if (gridContainer) {
      gridContainer.innerHTML = results.slice(0, 3).map((crop, idx) => `
        <div class="crop-sub-card ${idx === 0 ? 'selected' : ''}" onclick="window.app.showCropModal('${crop.id}')">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <div style="font-weight:700; font-size:1.05rem; color:var(--text-primary);">${crop.name}</div>
              <div style="font-size:0.78rem; color:var(--text-muted);">${crop.category} • ${crop.scientific_name}</div>
            </div>
            <div class="match-gauge">${crop.matchPercentage}%</div>
          </div>
          <div style="font-size:0.84rem; color:var(--text-dim); margin-bottom:10px;">
            ${crop.description.substring(0, 85)}...
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; border-top:1px solid var(--glass-border); padding-top:8px; color:var(--text-secondary);">
            <span><i class="fas fa-sack-dollar"></i> ₹${crop.market_price_inr_qtl}/Q</span>
            <span><i class="fas fa-calendar"></i> ${crop.growth_days}</span>
          </div>
        </div>
      `).join('');
    }
  }

  showCropModal(cropId) {
    if (!window.mlEngine) return;
    const crop = window.mlEngine.cropsData.find(c => c.id === cropId);
    if (!crop) return;

    this.showToast(`Selected ${crop.name} - Optimal NPK: ${crop.optimal_n}:${crop.optimal_p}:${crop.optimal_k}`, 'info');
  }

  /* ---------------------------------------------------------
     Plant Disease Vision Scanner
     --------------------------------------------------------- */
  bindDiseaseScanner() {
    const dropzone = document.getElementById('leafDropzone');
    const fileInput = document.getElementById('leafFileInput');
    const previewImg = document.getElementById('scannerPreviewImg');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });

      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleLeafFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleLeafFile(e.target.files[0]);
        }
      });
    }

    // Sample leaf clicks
    document.querySelectorAll('.sample-leaf-btn[data-sample]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sampleId = btn.getAttribute('data-sample');
        this.runDiagnosticScan(null, sampleId);
      });
    });
  }

  handleLeafFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImg = document.getElementById('scannerPreviewImg');
      if (previewImg) {
        previewImg.src = e.target.result;
        this.runDiagnosticScan(previewImg, null);
      }
    };
    reader.readAsDataURL(file);
  }

  async runDiagnosticScan(imgElement = null, sampleId = null) {
    const scannerViewport = document.getElementById('scannerViewport');
    const boundingBox = document.getElementById('scanBoundingBox');
    const resultBox = document.getElementById('diseaseResultContainer');

    if (scannerViewport) scannerViewport.classList.add('scanning');
    if (boundingBox) boundingBox.style.display = 'none';

    // Show simulated laser sweep
    await new Promise(r => setTimeout(r, 1200));

    if (!imgElement) {
      imgElement = document.getElementById('scannerPreviewImg');
    }

    const diagnosis = await window.mlEngine.diagnoseLeafImage(imgElement, sampleId);

    if (scannerViewport) scannerViewport.classList.remove('scanning');

    // Display bounding box
    if (boundingBox) {
      boundingBox.style.display = 'block';
      boundingBox.style.top = `${diagnosis.boundingBox.top}%`;
      boundingBox.style.left = `${diagnosis.boundingBox.left}%`;
      boundingBox.style.width = `${diagnosis.boundingBox.width}%`;
      boundingBox.style.height = `${diagnosis.boundingBox.height}%`;
    }

    // Render Diagnostic Report
    if (resultBox) {
      const d = diagnosis.disease;
      resultBox.innerHTML = `
        <div style="background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:var(--radius-lg); padding:20px; animation:fadeIn 0.4s ease;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
            <div>
              <span class="spray-safe-badge ${d.id === 'healthy_leaf' ? 'safe-green' : 'safe-amber'}" style="margin-bottom:6px;">
                <i class="fas ${d.id === 'healthy_leaf' ? 'fa-check' : 'fa-triangle-exclamation'}"></i> ${d.severity}
              </span>
              <h3 style="color:var(--text-primary); font-size:1.3rem; margin-top:4px;">${d.name}</h3>
              <div style="font-size:0.84rem; color:var(--text-dim);">Pathogen: ${d.pathogen}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.6rem; font-weight:800; color:var(--accent-emerald-light); font-family:var(--font-mono);">${diagnosis.confidence}%</div>
              <div style="font-size:0.75rem; color:var(--text-dim);">Diagnostic Confidence</div>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <h4 style="font-size:0.92rem; color:var(--accent-emerald-light); margin-bottom:6px;"><i class="fas fa-list-check"></i> Symptoms Identified:</h4>
            <ul style="padding-left:20px; font-size:0.86rem; color:var(--text-secondary);">
              ${d.symptoms.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>

          <div class="grid-2" style="gap:14px; margin-top:14px;">
            <div style="background:rgba(16, 185, 129, 0.08); border:1px solid var(--glass-border); border-radius:var(--radius-md); padding:14px;">
              <h4 style="font-size:0.9rem; color:var(--accent-emerald-light); margin-bottom:6px;"><i class="fas fa-leaf"></i> Organic / Bio-Remedies:</h4>
              <ul style="padding-left:18px; font-size:0.82rem; color:var(--text-primary);">
                ${d.organic_remedies.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
            <div style="background:rgba(245, 158, 11, 0.08); border:1px solid var(--glass-border); border-radius:var(--radius-md); padding:14px;">
              <h4 style="font-size:0.9rem; color:var(--accent-amber); margin-bottom:6px;"><i class="fas fa-flask"></i> Chemical Treatments:</h4>
              <ul style="padding-left:18px; font-size:0.82rem; color:var(--text-primary);">
                ${d.chemical_treatments.map(c => `<li>${c}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    this.showToast(`Diagnostic Complete: Detected ${diagnosis.disease.name} (${diagnosis.confidence}% confidence)`, 'success');
  }

  /* ---------------------------------------------------------
     Fertilizer Calculator
     --------------------------------------------------------- */
  bindFertilizerCalc() {
    const calcBtn = document.getElementById('calcFertilizerBtn');
    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        const tN = parseFloat(document.getElementById('fertTargetN')?.value || 100);
        const tP = parseFloat(document.getElementById('fertTargetP')?.value || 50);
        const tK = parseFloat(document.getElementById('fertTargetK')?.value || 40);

        const cN = parseFloat(document.getElementById('fertCurrentN')?.value || 45);
        const cP = parseFloat(document.getElementById('fertCurrentP')?.value || 20);
        const cK = parseFloat(document.getElementById('fertCurrentK')?.value || 25);
        const area = parseFloat(document.getElementById('fertArea')?.value || 1);

        const res = window.mlEngine.calculateFertilizer(tN, tP, tK, cN, cP, cK, area);

        document.getElementById('resUreaKg').textContent = `${res.urea.kg} kg`;
        document.getElementById('resUreaBags').textContent = `(${res.urea.bags50kg} bags of 50kg)`;

        document.getElementById('resDapKg').textContent = `${res.dap.kg} kg`;
        document.getElementById('resDapBags').textContent = `(${res.dap.bags50kg} bags of 50kg)`;

        document.getElementById('resMopKg').textContent = `${res.mop.kg} kg`;
        document.getElementById('resMopBags').textContent = `(${res.mop.bags50kg} bags of 50kg)`;

        document.getElementById('fertAdviceText').textContent = res.recommendation;
        this.showToast(`Calculated fertilizer requirements for ${area} hectare(s).`, 'success');
      });
    }
  }

  /* ---------------------------------------------------------
     Market Profit Planner
     --------------------------------------------------------- */
  bindMarketCalculator() {
    const updateMarketCalc = () => {
      const yieldTons = parseFloat(document.getElementById('mktYield')?.value || 5);
      const pricePerQtl = parseFloat(document.getElementById('mktPrice')?.value || 2300);
      const costPerHa = parseFloat(document.getElementById('mktCost')?.value || 35000);
      const area = parseFloat(document.getElementById('mktArea')?.value || 2);

      // 1 Ton = 10 Quintals
      const totalQuintals = yieldTons * 10 * area;
      const grossRevenue = totalQuintals * pricePerQtl;
      const totalCost = costPerHa * area;
      const netProfit = grossRevenue - totalCost;
      const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : 0;

      const revEl = document.getElementById('mktGrossRev');
      if (revEl) revEl.textContent = `₹${Math.round(grossRevenue).toLocaleString()}`;

      const profEl = document.getElementById('mktNetProfit');
      if (profEl) profEl.textContent = `₹${Math.round(netProfit).toLocaleString()}`;

      const roiEl = document.getElementById('mktROI');
      if (roiEl) roiEl.textContent = `${roi}%`;
    };

    ['mktYield', 'mktPrice', 'mktCost', 'mktArea'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateMarketCalc);
    });

    updateMarketCalc();
  }

  /* ---------------------------------------------------------
     Theme Toggle
     --------------------------------------------------------- */
  bindThemeToggle() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        toggleBtn.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        this.showToast(`Switched to ${isLight ? 'Light' : 'Dark'} mode`, 'info');
      });
    }
  }

  /* ---------------------------------------------------------
     Toast Notification Manager
     --------------------------------------------------------- */
  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : (type === 'danger' ? 'fa-triangle-exclamation' : 'fa-info-circle');
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  exportFarmReport() {
    window.print();
  }
}

// Initialize Application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AkshiApp();
});
