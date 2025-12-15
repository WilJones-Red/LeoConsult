
import csv
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from difflib import SequenceMatcher

app = Flask(__name__)
CORS(app)

# Load FAQs from CSV
FAQ_PATH = os.path.join(os.path.dirname(__file__), '..', 'chat', 'leo_support_agent', 'data', 'faq_seed.csv')
faqs = []
with open(FAQ_PATH, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        faqs.append({'question': row['question'], 'answer': row['answer']})

def find_best_faq(user_message):
    user_message = user_message.lower()
    best_score = 0
    best_answer = None
    for faq in faqs:
        score = SequenceMatcher(None, user_message, faq['question'].lower()).ratio()
        if score > best_score:
            best_score = score
            best_answer = faq['answer']
    # Threshold for a good match
    if best_score > 0.5:
        return best_answer
    return "I'm not sure about that. I'll escalate your question to a human specialist."

@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.get_json()
    user_message = data.get('message', '')
    response = find_best_faq(user_message)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
