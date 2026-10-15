/* ==========================================================================
   CodeAlpha AI Internship - Task 3: Music Generation with AI Engine
   WebAudio API Synth, Algorithmic Note Sequence Synthesis, Piano Roll & MIDI Exporter
   ========================================================================== */

const NOTE_FREQUENCIES = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
};

const GENRE_SCALES = {
  'classical': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'G5'],
  'jazz': ['C4', 'D#4', 'F4', 'F#4', 'G4', 'A#4', 'C5', 'D#5', 'F5'],
  'ambient': ['C3', 'G3', 'C4', 'E4', 'G4', 'B4', 'D5', 'E5', 'G5', 'B5'],
  'synthwave': ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'E5', 'G5']
};

class AIMusicGenerator {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.notesSequence = [];
    this.currentStep = 0;
    this.playbackTimer = null;
    this.bpm = 120;

    this.genreSelect = document.getElementById('musicGenreSelect');
    this.tempoInput = document.getElementById('tempoInput');
    this.tempoValDisplay = document.getElementById('tempoValDisplay');
    this.generateBtn = document.getElementById('generateMusicBtn');
    this.playBtn = document.getElementById('playMusicBtn');
    this.stopBtn = document.getElementById('stopMusicBtn');
    this.downloadMidiBtn = document.getElementById('downloadMidiBtn');
    this.pianoRollCanvas = document.getElementById('pianoRollCanvas');
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.generateNewSequence();
    this.drawPianoRoll();
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  bindEvents() {
    if (this.generateBtn) {
      this.generateBtn.addEventListener('click', () => {
        this.stopPlayback();
        this.generateNewSequence();
        this.drawPianoRoll();
        window.showToast?.("Generated new AI music note sequence!", "info");
      });
    }

    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.togglePlayback());
    }

    if (this.stopBtn) {
      this.stopBtn.addEventListener('click', () => this.stopPlayback());
    }

    if (this.downloadMidiBtn) {
      this.downloadMidiBtn.addEventListener('click', () => this.exportMIDI());
    }

    if (this.tempoInput) {
      this.tempoInput.addEventListener('input', (e) => {
        this.bpm = parseInt(e.target.value);
        if (this.tempoValDisplay) this.tempoValDisplay.textContent = `${this.bpm} BPM`;
      });
    }
  }

  generateNewSequence() {
    const genre = this.genreSelect ? this.genreSelect.value : 'classical';
    const scale = GENRE_SCALES[genre] || GENRE_SCALES['classical'];
    
    const stepsCount = 32; // 32 sixteenth notes (2 bars of 4/4)
    this.notesSequence = [];

    let currentScaleIdx = Math.floor(scale.length / 2);

    for (let step = 0; step < stepsCount; step++) {
      // 80% chance to play a note, 20% rest
      if (Math.random() > 0.2) {
        // Markov-like step movement (-2, -1, 0, +1, +2)
        const stepDelta = Math.floor(Math.random() * 5) - 2;
        currentScaleIdx = Math.max(0, Math.min(scale.length - 1, currentScaleIdx + stepDelta));
        
        const noteName = scale[currentScaleIdx];
        const durationSteps = Math.min(4, Math.floor(Math.random() * 3) + 1); // 1 to 3 sixteenths

        this.notesSequence.push({
          step: step,
          note: noteName,
          freq: NOTE_FREQUENCIES[noteName] || 440,
          duration: durationSteps,
          pitchIdx: currentScaleIdx
        });
      }
    }
  }

  playSynthNote(freq, durationSec) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    const waveType = this.genreSelect ? 
      (this.genreSelect.value === 'synthwave' ? 'sawtooth' : 
       this.genreSelect.value === 'jazz' ? 'triangle' : 'sine') : 'sine';

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    // ADSR Envelope
    gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.03); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationSec); // Decay/Release

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + durationSec);
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    this.initAudioContext();
    this.isPlaying = true;
    this.currentStep = 0;
    if (this.playBtn) this.playBtn.innerHTML = "⏸ Pause AI Synth";
    
    this.runPlaybackLoop();
  }

  runPlaybackLoop() {
    if (!this.isPlaying) return;

    const sixteenthNoteDurationSec = (60 / this.bpm) / 4;

    // Find notes starting on this step
    const currentNotes = this.notesSequence.filter(n => n.step === this.currentStep);
    currentNotes.forEach(n => {
      this.playSynthNote(n.freq, n.duration * sixteenthNoteDurationSec);
    });

    this.drawPianoRoll();

    this.currentStep = (this.currentStep + 1) % 32;

    this.playbackTimer = setTimeout(() => {
      this.runPlaybackLoop();
    }, sixteenthNoteDurationSec * 1000);
  }

  stopPlayback() {
    this.isPlaying = false;
    if (this.playbackTimer) clearTimeout(this.playbackTimer);
    if (this.playBtn) this.playBtn.innerHTML = "▶ Play AI Synth";
    this.currentStep = 0;
    this.drawPianoRoll();
  }

  drawPianoRoll() {
    if (!this.pianoRollCanvas) return;
    const ctx = this.pianoRollCanvas.getContext('2d');
    const width = this.pianoRollCanvas.clientWidth || 600;
    const height = this.pianoRollCanvas.clientHeight || 300;

    this.pianoRollCanvas.width = width;
    this.pianoRollCanvas.height = height;

    // Background
    ctx.fillStyle = "#0c1322";
    ctx.fillRect(0, 0, width, height);

    // Draw Grid
    const stepWidth = width / 32;
    const rowHeight = height / 12;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 32; i++) {
      ctx.beginPath();
      ctx.moveTo(i * stepWidth, 0);
      ctx.lineTo(i * stepWidth, height);
      ctx.stroke();
    }

    for (let j = 0; j <= 12; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * rowHeight);
      ctx.lineTo(width, j * rowHeight);
      ctx.stroke();
    }

    // Draw Notes
    this.notesSequence.forEach(n => {
      const x = n.step * stepWidth;
      const y = height - ((n.pitchIdx + 1) * rowHeight);
      const w = n.duration * stepWidth - 2;
      const h = rowHeight - 2;

      const isCurrent = (n.step === this.currentStep && this.isPlaying);

      ctx.fillStyle = isCurrent ? "#06b6d4" : "#6366f1";
      ctx.shadowColor = isCurrent ? "#06b6d4" : "rgba(99, 102, 241, 0.5)";
      ctx.shadowBlur = isCurrent ? 15 : 6;

      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 4);
      ctx.fill();
    });

    ctx.shadowBlur = 0; // reset shadow

    // Draw Playhead
    if (this.isPlaying) {
      const px = this.currentStep * stepWidth;
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, height);
      ctx.stroke();
    }
  }

  // Create & Download Standard MIDI File (.mid format 0)
  exportMIDI() {
    const midiBytes = [];

    // MIDI Header Track: MThd
    midiBytes.push(0x4D, 0x54, 0x68, 0x64); // 'MThd'
    midiBytes.push(0x00, 0x00, 0x00, 0x06); // Header length 6 bytes
    midiBytes.push(0x00, 0x00);             // Format 0 (single track)
    midiBytes.push(0x00, 0x01);             // 1 track
    midiBytes.push(0x00, 0x60);             // 96 ticks per quarter note

    // Track Header: MTrk
    const trackEvents = [];

    // Set Tempo Event (120 BPM = 500,000 microseconds per quarter note)
    trackEvents.push(0x00, 0xFF, 0x51, 0x03, 0x07, 0xA1, 0x20);

    // Convert notes into MIDI events
    let lastTick = 0;
    const ticksPerStep = 24; // 96 / 4 = 24 ticks per sixteenth note

    this.notesSequence.sort((a, b) => a.step - b.step).forEach(n => {
      const startTick = n.step * ticksPerStep;
      const deltaTick = startTick - lastTick;
      
      // Variable Length Quantity for delta time
      trackEvents.push(...this.toVLQ(deltaTick));
      
      // Note On: Channel 0, Note Number 60 + pitchIdx, Velocity 90
      const midiPitch = 60 + (n.pitchIdx % 12);
      trackEvents.push(0x90, midiPitch, 0x5A);

      // Note Off after duration
      const durationTicks = n.duration * ticksPerStep;
      trackEvents.push(...this.toVLQ(durationTicks));
      trackEvents.push(0x80, midiPitch, 0x00);

      lastTick = startTick + durationTicks;
    });

    // End of Track event
    trackEvents.push(0x00, 0xFF, 0x2F, 0x00);

    // Track length
    const trackLen = trackEvents.length;
    midiBytes.push(0x4D, 0x54, 0x72, 0x6B); // 'MTrk'
    midiBytes.push((trackLen >> 24) & 0xFF, (trackLen >> 16) & 0xFF, (trackLen >> 8) & 0xFF, trackLen & 0xFF);
    midiBytes.push(...trackEvents);

    // Create Blob & Trigger Download
    const blob = new Blob([new Uint8Array(midiBytes)], { type: 'audio/midi' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CodeAlpha_AI_Generated_Music_${Date.now()}.mid`;
    link.click();

    window.showToast?.("MIDI file exported and downloaded successfully!", "success");
  }

  toVLQ(value) {
    const buffer = [];
    let val = value;
    buffer.push(val & 0x7F);
    val >>= 7;
    while (val > 0) {
      buffer.unshift((val & 0x7F) | 0x80);
      val >>= 7;
    }
    return buffer;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.aiMusicApp = new AIMusicGenerator();
});
