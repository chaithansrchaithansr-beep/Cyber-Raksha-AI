import pytest
from app.services.pii_sanitizer import pii_sanitizer

def test_phone_and_email_masking():
    raw = "Contact scammer at 9876543210 or email hacker@gmail.com for refund."
    sanitized, detected = pii_sanitizer.sanitize(raw)
    assert "9876543210" not in sanitized
    assert "hacker@gmail.com" not in sanitized
    assert "Phone Number" in detected
    assert "Email Address" in detected

def test_aadhaar_and_card_masking():
    raw = "My Aadhaar is 1234 5678 9012 and card is 4111-2222-3333-4444."
    sanitized, detected = pii_sanitizer.sanitize(raw)
    assert "1234 5678 9012" not in sanitized
    assert "XXXX-XXXX-9012" in sanitized
    assert "4111-2222-3333-4444" not in sanitized
    assert "****-****-****-4444" in sanitized

def test_otp_and_password_masking():
    raw = "Your OTP is 984210 and password: MySecretPassword123"
    sanitized, detected = pii_sanitizer.sanitize(raw)
    assert "984210" not in sanitized
    assert "MySecretPassword123" not in sanitized
    assert "[REDACTED OTP]" in sanitized
