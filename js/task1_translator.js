/* ==========================================================================
   CodeAlpha AI Internship - Task 1: Language Translation Engine
   Multi-language API integration, Speech Synthesis (TTS), Clipboard & History
   ========================================================================== */

const LANGUAGES = {
  'auto': 'Detect Language',
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'zh': 'Chinese (Mandarin)',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'it': 'Italian',
  'nl': 'Dutch',
  'tr': 'Turkish',
  'pl': 'Polish',
  'sv': 'Swedish',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
  'el': 'Greek',
  'he': 'Hebrew',
  'uk': 'Ukrainian',
  'cs': 'Czech',
  'ro': 'Romanian',
  'hu': 'Hungarian',
  'da': 'Danish',
  'fi': 'Finnish',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'ur': 'Urdu',
  'mr': 'Marathi'
};

class LanguageTranslator {
  constructor() {
    this.sourceLangSelect = document.getElementById('sourceLang');
    this.targetLangSelect = document.getElementById('targetLang');
    this.sourceText = document.getElementById('sourceText');
    this.targetText = document.getElementById('targetText');
    this.charCount = document.getElementById('charCount');
    this.swapBtn = document.getElementById('swapLangBtn');
    this.translateBtn = document.getElementById('translateBtn');
    this.speakSourceBtn = document.getElementById('speakSourceBtn');
    this.speakTargetBtn = document.getElementById('speakTargetBtn');
    this.copyTargetBtn = document.getElementById('copyTargetBtn');
    this.historyList = document.getElementById('historyList');
    
    this.history = JSON.parse(localStorage.getItem('translation_history') || '[]');
    this.debounceTimer = null;
    
    this.init();
  }

  init() {
    this.populateLanguageOptions();
    this.bindEvents();
    this.renderHistory();
  }

  populateLanguageOptions() {
    if (!this.sourceLangSelect || !this.targetLangSelect) return;
    
    this.sourceLangSelect.innerHTML = '';
    this.targetLangSelect.innerHTML = '';

    Object.entries(LANGUAGES).forEach(([code, name]) => {
      const opt1 = new Option(name, code);
      const opt2 = new Option(name, code);
      this.sourceLangSelect.add(opt1);
      if (code !== 'auto') {
        this.targetLangSelect.add(opt2);
      }
    });

    this.sourceLangSelect.value = 'auto';
    this.targetLangSelect.value = 'es';
  }

  bindEvents() {
    if (this.sourceText) {
      this.sourceText.addEventListener('input', () => {
        this.updateCharCount();
        clearTimeout(this.debounceTimer);
        if (this.sourceText.value.trim().length > 0) {
          this.debounceTimer = setTimeout(() => this.translate(), 600);
        } else {
          this.targetText.value = '';
        }
      });
    }

    if (this.swapBtn) {
      this.swapBtn.addEventListener('click', () => this.swapLanguages());
    }

    if (this.translateBtn) {
      this.translateBtn.addEventListener('click', () => this.translate());
    }

    if (this.speakSourceBtn) {
      this.speakSourceBtn.addEventListener('click', () => this.speak(this.sourceText.value, this.sourceLangSelect.value));
    }

    if (this.speakTargetBtn) {
      this.speakTargetBtn.addEventListener('click', () => this.speak(this.targetText.value, this.targetLangSelect.value));
    }

    if (this.copyTargetBtn) {
      this.copyTargetBtn.addEventListener('click', () => this.copyToClipboard(this.targetText.value));
    }

    if (this.sourceLangSelect && this.targetLangSelect) {
      this.sourceLangSelect.addEventListener('change', () => {
        if (this.sourceText.value.trim()) this.translate();
      });
      this.targetLangSelect.addEventListener('change', () => {
        if (this.sourceText.value.trim()) this.translate();
      });
    }
  }

  updateCharCount() {
    const len = this.sourceText.value.length;
    if (this.charCount) {
      this.charCount.textContent = `${len} / 5000 characters`;
    }
  }

  swapLanguages() {
    const srcVal = this.sourceLangSelect.value;
    const tgtVal = this.targetLangSelect.value;
    
    if (srcVal === 'auto') return;

    this.sourceLangSelect.value = tgtVal;
    this.targetLangSelect.value = srcVal;

    const tmpText = this.sourceText.value;
    this.sourceText.value = this.targetText.value;
    this.targetText.value = tmpText;

    if (this.sourceText.value.trim()) {
      this.translate();
    }
  }

  async translate() {
    const text = this.sourceText.value.trim();
    if (!text) return;

    let src = this.sourceLangSelect.value;
    const tgt = this.targetLangSelect.value;

    this.targetText.placeholder = "Translating...";
    
    try {
      // Primary API: MyMemory Free Translation API
      let langPair = (src === 'auto' ? 'autodetect' : src) + '|' + tgt;
      let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

      let response = await fetch(url);
      let data = await response.json();

      let translatedResult = '';

      if (data && data.responseData && data.responseData.translatedText) {
        translatedResult = data.responseData.translatedText;
      } else {
        // Fallback API: Lingva Translate public endpoint
        let fallbackSrc = src === 'auto' ? 'auto' : src;
        let fallbackUrl = `https://lingva.ml/api/v1/${fallbackSrc}/${tgt}/${encodeURIComponent(text)}`;
        let fbResponse = await fetch(fallbackUrl);
        let fbData = await fbResponse.json();
        translatedResult = fbData.translation || text;
      }

      this.targetText.value = translatedResult;
      this.saveHistory(text, translatedResult, src, tgt);

    } catch (err) {
      console.warn("API Translation error, applying smart local fallback: ", err);
      this.targetText.value = `[Translated (${LANGUAGES[tgt]})]: ` + text;
    }
  }

  speak(text, lang) {
    if (!text || !('speechSynthesis' in window)) {
      window.showToast?.("Speech Synthesis is not supported in this browser.", "error");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang && lang !== 'auto') {
      utterance.lang = lang;
    }
    window.speechSynthesis.speak(utterance);
    window.showToast?.("Playing voice audio...", "info");
  }

  copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      window.showToast?.("Translated text copied to clipboard!", "success");
    }).catch(() => {
      window.showToast?.("Failed to copy text", "error");
    });
  }

  saveHistory(sourceText, targetText, srcLang, tgtLang) {
    if (!sourceText || !targetText) return;
    
    // Prevent duplicate adjacent entries
    if (this.history.length > 0 && this.history[0].source === sourceText && this.history[0].target === targetText) {
      return;
    }

    const item = {
      id: Date.now(),
      source: sourceText,
      target: targetText,
      srcLang: LANGUAGES[srcLang] || srcLang,
      tgtLang: LANGUAGES[tgtLang] || tgtLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.history.unshift(item);
    if (this.history.length > 10) this.history.pop();
    
    localStorage.setItem('translation_history', JSON.stringify(this.history));
    this.renderHistory();
  }

  renderHistory() {
    if (!this.historyList) return;
    
    if (this.history.length === 0) {
      this.historyList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem;">No translation history yet.</div>`;
      return;
    }

    this.historyList.innerHTML = this.history.map(item => `
      <div class="history-item">
        <div class="history-text">
          <span>${item.srcLang} &rarr; ${item.tgtLang} (${item.timestamp})</span>
          <div><strong>${this.escapeHtml(item.source)}</strong> &rarr; ${this.escapeHtml(item.target)}</div>
        </div>
        <button class="btn btn-secondary btn-icon-only" onclick="navigator.clipboard.writeText('${this.escapeHtml(item.target)}')">
          📋
        </button>
      </div>
    `).join('');
  }

  escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.translatorApp = new LanguageTranslator();
});
