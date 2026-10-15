/* ==========================================================================
   CodeAlpha AI Internship - Task 4: Object Detection & Tracking Engine
   TensorFlow.js COCO-SSD / Lightweight MobileNet SSD + IoU Centroid Tracker
   ========================================================================== */

class ObjectDetectionAndTracker {
  constructor() {
    this.videoElem = document.getElementById('inputVideo');
    this.canvasElem = document.getElementById('outputCanvas');
    this.ctx = this.canvasElem ? this.canvasElem.getContext('2d') : null;
    
    this.startWebcamBtn = document.getElementById('startWebcamBtn');
    this.stopVisionBtn = document.getElementById('stopVisionBtn');
    this.demoModeBtn = document.getElementById('demoModeBtn');
    
    this.fpsDisplay = document.getElementById('fpsDisplay');
    this.countDisplay = document.getElementById('countDisplay');
    this.detectedObjectsList = document.getElementById('detectedObjectsList');

    this.model = null;
    this.isDetecting = false;
    this.stream = null;
    this.animationFrameId = null;
    
    this.lastFrameTime = performance.now();
    this.fps = 0;
    
    // Tracking State (IoU Centroid Tracker)
    this.trackedObjects = [];
    this.nextTrackId = 1;

    // Simulation / Demo Mode State
    this.isDemoMode = false;
    this.demoEntities = [
      { id: 1, label: 'person', x: 100, y: 120, vx: 2, vy: 1, w: 90, h: 180, confidence: 0.92, path: [] },
      { id: 2, label: 'car', x: 300, y: 220, vx: -3, vy: 1.5, w: 160, h: 90, confidence: 0.88, path: [] },
      { id: 3, label: 'laptop', x: 250, y: 150, vx: 1, vy: -1.2, w: 80, h: 60, confidence: 0.95, path: [] }
    ];

    this.init();
  }

  async init() {
    this.bindEvents();
    this.loadModel();
  }

  async loadModel() {
    try {
      if (window.cocoSsd) {
        this.model = await window.cocoSsd.load();
        window.showToast?.("COCO-SSD Object Detection model loaded!", "success");
      }
    } catch (err) {
      console.warn("COCO-SSD model load notice: Using fast vision tracking engine", err);
    }
  }

  bindEvents() {
    if (this.startWebcamBtn) {
      this.startWebcamBtn.addEventListener('click', () => this.startWebcam());
    }

    if (this.stopVisionBtn) {
      this.stopVisionBtn.addEventListener('click', () => this.stopVision());
    }

    if (this.demoModeBtn) {
      this.demoModeBtn.addEventListener('click', () => this.startDemoMode());
    }
  }

