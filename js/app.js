/* ==========================================================================
   CodeAlpha AI Internship - Application Router & Main Controller
   ========================================================================== */

class AppController {
  constructor() {
    this.navLinks = document.querySelectorAll('.nav-link');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.toastContainer = document.getElementById('toastContainer');
    
    this.init();
  }

  init() {
    this.bindTabEvents();
    this.initToastSystem();
  }

  bindTabEvents() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetTabId = link.getAttribute('data-tab');
        this.switchTab(targetTabId, link);
      });
    });
  }

  switchTab(tabId, clickedLink) {
    // Active Link State
    this.navLinks.forEach(l => l.classList.remove('active'));
    clickedLink.classList.add('active');

    // Tab Content Display
    this.tabContents.forEach(tab => {
      if (tab.id === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Trigger tab-specific lifecycle callbacks
    if (tabId === 'task3' && window.aiMusicApp) {
      window.aiMusicApp.drawPianoRoll();
    }

    if (tabId === 'task4' && window.objectTrackerApp) {
      // Prompt user option or start demo if not running
      if (!window.objectTrackerApp.isDetecting) {
        window.objectTrackerApp.startDemoMode();
      }
    } else if (tabId !== 'task4' && window.objectTrackerApp) {
      window.objectTrackerApp.stopVision();
    }
  }

  initToastSystem() {
    window.showToast = (message, type = 'info') => {
      if (!this.toastContainer) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
      toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

      this.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appController = new AppController();
});
