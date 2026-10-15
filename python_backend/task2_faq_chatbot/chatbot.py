"""
CodeAlpha AI Internship - Task 2: Chatbot for FAQs
Python implementation using NLTK preprocessing, TF-IDF, and Cosine Similarity.
"""

import os
import json
import re
import math

class FAQChatbot:
    def __init__(self, faq_file_path=None):
        if faq_file_path is None:
            faq_file_path = os.path.join(os.path.dirname(__file__), 'faqs.json')
        
        with open(faq_file_path, 'r', encoding='utf-8') as f:
            self.faqs = json.load(f)

        self.stop_words = set([
            'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'in', 'on', 'at',
            'to', 'for', 'from', 'with', 'by', 'about', 'of', 'and', 'or', 'what', 'how', 'why', 'do', 'i'
        ])
        
        self.use_sklearn = False
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity
            self.use_sklearn = True
            self.TfidfVectorizer = TfidfVectorizer
            self.cosine_similarity = cosine_similarity
            self._fit_sklearn()
        except ImportError:
            self._fit_custom_tfidf()

    def preprocess(self, text: str):
        """Tokenize, lowercase, and clean text."""
        words = re.findall(r'\b\w+\b', text.lower())
        return [w for w in words if w not in self.stop_words and len(w) > 1]

    def _fit_sklearn(self):
        corpus = [f"{faq['question']} {faq['category']}" for faq in self.faqs]
        self.vectorizer = self.TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

    def _fit_custom_tfidf(self):
        vocab_set = set()
        doc_tokens = []
        for faq in self.faqs:
            tokens = self.preprocess(f"{faq['question']} {faq['category']}")
            doc_tokens.append(tokens)
            vocab_set.update(tokens)

        self.vocab = list(vocab_set)
        N = len(self.faqs)
        
        # IDF
        self.idf = {}
        for word in self.vocab:
            df = sum(1 for tokens in doc_tokens if word in tokens)
            self.idf[word] = math.log((N + 1) / (df + 1)) + 1

        # TF-IDF vectors
        self.doc_vectors = [self._vectorize(tokens) for tokens in doc_tokens]

    def _vectorize(self, tokens):
        tf = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1
        length = len(tokens) or 1
        return [ (tf.get(w, 0) / length) * self.idf.get(w, 0) for w in self.vocab ]

    def get_response(self, user_query: str):
        if not user_query or not user_query.strip():
            return "Please type a question!", 0.0

        if self.use_sklearn:
            query_vec = self.vectorizer.transform([user_query])
            similarities = self.cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            best_idx = similarities.argmax()
            best_score = float(similarities[best_idx])
        else:
            query_tokens = self.preprocess(user_query)
            query_vec = self._vectorize(query_tokens)
            best_score = -1.0
            best_idx = 0
            for idx, doc_vec in enumerate(self.doc_vectors):
                # Cosine similarity
                dot = sum(a * b for a, b in zip(query_vec, doc_vec))
                norm_a = math.sqrt(sum(a * a for a in query_vec))
                norm_b = math.sqrt(sum(b * b for b in doc_vec))
                score = dot / (norm_a * norm_b) if norm_a > 0 and norm_b > 0 else 0.0
                if score > best_score:
                    best_score = score
                    best_idx = idx

        if best_score > 0.15:
            return self.faqs[best_idx]['answer'], best_score
        else:
            return "I am sorry, I couldn't find a matching answer for that question in my database.", best_score


def main():
    print("==================================================")
    print("  CodeAlpha AI Internship - Task 2: FAQ Chatbot  ")
    print("==================================================")

    chatbot = FAQChatbot()

    print("\nAsk any question (type 'exit' to quit):")
    while True:
        query = input("\nUser: ").strip()
        if query.lower() == 'exit':
            break

        answer, confidence = chatbot.get_response(query)
        print(f"Bot : {answer} [Confidence: {confidence:.2%}]")


if __name__ == "__main__":
    main()
