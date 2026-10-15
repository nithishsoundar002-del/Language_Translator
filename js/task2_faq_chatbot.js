/* ==========================================================================
   CodeAlpha AI Internship - Task 2: Chatbot for FAQs Engine
   NLP Preprocessing, TF-IDF Vectorization, Cosine Similarity & Intent Matching
   ========================================================================== */

const DEFAULT_FAQS = [
  // CodeAlpha Internship Category
  { id: 1, category: "CodeAlpha Internship", question: "What is CodeAlpha AI Internship program?", answer: "CodeAlpha's AI Internship is a hands-on program offering real-world experience in AI model development, machine learning workflows, NLP, computer vision, and AI software engineering." },
  { id: 2, category: "CodeAlpha Internship", question: "How many tasks do I need to submit for completion?", answer: "To be eligible for the internship certificate, participants must complete a minimum of 2 or 3 tasks from the assigned domain." },
  { id: 3, category: "CodeAlpha Internship", question: "What are the perks of completing the internship?", answer: "Perks include an Internship Offer Letter, QR-verified Completion Certificate, Unique ID Certificate, Letter of Recommendation (LOR based on performance), and Placement Support." },
  { id: 4, category: "CodeAlpha Internship", question: "Where do I submit my completed project?", answer: "You must upload your code to GitHub in a repository named 'CodeAlpha_ProjectName' and submit the GitHub link along with a video explanation via the official WhatsApp submission form." },
  
  // Artificial Intelligence & Machine Learning
  { id: 5, category: "AI & ML", question: "What is Machine Learning?", answer: "Machine Learning (ML) is a branch of Artificial Intelligence focused on building systems that learn from data and improve performance over time without explicit programming." },
  { id: 6, category: "AI & ML", question: "What is Natural Language Processing (NLP)?", answer: "Natural Language Processing (NLP) enables computers to understand, interpret, process, and generate human languages using algorithms like TF-IDF, Word Embeddings, Transformers, and LLMs." },
  { id: 7, category: "AI & ML", question: "How does Cosine Similarity work in chatbot matching?", answer: "Cosine similarity calculates the dot product of two TF-IDF text vectors divided by the product of their lengths, measuring the cosine of the angle between them to determine semantic similarity (from 0 to 100%)." },
  { id: 8, category: "AI & ML", question: "What is Object Detection and Tracking?", answer: "Object Detection identifies and locates objects within video frames using bounding boxes, while Tracking (like SORT/DeepSORT) assigns unique persistent IDs to follow objects across consecutive frames." },

  // Programming & Web
  { id: 9, category: "Programming", question: "Which Python libraries are best for AI and NLP?", answer: "Popular NLP & AI libraries in Python include NLTK, spaCy, scikit-learn, TensorFlow, PyTorch, OpenCV, music21, and transformers." },
  { id: 10, category: "Programming", question: "How do I install project dependencies?", answer: "Run `pip install -r requirements.txt` in your command terminal inside the python_backend folder." }
];

