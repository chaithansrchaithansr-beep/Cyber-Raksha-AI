import re
from typing import Dict, Any, List, Tuple

SCAM_PATTERNS = {
    "UPI Scam": [
        r"(?:enter|share|type)\s+(?:your\s+)?upi\s*pin.{0,20}to\s*receive",
        r"receive\s*(?:rs\.?|inr|\$)?\s*\d+.*(?:click|scan|upi|phonepe|gpay|paytm)",
        r"(?:gpay|phonepe|paytm|bhim)\s*(?:cashback|reward).*credited",
        r"(?:cashback|reward)\s*(?:of\s*)?(?:rs\.?|inr|\$)?\s*\d+.*(?:phonepe|gpay|paytm|claim)",
        r"send\s*(?:rs\.?|inr|\$)?\s*\d+.*to\s*receive\s*(?:rs\.?|inr|\$)?\s*\d+",
        r"upi\s*refund\s*initiated"
    ],
    "KYC Scam": [
        r"kyc\s*(?:pending|expired|suspended|update|block)",
        r"pan\s*card\s*(?:not\s*linked|link\s*immediately|update)",
        r"account\s*will\s*be\s*(?:blocked|deactivated|suspended)\s*(?:today|within|immediately)",
        r"dear\s*customer.*(?:sbi|hdfc|icici|pnb).*kyc",
        r"download\s*apk\s*to\s*update\s*kyc"
    ],
    "Electricity Bill Scam": [
        r"electricity\s*(?:bill|power|line)\s*will\s*be\s*disconnected",
        r"light\s*will\s*be\s*cut\s*(?:tonight|at\s*\d+\s*(?:pm|am))",
        r"contact\s*electricity\s*officer",
        r"previous\s*month\s*bill\s*not\s*updated"
    ],
    "Fake Job Scam": [
        r"(?:part\s*time|work\s*from\s*home|wfh)\s*job",
        r"earn\s*(?:rs\.?|inr|\$)?\s*\d+[\s-]*(?:to|\-)?[\s-]*\d+\s*(?:daily|per\s*day|monthly)",
        r"(?:like|subscribe)\s*youtube\s*(?:videos|channels)",
        r"hotel\s*review.*earn\s*money",
        r"telegram\s*task\s*group",
        r"initial\s*registration\s*fee"
    ],
    "Lottery Scam": [
        r"(?:kbc|kaun\s*banega\s*crorepati)\s*(?:lottery|winner|prize)",
        r"congratulations.*won\s*(?:rs\.?|inr|\$)?\s*\d+.*lakh",
        r"lucky\s*(?:draw|customer|winner)",
        r"claim\s*your\s*(?:car|cash|prize)\s*now"
    ],
    "Courier Scam": [
        r"(?:fedex|dhl|bluedart|customs)\s*parcel",
        r"package\s*(?:seized|confiscated|illegal|narcotics|drugs)",
        r"customs\s*duty\s*unpaid",
        r"mumbai\s*police.*parcel",
        r"digital\s*arrest"
    ],
    "Customer Support / Remote Access Scam": [
        r"install\s*(?:anydesk|teamviewer|rustdesk|quicksupport)",
        r"call\s*customer\s*care\s*toll\s*free",
        r"support\s*executive\s*screen\s*share",
        r"refund\s*of\s*(?:ticket|order|booking)"
    ]
}

URGENCY_KEYWORDS = [
    "immediately", "urgent", "tonight", "within 24 hours", "action required",
    "final warning", "terminated", "suspended", "blocked", "legal action",
    "arrest warrant", "police", "fir", "freeze"
]

import os
import joblib

