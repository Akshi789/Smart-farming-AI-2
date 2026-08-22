/**
 * Akshi Smart Farming AI Platform - AI Agronomist Chatbot Assistant Engine
 */

class ChatAssistant {
  constructor() {
    this.messages = [];
    this.speechEnabled = false;
    this.synth = window.speechSynthesis || null;
    this.init();
  }

  init() {
    this.knowledgeBase = [
      {
        keywords: ['blight', 'early blight', 'late blight', 'leaf spots', 'black spots'],
        reply: `**Plant Blight & Spot Management:**
1. **Early Blight (*Alternaria*):** Characterized by concentric brown target rings. Spray **Mancozeb 75% WP @ 2.5g/L** or organic **Neem Oil 5ml/L + Bacillus subtilis**.
2. **Late Blight (*Phytophthora*):** Causes rapid water-soaked leaf rot with white mold underside. Apply **Metalaxyl 8% + Mancozeb 64% (Ridomil MZ) @ 2.5g/L**.
3. **Preventive Care:** Avoid overhead irrigation, prune lower foliage 30cm above ground, and mulch with clean straw.`
      },
      {
        keywords: ['fertilizer', 'urea', 'dap', 'mop', 'npk', 'dosing', 'dose'],
        reply: `**Balanced N-P-K Fertilizer Guidance:**
- **Basal Dose (at Sowing):** Apply 100% of required Phosphorus (**DAP / SSP**) and Potassium (**MOP**), plus 25% of Nitrogen.
- **Top-Dressing (Growth Stage):** Split remaining Nitrogen (**Urea**) into 2 equal top-dressings at 25-30 days and 50-60 days after sowing.
- *Tip:* Use our built-in **Soil Health & Fertilizer Calculator** tab to calculate the exact bag requirements for your field size!`
      },
      {
        keywords: ['rice', 'paddy', 'blast', 'rice crop'],
        reply: `**Rice (Paddy) Agronomic Protocol:**
- **Optimal Soil:** Clayey / Clay Loam with pH 5.5 - 7.0 and high water-retention.
- **Nutrient Ratio (NPK):** 80:40:40 kg/ha.
- **Disease Alert (Rice Blast):** Spindle-shaped lesions with gray centers. Use **Tricyclazole 75% WP @ 0.6g/L** and avoid excess nitrogen fertilizer.`
      },
      {
        keywords: ['tomato', 'potassium', 'fruit rot', 'blossom end rot'],
        reply: `**Tomato High-Yield Protocol:**
- **Nutrient Focus:** Requires high Potassium (100 kg/ha) for fruit firmness and color development.
- **Blossom End Rot:** Caused by Calcium deficiency and erratic watering. Apply Calcium Nitrate @ 2g/L foliar spray and maintain uniform soil moisture via drip.`
      },
      {
        keywords: ['irrigation', 'water', 'drip', 'watering', 'moisture'],
        reply: `**Smart Irrigation Best Practices:**
- Maintain soil moisture between **40% - 65%** for field crops.
- **Drip Fertigation:** Saves up to 45% water compared to flood irrigation and reduces foliar fungal diseases.
- Check our **IoT Telemetry** and **Agro-Weather** tabs for live moisture tracking and evapotranspiration rates.`
      },
      {
        keywords: ['organic', 'bio', 'neem', 'jeevamrutha', 'natural'],
        reply: `**Organic Agronomy Practices:**
1. **Jeevamrutha:** Mix 10kg cow dung + 10L cow urine + 2kg jaggery + 2kg pulse flour in 200L water. Ferment 4 days; apply 200L/acre for soil microbial boom.
2. **Neem Seed Kernel Extract (NSKE 5%):** Highly effective natural deterrent against chewing and sucking pests.
3. **Trichoderma viride:** Biological control agent against soil-borne root rot and wilt pathogens.`
      },
      {
        keywords: ['subsidy', 'scheme', 'government', 'pm-kisan', 'kusum'],
        reply: `**Agricultural Government Schemes & Subsidies:**
- **PM-KUSUM Scheme:** 60% subsidy on Solar Agricultural Water Pumps.
- **Pradhan Mantri Krishi Sinchayee Yojana (PMKSY):** Up to 55% subsidy for micro-irrigation (Drip & Sprinkler systems) for small/marginal farmers.
- **Soil Health Card Scheme:** Free comprehensive 12-parameter soil testing at local Krishi Vigyan Kendras (KVK).`
      },
      {
        keywords: ['yellow', 'yellowing', 'leaves turning yellow', 'chlorosis'],
        reply: `**Diagnosis for Yellowing Leaves (Chlorosis):**
1. **Lower leaves yellowing first:** Nitrogen (N) deficiency or root waterlogging.
2. **Interveinal yellowing (veins stay green):** Iron (Fe) or Magnesium (Mg) deficiency. Spray Chelated Micronutrient mix @ 1.5g/L.
3. **Yellow leaf margins:** Potassium (K) deficiency.`
      }
    ];

    // Initial greeting
    this.addMessage(
      `Hello! I am **Akshi AI**, your 24/7 Smart Agronomist. Ask me anything about crop planning, plant diseases, soil nutrients, IoT irrigation, organic remedies, or government agricultural subsidies!`,
      'bot'
    );
  }

  addMessage(text, sender = 'bot') {
    this.messages.push({ text, sender, time: new Date() });
    this.renderMessages();

    if (sender === 'bot' && this.speechEnabled && this.synth) {
      this.speak(text.replace(/[*_#`]/g, ''));
    }
  }

  speak(text) {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    this.synth.speak(utterance);
  }

  toggleSpeech() {
    this.speechEnabled = !this.speechEnabled;
    const btn = document.getElementById('voiceToggleBtn');
    if (btn) {
      btn.innerHTML = this.speechEnabled 
        ? '<i class="fas fa-volume-high"></i> Voice ON' 
        : '<i class="fas fa-volume-xmark"></i> Voice OFF';
      btn.className = this.speechEnabled ? 'btn btn-amber btn-sm' : 'btn btn-secondary btn-sm';
    }
  }

  processUserQuery(query) {
    if (!query || query.trim() === '') return;
    const cleanQuery = query.trim().toLowerCase();
    this.addMessage(query, 'user');

    // Simulate natural AI thinking delay
    setTimeout(() => {
      let matchedReply = null;
      for (const item of this.knowledgeBase) {
        if (item.keywords.some(kw => cleanQuery.includes(kw))) {
          matchedReply = item.reply;
          break;
        }
      }

      if (!matchedReply) {
        matchedReply = `Thank you for your agronomy question regarding **"${query}"**. 
Based on general crop physiology, ensure optimal soil pH (6.0 - 7.0), balanced NPK fertilization, and adequate root aeration. You can also explore our **Crop Recommendation Engine** or **Plant Disease Scanner** tabs for specialized AI diagnostics!`;
      }

      this.addMessage(matchedReply, 'bot');
    }, 450);
  }

  renderMessages() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    container.innerHTML = this.messages.map(m => `
      <div class="chat-bubble ${m.sender}">
        <div class="chat-bubble-sender">
          <i class="fas ${m.sender === 'bot' ? 'fa-robot' : 'fa-user'}"></i>
          ${m.sender === 'bot' ? 'Akshi Agronomist AI' : 'Farmer / You'}
        </div>
        <div class="chat-bubble-content">
          ${this.formatMarkdown(m.text)}
        </div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  }

  formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(0,0,0,0.3); padding:2px 6px; border-radius:4px;">$1</code>')
      .replace(/\n/g, '<br/>');
  }
}

window.chatAssistant = new ChatAssistant();