class FAQChatbot {
  constructor() {
    this.faqs = JSON.parse(localStorage.getItem('faq_dataset') || JSON.stringify(DEFAULT_FAQS));
    this.stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'in', 'on', 'at',
      'to', 'for', 'from', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
      'of', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
      'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
      'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
      'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'what', 'i', 'do'
    ]);

    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendChatBtn = document.getElementById('sendChatBtn');
    this.faqTopicsContainer = document.getElementById('faqTopicsContainer');
    
    this.vocabulary = [];
    this.tfidfMatrix = [];

    this.init();
  }

  init() {
    this.buildTFIDFModel();
    this.renderTopics();
    this.bindEvents();
    
    // Add initial bot welcome message
    if (this.chatMessages && this.chatMessages.children.length === 0) {
      this.addBotMessage("Hello! 👋 I am your CodeAlpha AI Assistant. Ask me anything about the internship, Machine Learning, NLP, Cosine Similarity, or AI tasks!");
    }
  }

  // Step 1: Tokenize & Clean Text
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(token => token.length > 1 && !this.stopWords.has(token));
  }

  // Step 2: Build TF-IDF Model for Dataset
  buildTFIDFModel() {
    // Collect all tokens across questions to build vocabulary
    const vocabSet = new Set();
    const docTokens = this.faqs.map(faq => {
      const tokens = this.tokenize(faq.question + " " + faq.category);
      tokens.forEach(t => vocabSet.add(t));
      return tokens;
    });

    this.vocabulary = Array.from(vocabSet);
    const N = this.faqs.length;

    // Calculate Inverse Document Frequency (IDF) for each word
    const idfMap = {};
    this.vocabulary.forEach(word => {
      let docCount = docTokens.filter(tokens => tokens.includes(word)).length;
      idfMap[word] = Math.log((N + 1) / (docCount + 1)) + 1; // Smooth IDF formula
    });

    this.idfMap = idfMap;

    // Calculate TF-IDF Vector for each FAQ document
    this.tfidfMatrix = docTokens.map(tokens => {
      return this.vectorize(tokens);
    });
  }

  // Turn token array into TF-IDF vector
  vectorize(tokens) {
    const termFreq = {};
    tokens.forEach(t => {
      termFreq[t] = (termFreq[t] || 0) + 1;
    });

    const totalTokens = tokens.length || 1;
    return this.vocabulary.map(word => {
      const tf = (termFreq[word] || 0) / totalTokens;
      const idf = this.idfMap[word] || 0;
      return tf * idf;
    });
  }

  // Compute Cosine Similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
  }

  // Step 3: Match User Query with Best FAQ
  findBestMatch(userQuery) {
    const userTokens = this.tokenize(userQuery);
    if (userTokens.length === 0) {
      return { faq: null, confidence: 0 };
    }

    const userVector = this.vectorize(userTokens);
    let bestScore = -1;
    let bestFaq = null;

    this.tfidfMatrix.forEach((faqVector, idx) => {
      const score = this.cosineSimilarity(userVector, faqVector);
      if (score > bestScore) {
        bestScore = score;
        bestFaq = this.faqs[idx];
      }
    });

    return { faq: bestFaq, confidence: bestScore };
  }

  bindEvents() {
    if (this.sendChatBtn) {
      this.sendChatBtn.addEventListener('click', () => this.handleSendMessage());
    }

    if (this.chatInput) {
      this.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSendMessage();
      });
    }
  }

  renderTopics() {
    if (!this.faqTopicsContainer) return;
    
    // Group unique questions for quick click
    this.faqTopicsContainer.innerHTML = `
      <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">RECOMMENDED QUESTIONS</div>
      ${this.faqs.slice(0, 6).map(faq => `
        <button class="faq-topic-btn" onclick="window.faqChatbotApp.askQuestion('${this.escapeHtml(faq.question)}')">
          💡 ${this.escapeHtml(faq.question)}
        </button>
      `).join('')}
    `;
  }

  askQuestion(questionText) {
    if (this.chatInput) {
      this.chatInput.value = questionText;
      this.handleSendMessage();
    }
  }

  handleSendMessage() {
    const query = this.chatInput.value.trim();
    if (!query) return;

    this.addUserMessage(query);
    this.chatInput.value = '';

    // Show typing state then respond
    setTimeout(() => {
      const result = this.findBestMatch(query);
      
      let responseText = "";
      let confidencePct = Math.round((result.confidence || 0) * 100);

      if (result.confidence > 0.15 && result.faq) {
        responseText = `${result.faq.answer}`;
        this.addBotMessage(responseText, confidencePct);
      } else {
        responseText = "I'm sorry, I couldn't find a high-confidence match for that specific question in my FAQ database. You can try rephrasing or selecting from the recommended FAQs on the left!";
        this.addBotMessage(responseText, confidencePct);
      }
    }, 400);
  }

  addUserMessage(text) {
    if (!this.chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-bubble user';
    msgDiv.textContent = text;
    this.chatMessages.appendChild(msgDiv);
    this.scrollToBottom();
  }

  addBotMessage(text, confidenceScore = null) {
    if (!this.chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-bubble bot';
    
    let htmlContent = `<div>${this.escapeHtml(text)}</div>`;
    if (confidenceScore !== null) {
      htmlContent += `<div class="confidence-tag">Match Confidence: ${confidenceScore}% (Cosine Similarity)</div>`;
    }

    msgDiv.innerHTML = htmlContent;
    this.chatMessages.appendChild(msgDiv);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.chatMessages) {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
  }

  escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.faqChatbotApp = new FAQChatbot();
});
