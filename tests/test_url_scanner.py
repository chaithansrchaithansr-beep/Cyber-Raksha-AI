import pytest
from app.ml.url_classifier import url_classifier
from app.services.scoring_engine import scoring_engine

def test_benign_url_detection():
    url = "https://www.google.com"
    prob, indicators, features = url_classifier.predict(url)
    assert prob < 0.30
    assert features["has_https"] is True
    assert features["is_ip"] is False

def test_phishing_url_detection():
    phish_url = "http://192.168.1.1/sbi-rewards-yono-update.xyz/login.php"
    prob, indicators, features = url_classifier.predict(phish_url)
    assert prob >= 0.70
    assert features["is_ip"] is True
    assert len(indicators) >= 2
    
    score, confidence, classification = scoring_engine.compute_weighted_score(
        ml_probability=prob,
        rule_penalty=prob * 100,
        brand_impersonated=True
    )
    assert score >= 70.0
    assert classification in ["HIGH RISK", "CRITICAL RISK"]