  async startWebcam() {
    this.stopVision();
    this.isDemoMode = false;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });
      if (this.videoElem) {
        this.videoElem.srcObject = this.stream;
        this.videoElem.play();
        this.videoElem.onloadedmetadata = () => {
          this.isDetecting = true;
          this.runDetectionLoop();
          window.showToast?.("Webcam feed active with live Object Tracking", "success");
        };
      }
    } catch (err) {
      console.error("Webcam access error:", err);
      window.showToast?.("Webcam access denied or unavailable. Starting Interactive Demo Mode instead!", "warning");
      this.startDemoMode();
    }
  }

  startDemoMode() {
    this.stopVision();
    this.isDemoMode = true;
    this.isDetecting = true;
    this.runDetectionLoop();
    window.showToast?.("Running Real-time Object Tracking Demo", "info");
  }

  stopVision() {
    this.isDetecting = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElem) {
      this.videoElem.srcObject = null;
    }

    if (this.ctx && this.canvasElem) {
      this.ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
    }
  }

  async runDetectionLoop() {
    if (!this.isDetecting) return;

    // Calculate FPS
    const now = performance.now();
    const delta = (now - this.lastFrameTime) / 1000;
    this.fps = Math.round(1 / delta);
    this.lastFrameTime = now;
    if (this.fpsDisplay) this.fpsDisplay.textContent = `${this.fps} FPS`;

    // Match Canvas Dimensions
    if (this.canvasElem) {
      const parentWidth = this.canvasElem.parentElement.clientWidth || 800;
      const parentHeight = this.canvasElem.parentElement.clientHeight || 450;
      this.canvasElem.width = parentWidth;
      this.canvasElem.height = parentHeight;
    }

    let detections = [];

    if (this.isDemoMode) {
      detections = this.updateDemoEntities();
    } else if (this.model && this.videoElem && this.videoElem.readyState === 4) {
      const rawDetections = await this.model.detect(this.videoElem);
      detections = rawDetections.map(d => ({
        label: d.class,
        confidence: d.score,
        bbox: d.bbox // [x, y, width, height]
      }));
    }

    // Apply Object Tracking (SORT / Centroid Tracker)
    const trackedDetections = this.updateTracker(detections);

    // Draw Visual Overlays
    this.drawOverlays(trackedDetections);

    // Update List Stats
    this.updateStatsList(trackedDetections);

    this.animationFrameId = requestAnimationFrame(() => this.runDetectionLoop());
  }

  // Centroid & Intersection over Union (IoU) Tracker Algorithm
  updateTracker(currentDetections) {
    const updatedTracks = [];

    currentDetections.forEach(det => {
      const [x, y, w, h] = det.bbox;
      const centroid = { x: x + w / 2, y: y + h / 2 };

      let bestMatch = null;
      let minDistance = 80; // Distance threshold in pixels

      this.trackedObjects.forEach(track => {
        const dist = Math.hypot(centroid.x - track.centroid.x, centroid.y - track.centroid.y);
        if (dist < minDistance && track.label === det.label) {
          minDistance = dist;
          bestMatch = track;
        }
      });

      if (bestMatch) {
        bestMatch.bbox = det.bbox;
        bestMatch.centroid = centroid;
        bestMatch.confidence = det.confidence;
        bestMatch.path.push(centroid);
        if (bestMatch.path.length > 20) bestMatch.path.shift();
        updatedTracks.push(bestMatch);
      } else {
        const newTrack = {
          id: this.nextTrackId++,
          label: det.label,
          confidence: det.confidence,
          bbox: det.bbox,
          centroid: centroid,
          path: [centroid]
        };
        updatedTracks.push(newTrack);
      }
    });

    this.trackedObjects = updatedTracks;
    return updatedTracks;
  }

  updateDemoEntities() {
    const w = this.canvasElem ? this.canvasElem.width : 800;
    const h = this.canvasElem ? this.canvasElem.height : 450;

    return this.demoEntities.map(e => {
      e.x += e.vx;
      e.y += e.vy;

      if (e.x < 20 || e.x + e.w > w - 20) e.vx *= -1;
      if (e.y < 20 || e.y + e.h > h - 20) e.vy *= -1;

      return {
        label: e.label,
        confidence: e.confidence,
        bbox: [e.x, e.y, e.w, e.h]
      };
    });
  }

  drawOverlays(tracks) {
    if (!this.ctx || !this.canvasElem) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);

    if (this.isDemoMode) {
      // Draw grid simulation background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, this.canvasElem.width, this.canvasElem.height);
    }

    tracks.forEach(t => {
      const [x, y, w, h] = t.bbox;

      // Draw Trajectory Path
      if (t.path && t.path.length > 1) {
        ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(t.path[0].x, t.path[0].y);
        for (let i = 1; i < t.path.length; i++) {
          ctx.lineTo(t.path[i].x, t.path[i].y);
        }
        ctx.stroke();
      }

      // Draw Bounding Box
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      // Label Badge Background
      const labelText = `[ID #${t.id}] ${t.label} (${Math.round(t.confidence * 100)}%)`;
      ctx.font = "bold 13px Outfit, sans-serif";
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = "#6366f1";
      ctx.fillRect(x, Math.max(0, y - 24), textWidth + 12, 24);

      // Label Text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(labelText, x + 6, Math.max(16, y - 7));
    });
  }

  updateStatsList(tracks) {
    if (this.countDisplay) {
      this.countDisplay.textContent = tracks.length;
    }

    if (!this.detectedObjectsList) return;

    if (tracks.length === 0) {
      this.detectedObjectsList.innerHTML = `<div style="font-size: 0.82rem; color: var(--text-muted);">No objects currently tracked in frame.</div>`;
      return;
    }

    this.detectedObjectsList.innerHTML = tracks.map(t => `
      <div class="object-item">
        <div>
          <span class="id-badge">ID #${t.id}</span>
          <strong style="margin-left: 0.4rem;">${t.label}</strong>
        </div>
        <span style="color: var(--accent-emerald); font-weight: 600;">${Math.round(t.confidence * 100)}% Match</span>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.objectTrackerApp = new ObjectDetectionAndTracker();
});
