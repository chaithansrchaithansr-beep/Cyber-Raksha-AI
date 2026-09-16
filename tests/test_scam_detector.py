import pytest
from app.ml.text_scam_classifier import text_scam_classifier

def test_upi_scam_detection():
    message = "Enter your UPI PIN to receive cashback of Rs 5,000 immediately in your PhonePe account!"
    result = text_scam_classifier.analyze(message)
    assert "UPI Scam" in result["all_matched_categories"] or result["threat_type"] == "UPI Scam"
    assert result["probability"] >= 0.60
    assert any("NEVER enter your UPI PIN" in r for r in result["recommendations"])

def test_electricity_bill_scam_detection():
    message = "Dear consumer your electricity power will be disconnected tonight at 9:30 PM. Call officer immediately."
    result = text_scam_classifier.analyze(message)
    assert "Electricity Bill Scam" in result["all_matched_categories"] or result["threat_type"] == "Electricity Bill Scam"
    assert result["urgency_detected"] is True

def test_benign_message_detection():
    message = "Hey team, the project status meeting is scheduled for 10 AM tomorrow in Room B."
    result = text_scam_classifier.analyze(message)
    assert result["probability"] < 0.35
    assert len(result["all_matched_categories"]) == 0