class TextScamClassifier:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.model_loaded = False
        for prefix in ["ml-models/scam_detection", "../ml-models/scam_detection"]:
            m_path = os.path.join(prefix, "model.joblib")
            v_path = os.path.join(prefix, "vectorizer.joblib")
            if os.path.exists(m_path) and os.path.exists(v_path):
                try:
                    self.model = joblib.load(m_path)
                    self.vectorizer = joblib.load(v_path)
                    self.model_loaded = True
                    break
                except Exception:
                    pass

    def analyze(self, text: str) -> Dict[str, Any]:
        cleaned = text.lower()
        matched_categories = []
        matched_indicators = []
        rule_score = 0.0

        for category, patterns in SCAM_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, cleaned):
                    matched_categories.append(category)
                    rule_score += 50.0
                    matched_indicators.append(f"Matched {category} signature pattern")
                    break

        found_urgency = [w for w in URGENCY_KEYWORDS if w in cleaned]
        if found_urgency:
            rule_score += min(25.0, len(found_urgency) * 15.0)
            matched_indicators.append(f"High urgency manipulation words detected: {', '.join(found_urgency[:3])}")

        # Check for external shortlinks / suspicious URLs
        if re.search(r'(?:bit\.ly|t\.co|tinyurl|is\.gd|cutt\.ly|rb\.gy|\.apk|wa\.me|t\.me)', cleaned):
            rule_score += 25.0
            matched_indicators.append("Contains masked shortlink, Telegram channel link, or direct APK download")

        # Check for financial requests
        if re.search(r'(?:pay\s*rs|send\s*money|transfer\s*funds|fee\s*of\s*rs|deposit|cashback|rs\.?\s*\d+)', cleaned):
            rule_score += 15.0
            matched_indicators.append("Explicit request for monetary transfer or lure amount")

        primary_threat = matched_categories[0] if matched_categories else ("General Phishing / Social Engineering" if rule_score > 30 else "Normal / Low Risk Message")

        # Evaluate with ML model if loaded
        analysis_method = "Rule-Based Defensive Security Analysis"
        if self.model_loaded and self.model and self.vectorizer:
            try:
                tfidf_vec = self.vectorizer.transform([text])
                ml_prob = float(self.model.predict_proba(tfidf_vec)[0][1])
                # Combine ML probability with rule indicators
                probability = min(0.98, max(0.05, round((ml_prob * 0.6) + ((rule_score / 100.0) * 0.4), 3)))
                analysis_method = "Multilingual Scam NLP (TF-IDF + LogisticRegression v2.1.0)"
            except Exception:
                probability = min(0.98, max(0.05, rule_score / 100.0))
                analysis_method = "Rule-Based Defensive Security Analysis"
        else:
            probability = min(0.98, max(0.05, rule_score / 100.0))

        recommendations = []
        if "UPI Scam" in matched_categories:
            recommendations.append("NEVER enter your UPI PIN to receive money. UPI PIN is solely used for deducting funds.")
        if "Electricity Bill Scam" in matched_categories:
            recommendations.append("Electricity boards never disconnect supply via SMS/WhatsApp warning. Contact your official DISCOM office.")
        if "Fake Job Scam" in matched_categories:
            recommendations.append("Legitimate companies never demand upfront fees or task deposits for remote employment.")
        if "KYC Scam" in matched_categories:
            recommendations.append("Banks never ask for PAN/Aadhaar updates or OTPs via SMS links. Visit your official branch or mobile banking app.")
        if "Courier Scam" in matched_categories:
            recommendations.append("Police and customs never conduct 'Digital Arrests' over Skype/WhatsApp video calls. Report immediately to 1930.")

        if not recommendations:
            if rule_score > 40:
                recommendations.append("Do not click any embedded links or respond to this message. Report to the national cybercrime portal.")
            else:
                recommendations.append("Message appears benign. Maintain vigilance and never share sensitive OTPs or passwords.")

        return {
            "threat_type": primary_threat,
            "all_matched_categories": list(set(matched_categories)),
            "probability": probability,
            "indicators": matched_indicators,
            "recommendations": recommendations,
            "urgency_detected": bool(found_urgency),
            "analysis_method": analysis_method
        }

text_scam_classifier = TextScamClassifier()
