# CodeAlpha Artificial Intelligence Internship Project Suite

Welcome to the complete solution repository for the **CodeAlpha Artificial Intelligence Internship**. This repository implements **all 4 AI tasks** specified in the curriculum, featuring both an interactive **Master Web UI Portal** and a **Full Python AI Suite**.

---

## 🚀 Tasks Overview & Features

### ✅ TASK 1: Language Translation Tool
- **Web UI**: Multi-language selection (30+ languages), auto language detection, instant API translation (MyMemory API & Lingva fallbacks), **Text-to-Speech (TTS)** voice synthesis for source and translated text, swap languages, copy to clipboard, and translation history log.
- **Python Source**: `python_backend/task1_translator/translator.py` with multi-engine backend (`deep-translator` API integration).

### ✅ TASK 2: Chatbot for FAQs
- **Web UI**: Interactive AI Support Chatbot using **TF-IDF Vectorization** and **Cosine Similarity**. Displays confidence scores, intent matching, recommended quick-pick questions, and custom FAQ dataset storage.
- **Python Source**: `python_backend/task2_faq_chatbot/chatbot.py` powered by NLTK preprocessing and `scikit-learn` TF-IDF Vectorizer + Cosine Similarity.

### ✅ TASK 3: Music Generation with AI
- **Web UI**: AI Music Studio with Web Audio synthesizer, visual **Piano Roll Canvas**, multi-genre model presets (Classical, Jazz, Ambient, Synthwave), tempo/BPM controls, live synth playback, and standard **MIDI file export (`.mid`)**.
- **Python Source**: `python_backend/task3_music_generator/generate_midi.py` using `music21` for note sequence parsing and MIDI file creation.

### ✅ TASK 4: Object Detection and Tracking
- **Web UI**: Real-time object detection & tracking in browser using TensorFlow.js COCO-SSD + **Centroid / IoU Tracking (SORT)**. Features bounding boxes, trajectory path drawing, persistent tracking IDs (`#1`, `#2`, `#3`), live FPS counter, and tracked object count leaderboard.
- **Python Source**: `python_backend/task4_object_detection/object_tracker.py` using OpenCV DNN / MobileNet-SSD / Haar Cascades + Centroid Tracker.

---

## 🛠️ How to Run the Projects

### 🌐 1. Interactive Master Web Application (No Setup Needed!)
Simply open `index.html` in any web browser, or launch a local HTTP server:

```bash
# Optional: Launch local development server
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

### 🐍 2. Python AI Backend Suite
To run the standalone Python implementation scripts:

1. Navigate to the `python_backend` directory:
   ```bash
   cd python_backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the interactive Python CLI Hub:
   ```bash
   python run_all_tasks.py
   ```

---

## 📁 Repository Structure

```
.
├── index.html                       # Master AI Portal UI
├── css/
│   └── main.css                     # Dark glassmorphism styling
├── js/
│   ├── app.js                       # Router & notification system
│   ├── task1_translator.js          # Task 1 Language Translation engine
│   ├── task2_faq_chatbot.js         # Task 2 NLP TF-IDF Chatbot engine
│   ├── task3_music_generator.js     # Task 3 AI Music Studio & MIDI exporter
│   └── task4_object_detection.js    # Task 4 Object detection & tracking engine
├── python_backend/
│   ├── requirements.txt             # Python dependencies
│   ├── run_all_tasks.py             # CLI hub launcher
│   ├── task1_translator/
│   │   └── translator.py            # Task 1 Python translator
│   ├── task2_faq_chatbot/
│   │   ├── chatbot.py               # Task 2 Python chatbot
│   │   └── faqs.json                # FAQ dataset
│   ├── task3_music_generator/
│   │   └── generate_midi.py         # Task 3 Python MIDI generator
│   └── task4_object_detection/
│       └── object_tracker.py        # Task 4 OpenCV object tracker
└── README.md                        # Documentation & submission guide
```

---

## 📌 CodeAlpha Internship Submission Instructions

1. **Upload Source Code to GitHub**:
   - Create a GitHub repository named: `CodeAlpha_AI_Tasks`
   - Push all project files to the repository.

2. **Record LinkedIn Video Explanation**:
   - Record a 1–2 minute video demonstrating the web dashboard (`index.html`) or running `python run_all_tasks.py`.
   - Post the video on LinkedIn tagging `@CodeAlpha` with your GitHub repo link.

3. **Submit Submission Form**:
   - Submit your completed GitHub link and LinkedIn post URL in the official CodeAlpha WhatsApp submission form.

---
*Created for the CodeAlpha Artificial Intelligence Internship Program.*
