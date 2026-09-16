import math
import re
import urllib.parse
from typing import Dict, Any, List, Tuple

SUSPICIOUS_KEYWORDS = [
    "login", "signin", "verify", "update", "bank", "sbi", "hdfc", "icici", "pnb",
    "kyc", "secure", "account", "refund", "pan", "aadhaar", "free", "gift",
    "bonus", "wallet", "paytm", "phonepe", "gpay", "reward", "lottery", "claim",
    "support", "service", "password", "credential", "otp", "billing", "urgent",
    "disconnect", "electricity", "customs", "delivery", "parcel", "apk"
]

HIGH_RISK_TLDS = [
    ".xyz", ".top", ".work", ".buzz", ".fit", ".tk", ".ml", ".ga", ".cf",
    ".gq", ".cn", ".vip", ".loan", ".rest", ".racing", ".icu", ".cam"
]

KNOWN_BRANDS = {
    "sbi": ["sbi.co.in", "onlinesbi.sbi"],
    "hdfc": ["hdfcbank.com"],
    "icici": ["icicibank.com"],
    "paytm": ["paytm.com"],
    "phonepe": ["phonepe.com"],
    "google": ["google.com", "google.co.in"],
    "microsoft": ["microsoft.com"],
    "amazon": ["amazon.in", "amazon.com"],
    "flipkart": ["flipkart.com"],
    "india_post": ["indiapost.gov.in"]
}

def calculate_entropy(text: str) -> float:
    if not text:
        return 0.0
    freq = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    length = len(text)
    for count in freq.values():
        p = count / length
        entropy -= p * math.log2(p)
    return round(entropy, 2)

import os
import joblib

class UrlClassifier:
    def __init__(self):
        self.model = None
        self.model_loaded = False
        candidate_paths = [
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml-models", "phishing", "model.joblib"),
            os.path.join(os.path.dirname(__file__), "..", "..", "ml-models", "phishing", "model.joblib"),
            "ml-models/phishing/model.joblib",
            "../ml-models/phishing/model.joblib",
            "backend/ml-models/phishing/model.joblib"
        ]
        for path in candidate_paths:
            abs_p = os.path.abspath(path)
            if os.path.exists(abs_p):
                try:
                    self.model = joblib.load(abs_p)
                    self.model_loaded = True
                    break
                except Exception:
                    pass

    def extract_features(self, url: str) -> Dict[str, Any]:
        parsed = urllib.parse.urlparse(url if "://" in url else f"http://{url}")
        domain = parsed.netloc.lower().split(':')[0]
        path = parsed.path.lower()
        query = parsed.query.lower()

        subdomains = [s for s in domain.split('.') if s not in ['www', 'com', 'in', 'org', 'net', 'co']]
        subdomain_count = max(0, len(domain.split('.')) - 2)

        # Lookalike / Brand check
        brand_impersonation = None
        for brand, official_domains in KNOWN_BRANDS.items():
            if brand in domain and not any(domain.endswith(off) for off in official_domains):
                brand_impersonation = brand.upper()
                break

        # Check for IP address host
        is_ip = bool(re.match(r'^(?:\d{1,3}\.){3}\d{1,3}$', domain))

        # Check keyword matches
        found_keywords = []
        for kw in SUSPICIOUS_KEYWORDS:
            if kw in domain or kw in path or kw in query:
                found_keywords.append(kw)

        # Check high-risk TLD
        tld_match = any(domain.endswith(tld) for tld in HIGH_RISK_TLDS)

        # Entropy of domain
        domain_entropy = calculate_entropy(domain)

        # Hex / encoded characters in path/query
        encoded_chars = len(re.findall(r'%[0-9a-fA-F]{2}', url))

        return {
            "domain": domain,
            "url_length": len(url),
            "subdomain_count": subdomain_count,
            "subdomains": subdomains,
            "is_ip": is_ip,
            "found_keywords": found_keywords,
            "high_risk_tld": tld_match,
            "entropy": domain_entropy,
            "encoded_chars": encoded_chars,
            "brand_impersonation": brand_impersonation,
            "has_https": url.lower().startswith("https://")
        }

    def predict(self, url: str) -> Tuple[float, List[str], Dict[str, Any]]:
        features = self.extract_features(url)
        indicators = []
        rule_score = 0.0

        if features["is_ip"]:
            rule_score += 35.0
            indicators.append("IP-address-style host without legitimate domain name")

        if features["brand_impersonation"]:
            rule_score += 40.0
            indicators.append(f"Lookalike brand impersonation detected targeting {features['brand_impersonation']}")

        if features["subdomain_count"] >= 3:
            rule_score += 20.0
            indicators.append(f"Excessive subdomains count ({features['subdomain_count']}) indicating evasion attempt")

        if len(features["found_keywords"]) >= 2:
            rule_score += 25.0
            indicators.append(f"Suspicious credential/action keyword pattern: {', '.join(features['found_keywords'][:4])}")
        elif len(features["found_keywords"]) == 1:
            rule_score += 10.0
            indicators.append(f"Keyword match: '{features['found_keywords'][0]}'")

        if features["high_risk_tld"]:
            rule_score += 20.0
            indicators.append("Registered on high-risk generic top-level domain (gTLD)")

        if features["entropy"] > 4.2:
            rule_score += 15.0
            indicators.append(f"High domain character entropy ({features['entropy']}) indicating DGA or algorithmic generation")

        if features["url_length"] > 75:
            rule_score += 10.0
            indicators.append(f"Abnormally long URL string ({features['url_length']} characters)")

        if not features["has_https"]:
            rule_score += 10.0
            indicators.append("Insecure transmission protocol (HTTP instead of HTTPS)")

        # If trained Random Forest model is loaded, evaluate features
        if self.model_loaded and self.model:
            try:
                import numpy as np
                feature_vec = np.array([[
                    features["url_length"],
                    features["subdomain_count"],
                    1 if features["is_ip"] else 0,
                    features["entropy"],
                    len(features["found_keywords"]),
                    1 if features["has_https"] else 0
                ]])
                ml_prob = float(self.model.predict_proba(feature_vec)[0][1])
                # Combine ML probability with rule indicators, taking the higher risk signal
                probability = min(0.98, max(0.02, round(max(ml_prob, rule_score / 100.0), 3)))
                features["analysis_method"] = "Machine Learning Classifier (Random Forest v1.4.2)"
            except Exception:
                probability = min(0.98, max(0.02, rule_score / 100.0))
                features["analysis_method"] = "Rule-Based Defensive Security Analysis"
        else:
            probability = min(0.98, max(0.02, rule_score / 100.0))
            features["analysis_method"] = "Rule-Based Defensive Security Analysis"

        return probability, indicators, features

url_classifier = UrlClassifier()
