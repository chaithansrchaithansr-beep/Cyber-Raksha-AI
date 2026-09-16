import os
import json
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

def train_and_save_models():
    os.makedirs("ml-models/phishing", exist_ok=True)
    os.makedirs("ml-models/scam_detection", exist_ok=True)
    os.makedirs("ml-models/clustering", exist_ok=True)

    # 1. URL Phishing Model
    # Features: [length, subdomains, is_ip, entropy, keywords_count, has_https]
    X_url = np.array([
        [22, 1, 0, 3.2, 0, 1], # google.com
        [25, 1, 0, 3.1, 0, 1], # amazon.in
        [20, 1, 0, 2.9, 0, 1], # wikipedia.org
        [28, 1, 0, 3.4, 0, 1], # onlinesbi.sbi
        [18, 1, 0, 2.8, 0, 1], # hdfcbank.com
        [85, 4, 1, 4.6, 3, 0], # 192.168.1.1/sbi/login.php
        [92, 3, 0, 4.5, 4, 0], # secure-sbi-kyc-update.xyz
        [68, 3, 0, 4.3, 2, 0], # verify-pan-aadhaar-block.top
        [75, 4, 0, 4.4, 3, 0], # paytm-cashback-claim-now.xyz
        [88, 3, 0, 4.7, 3, 0]  # electricity-bill-discom-pay.work
    ])
    y_url = np.array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1])

    rf_url_model = RandomForestClassifier(n_estimators=50, random_state=42)
    rf_url_model.fit(X_url, y_url)

    joblib.dump(rf_url_model, "ml-models/phishing/model.joblib")
    with open("ml-models/phishing/feature_schema.json", "w") as f:
        json.dump({
            "features": ["url_length", "subdomains", "is_ip", "entropy", "keywords_count", "has_https"],
            "version": "1.4.2",
            "model_type": "RandomForestClassifier"
        }, f, indent=2)

    # 2. Text Scam Detection NLP Model
    scam_texts = [
        "Your package has been delivered to your front porch. Thank you.",
        "Meeting confirmed for 3 PM tomorrow in the main conference room.",
        "Your monthly mobile bill of Rs 499 is ready for viewing.",
        "OTP for your transaction is 482910. Do not share with anyone.",
        "Happy birthday! Wishing you a wonderful year ahead.",
        "Dear customer your SBI account is suspended update KYC immediately at http://sbi.xyz",
        "Electricity will be disconnected tonight at 9:30 PM call officer 9876543210 immediately",
        "Earn Rs 5000 daily part time work from home just like youtube videos and send screenshot",
        "Enter UPI PIN to receive cashback of Rs 5000 in your google pay account now",
        "KBC lucky winner congratulations you won Rs 25 lakh lottery contact manager now"
    ]
    scam_labels = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]

    tfidf = TfidfVectorizer(ngram_range=(1, 2), max_features=500)
    X_text = tfidf.fit_transform(scam_texts)

    lr_text_model = LogisticRegression()
    lr_text_model.fit(X_text, scam_labels)

    joblib.dump(lr_text_model, "ml-models/scam_detection/model.joblib")
    joblib.dump(tfidf, "ml-models/scam_detection/vectorizer.joblib")
    with open("ml-models/scam_detection/labels.json", "w") as f:
        json.dump({
            "0": "Legitimate",
            "1": "Scam / Phishing"
        }, f, indent=2)

    # 3. Clustering config
    with open("ml-models/clustering/similarity_config.json", "w") as f:
        json.dump({
            "threshold": 0.35,
            "weights": {
                "threat_type": 0.40,
                "target_brand": 0.35,
                "jaccard_text": 0.25
            }
        }, f, indent=2)

    print("Machine learning models and schemas generated in ml-models/ successfully.")

if __name__ == "__main__":
    train_and_save_models()
